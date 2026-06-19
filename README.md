# PolyShopping Backend

Fastify API for the **PolyShopping** demo. Plain single-project repo, no monorepo, no Nx.

This repo is one of the demo repos used to showcase [Polygraph](https://polygraph.dev) — coordinating changes across multiple repos.

## Stack

- Fastify 5 + `@fastify/cors`
- Postgres via [Drizzle ORM](https://orm.drizzle.team/) (`pg` driver) + `drizzle-kit` migrations
- Vitest (node env) for unit + integration tests
- TypeScript with `tsc -b`
- `tsx` for dev

## Requirements

- Node.js 20+
- npm 10+
- A Postgres database (use the Docker stack below, or run your own)

## Run (local dev)

Product data lives in Postgres. Start a database, apply migrations, seed the
catalog, then run the dev server.

```sh
npm install

# 1. Start a local Postgres (matches the default DATABASE_URL)
docker run -d --name polyshop-db \
  -e POSTGRES_USER=polyshop -e POSTGRES_PASSWORD=polyshop -e POSTGRES_DB=polyshop \
  -p 5432:5432 postgres:16-alpine

# 2. Apply migrations + seed the 8 products
npm run db:migrate
npm run db:seed

# 3. Run the API
npm run dev
```

The API listens on `http://localhost:3000` by default.

### Environment

| Var            | Default                                            | Notes                          |
| -------------- | -------------------------------------------------- | ------------------------------ |
| `DATABASE_URL` | `postgres://polyshop:polyshop@localhost:5432/polyshop` | Postgres connection string |
| `HOST`         | `localhost`                                        | Set to `0.0.0.0` in containers |
| `PORT`         | `3000`                                             | Listen port                    |

```sh
HOST=0.0.0.0 PORT=3001 npm run dev
```

## Run (full stack via Docker)

`docker-compose.yml` (repo root) brings up Postgres, this backend, and the
frontend. The backend container automatically runs migrations + seed before
serving (see `docker-entrypoint.sh`).

```sh
docker compose up --build
```

- Postgres → `localhost:5432`
- Backend  → `http://localhost:3000`
- Frontend → `http://localhost:5173`

> The `frontend` service builds from the sibling directory
> `../poly-frontend-501e3e44`, which must be checked out next to this repo and
> provide its own Dockerfile (multi-stage build serving the SPA via nginx on
> port 80). It receives `VITE_API_URL=http://localhost:3000` as a build arg.

## Scripts

| Script             | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | `tsx src/main.ts`                     |
| `npm run build`    | `tsc -b` → `dist/`                    |
| `npm start`        | `node dist/main.js`                   |
| `npm test`         | `vitest run` (16 tests)               |
| `npm run lint`     | `eslint .`                            |
| `npm run db:generate` | `drizzle-kit generate` (new migration from schema) |
| `npm run db:migrate`  | apply pending migrations           |
| `npm run db:seed`     | seed the 8-product catalog (idempotent) |

## Endpoints

- `GET /api/products` → `Product[]`
- `GET /api/products/:id` → `Product` or `404`

## Project layout

```
src/
  main.ts                       Fastify boot + listen
  app/app.ts                    plugin: CORS + route registration
  app/app.spec.ts               integration test against the app plugin
  db/
    schema.ts                   Drizzle `products` table schema
    client.ts                   pg Pool + drizzle client (DATABASE_URL)
    migrate.ts                  applies SQL migrations (db:migrate)
    seed.ts                     idempotent catalog seed (db:seed)
  products/
    routes.ts                   GET /api/products and /:id
    service.ts                  ProductsService (async)
    repository.ts               ProductsRepository — queries Postgres via Drizzle
    types.ts                    Product interface
    *.spec.ts                   colocated unit tests
drizzle/                        generated SQL migrations + metadata
drizzle.config.ts               drizzle-kit config
Dockerfile                      multi-stage build (build → slim runtime)
docker-entrypoint.sh            migrate → seed → serve
docker-compose.yml              db + backend + frontend
```

## Frontend contract

The `Product` shape lives in `src/products/types.ts`. Keep it in sync with [`poly-frontend`](https://github.com/juristr/poly-frontend) (`src/lib/data-access-products.ts`).
