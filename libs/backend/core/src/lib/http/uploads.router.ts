import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { HttpError } from '../errors.js';

// WHY: Bound memory and API bandwidth for the proxy-upload teaching path.
const maximumFileSize = 10 * 1024 * 1024;
// BOUNDARY: Client MIME is allowlisted but is not proof of file content.
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const PresignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().refine((value) => allowedTypes.has(value), {
    message: 'Only JPEG, PNG, and PDF files are allowed',
  }),
  // WHY: Signed metadata and product policy share the same size ceiling.
  size: z.number().int().positive().max(maximumFileSize),
});

function objectKey(fileName: string) {
  // SECURITY: Preserve only a small sanitized extension, never the caller's path/name.
  const extension = extname(fileName)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
  // WHY: Random immutable keys avoid overwrite races and user-controlled object paths.
  return `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
}

export function createUploadsRouter(config: AppConfig) {
  const router = Router();
  // WHAT: In ECS, the default credential chain uses the task role—no static key in code.
  const client = new S3Client({ region: config.awsRegion });
  const upload = multer({
    // WHY: Memory storage is acceptable only because size and file count are tightly bounded.
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: maximumFileSize },
    // BOUNDARY: Reject MIME types outside the product allowlist.
    fileFilter: (_request, file, callback) => callback(null, allowedTypes.has(file.mimetype)),
  });

  function bucket() {
    // CHECK: Fail this capability explicitly rather than writing to an accidental bucket.
    if (!config.s3UploadBucket) {
      throw new HttpError(503, 'S3 upload is not configured', 'S3_NOT_CONFIGURED');
    }
    return config.s3UploadBucket;
  }

  router.post('/presign', async (request, response) => {
    // BOUNDARY: Validate the requested upload capability before signing it.
    const input = PresignSchema.parse(request.body);
    const key = objectKey(input.fileName);
    const command = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
    });
    // SECURITY: The five-minute URL is a narrowly scoped bearer capability.
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    response.json({ data: { key, uploadUrl, expiresInSeconds: 300 } });
  });

  router.post('/', upload.single('file'), async (request, response) => {
    // CHECK: Multer may accept the request while its configured field is absent.
    if (!request.file) {
      throw new HttpError(400, 'Attach one allowed file as “file”', 'FILE_REQUIRED');
    }
    const key = objectKey(request.file.originalname);
    // BOUNDARY: Proxy bytes through Node only for the small-file exercise.
    await client.send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: request.file.buffer,
        ContentType: request.file.mimetype,
      }),
    );
    response.status(201).json({ data: { key } });
  });

  return router;
}