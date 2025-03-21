import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

export default db;
