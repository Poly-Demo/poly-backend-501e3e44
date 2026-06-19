import { asc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { products, type ProductRow } from '../db/schema.js';
import { Product } from './types.js';

/**
 * Maps a DB row to the public `Product` shape. Drops `originalPrice` when it is
 * NULL so the JSON output omits the key entirely (matching the original
 * in-memory catalog, where undiscounted products had no `originalPrice`).
 */
function toProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    name: row.name,
    price: row.price,
    rating: row.rating,
    image: row.image,
    category: row.category,
  };
  if (row.originalPrice != null) {
    product.originalPrice = row.originalPrice;
  }
  return product;
}

export class ProductsRepository {
  async findAll(): Promise<Product[]> {
    const rows = await db.select().from(products).orderBy(asc(products.id));
    return rows.map(toProduct);
  }

  async findById(id: number): Promise<Product | undefined> {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return rows[0] ? toProduct(rows[0]) : undefined;
  }
}

export const productsRepository = new ProductsRepository();
