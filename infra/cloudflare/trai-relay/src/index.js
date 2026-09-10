const ALLOWED_HOST = 'www.trai.gov.in';
const MAX_REDIRECTS = 2;
const MAX_BODY_BYTES = 50 * 1024 * 1024;
const MAX_CLOCK_SKEW_SECONDS = 300;
const RELAY_PATH = '/fetch';

function json(body, status, relayError) {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (relayError) headers['x-claimradar-relay-error'] = relayError;
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function isAllowedTarget(target) {
  if (!target || !target.startsWith('/') || target.includes('://')) return false;
  let parsed;
  try {
    parsed = new URL(`https://${ALLOWED_HOST}${target}`);
  } catch {
    return false;
  }
  return (
    parsed.hostname === ALLOWED_HOST &&
    (parsed.pathname === '/rss.xml' || parsed.pathname.startsWith('/consumer/'))
  );
}

function canonicalMessage(timestamp, nonce, method, target) {
  return `${timestamp}\n${nonce}\n${method}\n${target}`;
}

async function signatureFor(timestamp, nonce, method, target, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(canonicalMessage(timestamp, nonce, method, target)),
  );
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function limitedBody(body) {
  if (!body) return null;
  const reader = body.getReader();
  let total = 0;
  return new ReadableStream({
    async pull(controller) {
      const chunk = await reader.read();
      if (chunk.done) {
        controller.close();
        return;
      }
      total += chunk.value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel('response too large');
        controller.error(new Error('Upstream response exceeds relay body limit'));
        return;
      }
      controller.enqueue(chunk.value);
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
}

function safeResponse(upstream) {
  const headers = new Headers();
  for (const name of ['content-type', 'content-length', 'etag', 'last-modified', 'location']) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('cache-control', 'no-store');
  headers.set('x-claimradar-transport', 'CLOUDFLARE_RELAY');
  return new Response(limitedBody(upstream.body), {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

async function fetchWithTimeout(fetchImpl, url, init, timeoutMs) {
  const controller = new AbortController();
  let timedOut = false;
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(Object.assign(new Error('upstream timeout'), { code: 'TIMEOUT' }));
    }, timeoutMs);
  });
  try {
    return await Promise.race([fetchImpl(url, { ...init, signal: controller.signal }), timeout]);
  } catch (error) {
    if (timedOut) throw Object.assign(new Error('upstream timeout'), { code: 'TIMEOUT' });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function handleRequest(request, env, fetchImpl = fetch) {
  const requestUrl = new URL(request.url);
  if (requestUrl.pathname !== RELAY_PATH) return json({ error: 'Not found' }, 404);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const target = requestUrl.searchParams.get('target');
  const timestamp = request.headers.get('x-claimradar-timestamp');
  const nonce = request.headers.get('x-claimradar-nonce');
  const providedSignature = request.headers.get('x-claimradar-signature');
  if (!isAllowedTarget(target) || !timestamp || !nonce || !providedSignature) {
    return json({ error: 'Invalid relay request' }, 400);
  }
  if (!/^\d+$/.test(timestamp) || !/^[A-Za-z0-9._-]{16,80}$/.test(nonce)) {
    return json({ error: 'Invalid relay credentials' }, 401);
  }
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > MAX_CLOCK_SKEW_SECONDS) {
    return json({ error: 'Expired relay request' }, 401);
  }
  if (typeof env?.RELAY_SHARED_SECRET !== 'string' || env.RELAY_SHARED_SECRET.length < 32) {
    return json({ error: 'Relay unavailable' }, 503);
  }
  const expectedSignature = await signatureFor(
    timestamp,
    nonce,
    request.method,
    target,
    env.RELAY_SHARED_SECRET,
  );
  if (
    !/^[a-f0-9]{64}$/.test(providedSignature) ||
    !constantTimeEqual(providedSignature, expectedSignature)
  ) {
    return json({ error: 'Invalid relay signature' }, 401);
  }

  let upstreamUrl = `https://${ALLOWED_HOST}${target}`;
  try {
    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
      const upstream = await fetchWithTimeout(
        fetchImpl,
        upstreamUrl,
        {
          method: request.method,
          redirect: 'manual',
          cache: 'no-store',
          headers: { 'User-Agent': 'ClaimRadar India/1.0' },
        },
        15_000,
      );
      if (upstream.status < 300 || upstream.status >= 400 || !upstream.headers.get('location')) {
        return safeResponse(upstream);
      }
      if (redirect === MAX_REDIRECTS)
        return json({ error: 'Too many redirects' }, 502, 'POLICY_BLOCKED');
      const nextUrl = new URL(upstream.headers.get('location'), upstreamUrl);
      if (
        nextUrl.protocol !== 'https:' ||
        nextUrl.hostname !== ALLOWED_HOST ||
        !isAllowedTarget(`${nextUrl.pathname}${nextUrl.search}`)
      ) {
        return json({ error: 'Redirect blocked' }, 502, 'POLICY_BLOCKED');
      }
      upstreamUrl = nextUrl.href;
      await upstream.body?.cancel();
    }
  } catch (error) {
    const code = error?.code === 'TIMEOUT' ? 'TIMEOUT' : 'NETWORK_ERROR';
    return new Response(JSON.stringify({ error: code }), {
      status: code === 'TIMEOUT' ? 504 : 502,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-claimradar-relay-error': code,
      },
    });
  }
  return json({ error: 'Relay failed' }, 502);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
