import {
  productInclude,
  serializeProduct,
  type ProductWithRelations,
} from '../catalog/catalog.serialize.js';

export { productInclude };

/** Admin view of a product: the public DTO plus editable internals. */
export function serializeAdminProduct(p: ProductWithRelations) {
  return {
    ...serializeProduct(p),
    categoryId: p.categoryId,
    brandId: p.brandId,
    trackInventory: p.trackInventory,
    inventoryQty: p.inventoryQty,
    position: p.position,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export type AdminProductDTO = ReturnType<typeof serializeAdminProduct>;
