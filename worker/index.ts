import { Hono } from "hono";
import { cors } from "hono/cors";
import * as Sentry from "@sentry/cloudflare";
import { and, count, desc, eq, isNull, ne } from "drizzle-orm";
import { createAuth } from "./auth";
import { createDb } from "./db";
import { takes, pundits, resolutions, positions, boosts } from "../db/schema";

type Bindings = CloudflareBindings;

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.BETTER_AUTH_URL,
    allowHeaders: ["Content-Type", "Authorization", "User-Agent"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return createAuth(c.env).handler(c.req.raw);
});

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.get("/api/takes", async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: takes.id,
      slug: takes.slug,
      headline: takes.headline,
      kind: takes.kind,
      statedAt: takes.statedAt,
      punditId: pundits.id,
      punditSlug: pundits.slug,
      punditName: pundits.name,
      punditImage: pundits.image,
      resolutionOutcome: resolutions.outcome,
    })
    .from(takes)
    .innerJoin(pundits, eq(takes.punditId, pundits.id))
    .leftJoin(
      resolutions,
      and(eq(resolutions.takeId, takes.id), isNull(resolutions.deletedAt)),
    )
    .where(and(isNull(takes.deletedAt), isNull(pundits.deletedAt)))
    .orderBy(desc(takes.statedAt));

  return c.json({ takes: rows });
});

app.get("/api/pundits/:slug", async (c) => {
  const db = createDb(c.env);
  const slug = c.req.param("slug");

  const [pundit] = await db
    .select()
    .from(pundits)
    .where(and(eq(pundits.slug, slug), isNull(pundits.deletedAt)))
    .limit(1);

  if (!pundit) return c.json({ error: "Not found" }, 404);

  const punditTakes = await db
    .select({
      id: takes.id,
      slug: takes.slug,
      headline: takes.headline,
      kind: takes.kind,
      statedAt: takes.statedAt,
      resolutionOutcome: resolutions.outcome,
    })
    .from(takes)
    .leftJoin(
      resolutions,
      and(eq(resolutions.takeId, takes.id), isNull(resolutions.deletedAt)),
    )
    .where(and(eq(takes.punditId, pundit.id), isNull(takes.deletedAt)))
    .orderBy(desc(takes.statedAt));

  const correct = punditTakes.filter(
    (t) => t.resolutionOutcome === "correct",
  ).length;
  const incorrect = punditTakes.filter(
    (t) => t.resolutionOutcome === "incorrect",
  ).length;

  return c.json({
    pundit: {
      id: pundit.id,
      slug: pundit.slug,
      name: pundit.name,
      description: pundit.description,
      image: pundit.image,
      url: pundit.url,
      stats: {
        takes: punditTakes.length,
        correct,
        incorrect,
        pending: punditTakes.filter((t) => !t.resolutionOutcome).length,
      },
    },
    takes: punditTakes,
  });
});

app.get("/api/takes/:slug", async (c) => {
  const db = createDb(c.env);
  const slug = c.req.param("slug");

  const [row] = await db
    .select({
      id: takes.id,
      slug: takes.slug,
      headline: takes.headline,
      kind: takes.kind,
      statedAt: takes.statedAt,
      source: takes.source,
      punditId: pundits.id,
      punditSlug: pundits.slug,
      punditName: pundits.name,
      punditImage: pundits.image,
      resolutionOutcome: resolutions.outcome,
      resolutionNotes: resolutions.notes,
      resolutionCreatedAt: resolutions.createdAt,
    })
    .from(takes)
    .innerJoin(pundits, eq(takes.punditId, pundits.id))
    .leftJoin(
      resolutions,
      and(eq(resolutions.takeId, takes.id), isNull(resolutions.deletedAt)),
    )
    .where(
      and(
        eq(takes.slug, slug),
        isNull(takes.deletedAt),
        isNull(pundits.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return c.json({ error: "Not found" }, 404);

  const [[agreeResult], [disagreeResult], [boostResult], moreTakes] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(positions)
        .where(
          and(
            eq(positions.takeId, row.id),
            eq(positions.stance, "agree"),
            isNull(positions.deletedAt),
          ),
        ),
      db
        .select({ count: count() })
        .from(positions)
        .where(
          and(
            eq(positions.takeId, row.id),
            eq(positions.stance, "disagree"),
            isNull(positions.deletedAt),
          ),
        ),
      db
        .select({ count: count() })
        .from(boosts)
        .where(and(eq(boosts.takeId, row.id), isNull(boosts.deletedAt))),
      db
        .select({
          id: takes.id,
          slug: takes.slug,
          headline: takes.headline,
          kind: takes.kind,
          statedAt: takes.statedAt,
          resolutionOutcome: resolutions.outcome,
        })
        .from(takes)
        .leftJoin(
          resolutions,
          and(eq(resolutions.takeId, takes.id), isNull(resolutions.deletedAt)),
        )
        .where(
          and(
            eq(takes.punditId, row.punditId),
            isNull(takes.deletedAt),
            ne(takes.id, row.id),
          ),
        )
        .orderBy(desc(takes.statedAt))
        .limit(5),
    ]);

  return c.json({
    take: {
      id: row.id,
      slug: row.slug,
      headline: row.headline,
      kind: row.kind,
      statedAt: row.statedAt,
      source: row.source,
      pundit: {
        slug: row.punditSlug,
        name: row.punditName,
        image: row.punditImage,
      },
      resolution: row.resolutionOutcome
        ? {
            outcome: row.resolutionOutcome,
            resolvedAt: row.resolutionCreatedAt,
            notes: row.resolutionNotes,
          }
        : null,
      stats: {
        agree: agreeResult?.count ?? 0,
        disagree: disagreeResult?.count ?? 0,
        boosts: boostResult?.count ?? 0,
      },
    },
    moreTakes,
  });
});

export default Sentry.withSentry(
  (env: Bindings) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  }),
  app,
);
