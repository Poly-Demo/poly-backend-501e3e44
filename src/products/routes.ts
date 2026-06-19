import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { productsService } from './service.js';

export async function productsRoutes(fastify: FastifyInstance) {
  const getAllProductsOpts: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              price: { type: 'number' },
              originalPrice: { type: 'number' },
              rating: { type: 'number' },
              image: { type: 'string' },
              category: { type: 'string' },
            },
          },
        },
      },
    },
  };

  fastify.get('/api/products', getAllProductsOpts, async () => {
    return productsService.getAll();
  });

  const getProductByIdOpts: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            rating: { type: 'number' },
            image: { type: 'string' },
            category: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  };

  fastify.get<{ Params: { id: string } }>(
    '/api/products/:id',
    getProductByIdOpts,
    async (request, reply) => {
      const id = parseInt(request.params.id, 10);
      const product = productsService.getById(id);
      if (!product) {
        reply.code(404);
        return { message: 'Product not found' };
      }
      return product;
    }
  );
}
