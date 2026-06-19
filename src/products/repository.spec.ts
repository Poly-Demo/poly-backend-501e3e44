import { describe, it, expect, vi } from 'vitest';

// Fixture rows as they come back from the DB (note: `originalPrice` is `null`
// for undiscounted products, mirroring a nullable column).
const { mockRows } = vi.hoisted(() => ({
  mockRows: [
    {
      id: 1,
      name: 'Wireless Noise-Cancelling Headphones',
      price: 249.99,
      originalPrice: 299.99,
      rating: 4.8,
      image: 'a.jpg',
      category: 'Electronics',
    },
    {
      id: 2,
      name: 'Ultra HD Smart TV 55"',
      price: 699.99,
      originalPrice: null,
      rating: 2,
      image: 'b.jpg',
      category: 'Electronics',
    },
  ],
}));

// Capture the `eq(column, value)` id so the mock query builder can filter.
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: (_column: unknown, value: number) => ({ __eqId: value }),
  };
});

// Fake drizzle client: a chainable builder resolving to the fixture rows.
vi.mock('../db/client.js', () => {
  const makeBuilder = () => {
    let whereId: number | undefined;
    const builder: Record<string, unknown> = {
      from: () => builder,
      where: (cond: { __eqId: number }) => {
        whereId = cond.__eqId;
        return builder;
      },
      limit: () => Promise.resolve(mockRows.filter((r) => r.id === whereId)),
      orderBy: () => Promise.resolve(mockRows),
    };
    return builder;
  };
  return {
    db: { select: () => makeBuilder() },
    pool: { end: vi.fn() },
    DATABASE_URL: 'postgres://test',
  };
});

import { ProductsRepository, productsRepository } from './repository.js';

describe('ProductsRepository', () => {
  describe('findAll', () => {
    it('should return all products', async () => {
      const products = await productsRepository.findAll();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(mockRows.length);
    });

    it('should return products with correct structure', async () => {
      const products = await productsRepository.findAll();
      products.forEach((product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('rating');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('category');
      });
    });

    it('should omit originalPrice when the column is null', async () => {
      const products = await productsRepository.findAll();
      const discounted = products.find((p) => p.id === 1);
      const fullPrice = products.find((p) => p.id === 2);
      expect(discounted?.originalPrice).toBe(299.99);
      expect(fullPrice && 'originalPrice' in fullPrice).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      const product = await productsRepository.findById(1);
      expect(product).toBeDefined();
      expect(product?.id).toBe(1);
      expect(product?.name).toBe('Wireless Noise-Cancelling Headphones');
    });

    it('should return undefined for non-existent id', async () => {
      const product = await productsRepository.findById(999);
      expect(product).toBeUndefined();
    });
  });

  describe('instance creation', () => {
    it('should create new repository instance', async () => {
      const repo = new ProductsRepository();
      expect((await repo.findAll()).length).toBe(mockRows.length);
    });
  });
});
