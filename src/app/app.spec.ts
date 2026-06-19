import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
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
