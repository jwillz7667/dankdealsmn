import { randomInt } from 'node:crypto';

/** Order number format from the prototype: "DD" + 6 digits. Collisions retried by the service. */
export function generateOrderNumber(): string {
  return `DD${randomInt(100_000, 1_000_000)}`;
}
