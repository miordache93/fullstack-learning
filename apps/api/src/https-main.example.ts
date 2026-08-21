import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import type { Express } from 'express';

// Local/on-premise HTTPS example. In AWS, terminate TLS at CloudFront or the ALB.
export function listenWithHttps(app: Express, port = 3443) {
  return createServer(
    {
      key: readFileSync('./certs/localhost-key.pem'),
      cert: readFileSync('./certs/localhost-cert.pem'),
      minVersion: 'TLSv1.2',
    },
    app,
  ).listen(port);
}
