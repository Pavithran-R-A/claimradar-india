// Diagnostic-only TLS chain probe for https://www.cci.gov.in/rss.xml
// Strict certificate verification (Node defaults). NEVER disables TLS checks.
// Connects, performs the handshake only, and reports the presented chain.
import tls from 'node:tls';
import dns from 'node:dns/promises';

const host = 'www.cci.gov.in';
const port = 443;

const addresses = await dns.resolve4(host).catch(() => []);
console.log(`DNS A records for ${host}: ${addresses.join(', ') || '(none)'}`);

const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: true }, () => {
  const cert = socket.getPeerCertificate(true);
  console.log('TLS HANDSHAKE: OK (chain verified against system trust store)');
  let c = cert;
  const seen = new Set();
  while (c && !seen.has(c.fingerprint)) {
    seen.add(c.fingerprint);
    console.log(
      `  chain cert: subject="${c.subject?.CN}" issuer="${c.issuer?.CN}" validTo=${c.valid_to}`,
    );
    c = c.issuerCertificate;
  }
  socket.end();
  process.exit(0);
});

socket.on('error', (err) => {
  console.log(`TLS HANDSHAKE FAILED: ${err.code ?? ''} ${err.message}`);
  try {
    const cert = socket.getPeerCertificate(false);
    if (cert && Object.keys(cert).length > 0) {
      console.log(
        `  presented leaf: subject="${cert.subject?.CN}" issuer="${cert.issuer?.CN}" validTo=${cert.valid_to}`,
      );
      const chain = socket.getPeerCertificate(true);
      let c = chain;
      const seen = new Set();
      let depth = 0;
      while (c && !seen.has(c.fingerprint)) {
        seen.add(c.fingerprint);
        depth += 1;
        console.log(`  chain[${depth}]: subject="${c.subject?.CN}" issuer="${c.issuer?.CN}"`);
        c = c.issuerCertificate;
      }
      console.log(`  presented chain length: ${depth} (leaf only = intermediate missing)`);
    } else {
      console.log('  no peer certificate presented');
    }
  } catch {
    // certificate introspection is best-effort
  }
  process.exit(2);
});

setTimeout(() => {
  console.log('TLS probe timed out after 20s');
  process.exit(3);
}, 20_000);
