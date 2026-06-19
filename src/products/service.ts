import { Product } from './types.js';
import { ProductsRepository, productsRepository } from './repository.js';

export class ProductsService {
  constructor(private repo: ProductsRepository = productsRepository) {}

  getAll(): Product[] {
    return this.repo.findAll();
  }

  getById(id: number): Product | undefined {
    return this.repo.findById(id);
  }
}

export const productsService = new ProductsService();
