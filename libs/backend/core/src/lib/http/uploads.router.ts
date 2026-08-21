import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { HttpError } from '../errors.js';

const maximumFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const PresignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().refine((value) => allowedTypes.has(value), {
    message: 'Only JPEG, PNG, and PDF files are allowed',
  }),
  size: z.number().int().positive().max(maximumFileSize),
});

function objectKey(fileName: string) {
  const extension = extname(fileName)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
  return `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
}

export function createUploadsRouter(config: AppConfig) {
  const router = Router();
  const client = new S3Client({ region: config.awsRegion });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: maximumFileSize },
    fileFilter: (_request, file, callback) =>
      callback(null, allowedTypes.has(file.mimetype)),
  });

  function bucket() {
    if (!config.s3UploadBucket) {
      throw new HttpError(
        503,
        'S3 upload is not configured',
        'S3_NOT_CONFIGURED',
      );
    }
    return config.s3UploadBucket;
  }

  router.post('/presign', async (request, response) => {
    const input = PresignSchema.parse(request.body);
    const key = objectKey(input.fileName);
    const command = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    response.json({ data: { key, uploadUrl, expiresInSeconds: 300 } });
  });

  router.post('/', upload.single('file'), async (request, response) => {
    if (!request.file) {
      throw new HttpError(
        400,
        'Attach one allowed file as “file”',
        'FILE_REQUIRED',
      );
    }
    const key = objectKey(request.file.originalname);
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
