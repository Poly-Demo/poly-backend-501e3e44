import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Canonical fixture rows so the integration test runs without a real Postgres.
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

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: (_column: unknown, value: number) => ({ __eqId: value }),
  };
});

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

import { app } from './app.js';

describe('app', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify();
    await server.register(app);
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /api/products returns the catalog', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/products',
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /api/products/:id returns a single product', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/products/1',
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(1);
  });

  it('GET /api/products/:id returns 404 for unknown id', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/products/999',
    });
    expect(response.statusCode).toBe(404);
  });

  it('CORS headers are present', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/products',
      headers: { origin: 'http://localhost:4200' },
    });
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
