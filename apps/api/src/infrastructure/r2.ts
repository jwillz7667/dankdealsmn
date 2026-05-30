import { randomUUID } from 'node:crypto';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type AppConfig, isUploadsConfigured } from '../shared/config.js';
import { AppError } from '../shared/errors.js';

const ALLOWED = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresInSeconds: number;
}

export class R2Storage {
  private readonly client: S3Client;

  constructor(private readonly config: AppConfig) {
    if (!isUploadsConfigured(config)) {
      throw new Error('R2 is not configured (missing R2_* env vars)');
    }
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID!,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  /** Presigned PUT for a direct browser→R2 upload. Validates content type + size. */
  async presignUpload(input: {
    contentType: string;
    contentLength: number;
    prefix?: string;
  }): Promise<PresignResult> {
    const ext = ALLOWED.get(input.contentType);
    if (!ext) {
      throw AppError.unprocessable(`Unsupported image type: ${input.contentType}`);
    }
    if (input.contentLength <= 0 || input.contentLength > MAX_UPLOAD_BYTES) {
      throw AppError.unprocessable(`Image must be between 1 byte and ${MAX_UPLOAD_BYTES} bytes`);
    }

    const key = `${input.prefix ?? 'products'}/${randomUUID()}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.config.R2_BUCKET,
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    });

    const expiresInSeconds = 300;
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    return {
      uploadUrl,
      publicUrl: `${this.config.R2_PUBLIC_BASE_URL}/${key}`,
      key,
      expiresInSeconds,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.R2_BUCKET, Key: key }));
  }

  /** Derives the storage key from a stored public URL. */
  keyFromUrl(url: string): string | null {
    const base = this.config.R2_PUBLIC_BASE_URL;
    if (!base || !url.startsWith(base)) return null;
    return url.slice(base.length).replace(/^\//, '');
  }
}
