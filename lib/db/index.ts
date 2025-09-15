import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL!;

// Reuse client across hot reloads/lambda invocations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForDb = globalThis as any;

const client =
  globalForDb.__dbClient ||
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
  });

if (!globalForDb.__dbClient) {
  globalForDb.__dbClient = client;
}

const db = drizzle(client);

export default db;
