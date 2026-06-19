# PolyShopping Backend

Fastify API for the **PolyShopping** demo. Plain single-project repo, no monorepo, no Nx.

This repo is one of the demo repos used to showcase [Polygraph](https://polygraph.dev) — coordinating changes across multiple repos.

## Stack

- Fastify 5 + `@fastify/cors`
- Vitest (node env) for unit + integration tests
- TypeScript with `tsc -b`
- `tsx` for dev

## Requirements

- Node.js 20+
- npm 10+

## Run

```sh
npm install
npm run dev
```

The API listens on `http://localhost:3000` by default.

Override host or port:

```sh
HOST=0.0.0.0 PORT=3001 npm run dev
```

## Scripts

| Script          | What it does            |
| --------------- | ----------------------- |
| `npm run dev`   | `tsx src/main.ts`       |
| `npm run build` | `tsc -b` → `dist/`      |
| `npm start`     | `node dist/main.js`     |
| `npm test`      | `vitest run` (15 tests) |
| `npm run lint`  | `eslint .`              |

## Endpoints

- `GET /api/products` → `Product[]`
- `GET /api/products/:id` → `Product` or `404`

## Project layout

```
src/
  main.ts                       Fastify boot + listen
  app/app.ts                    plugin: CORS + route registration
  app/app.spec.ts               integration test against the app plugin
  products/
    routes.ts                   GET /api/products and /:id
    service.ts                  ProductsService
    repository.ts               in-memory store + ProductsRepository
    types.ts                    Product interface
    *.spec.ts                   colocated unit tests
```

## Frontend contract

The `Product` shape lives in `src/products/types.ts`. Keep it in sync with [`poly-frontend`](https://github.com/juristr/poly-frontend) (`src/lib/data-access-products.ts`).
