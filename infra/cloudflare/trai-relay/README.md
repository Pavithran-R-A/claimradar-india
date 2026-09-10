# ClaimRadar TRAI relay

This Worker fetches only official TRAI content.

The crawler tries TRAI directly first. It uses this relay only after bounded
`TIMEOUT`, `NETWORK_ERROR`, or DNS/connectivity failures.

## Deployment

Use a permanent Cloudflare account for CI/CD.

```powershell
npx wrangler@latest deploy --config infra/cloudflare/trai-relay/wrangler.jsonc
npx wrangler@latest secret put RELAY_SHARED_SECRET --config infra/cloudflare/trai-relay/wrangler.jsonc
```

Generate the secret locally. Never commit it.

Configure these staging secrets:

- `TRAI_RELAY_URL`: the Worker HTTPS `/fetch` endpoint
- `TRAI_RELAY_SHARED_SECRET`: the same secret value

The crawler rejects an incomplete configuration.

## Verification

Run the fixed-target probe from Node 24:

```powershell
node scripts/cloudflare-relay-probe.mjs
```

The probe requires five successful requests. It checks status, body content,
transport, timing, and official TRAI RSS bytes. It never prints credentials.

## Security boundary

The Worker accepts only signed GET or HEAD requests. It allows only the
official TRAI hostname and approved paths. Redirects remain HTTPS and official.
External targets, private addresses, metadata endpoints, unsupported methods,
missing authentication, and invalid signatures fail closed.

The Worker streams responses with a 50 MB limit. It disables caching and
preserves safe content headers. Upstream HTTP statuses remain unchanged.

Temporary Cloudflare accounts are for probes only. They are not release
infrastructure. Complete staging baseline and soak qualification separately.
