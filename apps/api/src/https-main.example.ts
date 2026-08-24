import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import type { Express } from 'express';

// WHAT: Demonstrate direct Node TLS without replacing the normal AWS entry point.
export function listenWithHttps(app: Express, port = 3443) {
  return createServer(
    {
      // SECRET: Load the private key at runtime; never commit or bake it into an image.
      key: readFileSync('./certs/localhost-key.pem'),
      // WHAT: Present the matching public certificate.
      cert: readFileSync('./certs/localhost-cert.pem'),
      // WHY: Refuse obsolete TLS protocol versions.
      minVersion: 'TLSv1.2',
    },
    // WHAT: Reuse the same Express application behind encrypted transport.
    app,
  ).listen(port);
}