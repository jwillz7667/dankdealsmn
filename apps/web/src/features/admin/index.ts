/**
 * Public surface for the admin feature.
 *
 * Server-only modules (`api.ts`, `server.ts`) are intentionally NOT re-exported
 * here so client components can import from the barrel without dragging in
 * `server-only` code. Import those directly where a Server Component needs them.
 */
export * from './types';
export * from './schema';
export * from './actions';

export { AdminNav } from './AdminNav';
export { DeleteButton } from './DeleteButton';
export { ProductForm } from './ProductForm';
export { ProductImageManager } from './ProductImageManager';
export { CategoryManager } from './CategoryManager';
export { BrandManager } from './BrandManager';
export { OrderStatusForm } from './OrderStatusForm';
