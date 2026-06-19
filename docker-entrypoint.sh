#!/bin/sh
# Container entrypoint: apply DB migrations, seed the catalog, then serve.
# The db service is already `service_healthy` (compose depends_on), so Postgres
# is accepting connections by the time this runs.
set -e

echo "[entrypoint] running migrations..."
node dist/db/migrate.js

echo "[entrypoint] seeding catalog..."
node dist/db/seed.js

echo "[entrypoint] starting server..."
exec node dist/main.js
