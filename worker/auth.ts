import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";

export function createAuth(env: CloudflareBindings) {
  const db = createDb(env);

  return betterAuth({
    appName: "takeoff",
    basePath: "/api/auth",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
    }),
    emailAndPassword: { enabled: true },
  });
}
