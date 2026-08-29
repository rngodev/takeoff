#!/usr/bin/env node
// Truncates every table in the public schema of the local dev database.
// Requires DATABASE_URL in the shell (same convention as `db:migrate`).
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Export it before running this script.");
  process.exit(1);
}

const host = new URL(databaseUrl).hostname;
const isLocal = host === "localhost" || host === "127.0.0.1";
if (!isLocal && !process.argv.includes("--force")) {
  console.error(
    `Refusing to truncate non-local database host "${host}". Pass --force to override.`,
  );
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  const tables = await sql`
    select tablename from pg_tables
    where schemaname = 'public'
  `;

  if (tables.length === 0) {
    console.log("No tables found in the public schema.");
  } else {
    const names = tables.map((t) => `"${t.tablename}"`).join(", ");
    await sql.unsafe(`truncate table ${names} restart identity cascade`);
    console.log(`Truncated ${tables.length} table(s): ${tables.map((t) => t.tablename).join(", ")}`);
  }
} finally {
  await sql.end();
}
