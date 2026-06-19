import { pgTable, integer, text, real } from 'drizzle-orm/pg-core';

/**
 * `products` table — mirrors the `Product` shape consumed by the frontend.
 *
 * Numeric columns use `real` (float4) rather than `numeric`/`decimal` so the
 * `pg` driver deserializes them to JS numbers (the `numeric` type would come
 * back as a string and change the JSON API output).
 */
export const products = pgTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  // Nullable — not every product is discounted.
  originalPrice: real('original_price'),
  rating: real('rating').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
