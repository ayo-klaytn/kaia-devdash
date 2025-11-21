import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const rawConnectionString = process.env.DATABASE_URL!;
const connectionString = rawConnectionString.startsWith("postgresql://")
  ? `postgres://${rawConnectionString.slice("postgresql://".length)}`
  : rawConnectionString;

// Reuse client across hot reloads/lambda invocations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForDb = globalThis as any;

const client =
  globalForDb.__dbClient ||
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
  });

if (!globalForDb.__dbClient) {
  globalForDb.__dbClient = client;
}

const db = drizzle(client);

export default db;
