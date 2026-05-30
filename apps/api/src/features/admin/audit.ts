import type { FastifyRequest } from 'fastify';
import { Prisma, prisma } from '../../infrastructure/prisma.js';

export interface AuditEntry {
  action: string; // e.g. "product.create", "order.status.update"
  entityType: string; // e.g. "Product", "Order"
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Append-only admin audit trail. Actor is taken from the verified JWT; the
 * internal service token has no backing User row, so actorId is left null.
 */
export async function recordAudit(req: FastifyRequest, entry: AuditEntry): Promise<void> {
  const auth = req.auth;
  await prisma.auditLog.create({
    data: {
      actorId: auth && !auth.service ? auth.userId : null,
      actorEmail: auth?.email ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? Prisma.JsonNull,
      ipAddress: req.ip,
    },
  });
}
