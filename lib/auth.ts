import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema"; // your drizzle instance
 
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {  
      enabled: true
  },
  trustedOrigins: ["http://localhost:3006", "https://devdash.kaia.io"],
});