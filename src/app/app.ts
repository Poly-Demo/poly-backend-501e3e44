import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { productsRoutes } from '../products/routes.js';

export async function app(fastify: FastifyInstance) {
  await fastify.register(cors, { origin: true });
  await fastify.register(productsRoutes);
}
