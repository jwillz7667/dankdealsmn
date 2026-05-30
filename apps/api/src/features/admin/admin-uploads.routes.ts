import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AppError } from '../../shared/errors.js';
import { PresignRequestSchema, PresignResponseSchema } from './admin.schema.js';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminUploadRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.post(
    '/admin/uploads/presign',
    {
      schema: {
        tags: ['admin'],
        body: PresignRequestSchema,
        response: { 200: PresignResponseSchema },
      },
    },
    async (req) => {
      const storage = app.services.storage;
      if (!storage) {
        throw AppError.unprocessable('Image uploads are not configured on this environment.');
      }
      return storage.presignUpload({
        contentType: req.body.contentType,
        contentLength: req.body.contentLength,
        prefix: req.body.prefix,
      });
    },
  );
}
