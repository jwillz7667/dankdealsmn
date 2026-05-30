// Single Prisma client for the API, re-exported from the shared db package.
export { prisma, Prisma } from '@dankdeals/db';
export type {
  Product,
  Category,
  Brand,
  Order,
  OrderItem,
  PromoCode,
  StoreSettings,
  Review,
  Role,
} from '@dankdeals/db';
