import { useState, type ReactNode } from "react";
import { Link } from "react-router";

export type Resolution = "correct" | "incorrect" | "void";

/* ---------- formatting ---------- */

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

/* ---------- page shell ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper font-sans text-body text-ink antialiased isolate">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function Logo() {
  return (
    <Link to="/" aria-label="Homepage" className="group inline-flex flex-col">
      <span className="font-display text-[30px] leading-none font-bold tracking-tight text-paper">
        Takeoff
      </span>
      <span
        aria-hidden="true"
        className="mt-1 h-1 w-8 bg-runway transition-[width] group-hover:w-full"
      />
    </Link>
  );
}

const navLinks = [
  { to: "/", label: "Takes" },
  { to: "/", label: "Pundits" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="bg-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Logo />
          <nav className="hidden sm:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="font-display text-[17px] font-semibold uppercase tracking-wide text-paper hover:text-runway transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            className="sm:hidden -mr-2 p-2 text-paper"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="square"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="sm:hidden border-t border-ink-muted px-4 py-3 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="font-display text-[17px] font-semibold uppercase tracking-wide text-paper"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-meta text-ink-muted hover:text-ink transition-colors"
    >
      <svg
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="square" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {children}
    </Link>
  );
}

/* ---------- people ---------- */

export function Avatar({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} rounded-pill object-cover outline-1 -outline-offset-1 outline-ink/10`}
      />
    );
  }
  return (
    <span
      className={`${className} rounded-pill bg-rule flex items-center justify-center font-display text-label text-ink`}
    >
      {name[0]}
    </span>
  );
}

export function PunditChip({
  to,
  name,
  image,
}: {
  to?: string;
  name: string;
  image: string | null;
}) {
  const className =
    "flex w-fit items-center gap-2 rounded-sm border border-rule-strong bg-paper-raised px-2.5 py-1.5";
  const inner = (
    <>
      <Avatar src={image} name={name} className="size-5 shrink-0" />
      <span className="text-meta text-ink">{name}</span>
    </>
  );
  return to ? (
    <Link to={to} className={`${className} transition-colors hover:border-ink`}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/* ---------- verdicts ---------- */

const verdict = {
  correct: { label: "Correct", glyph: "✓", className: "bg-correct text-paper" },
  incorrect: { label: "Incorrect", glyph: "✕", className: "bg-incorrect text-paper" },
  void: {
    label: "Void",
    glyph: "–",
    className: "border border-rule-strong text-ink-muted",
  },
} as const;

/** A square verdict stamp. Colour is always paired with a glyph and a word. */
export function VerdictBadge({ resolution }: { resolution: Resolution | null }) {
  if (!resolution)
    return (
      <span className="inline-flex items-center gap-1 text-meta text-ink-muted">
        <span aria-hidden="true">◷</span> Pending
      </span>
    );
  const v = verdict[resolution];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-display text-label uppercase whitespace-nowrap ${v.className}`}
    >
      <span aria-hidden="true">{v.glyph}</span>
      {v.label}
    </span>
  );
}

export function KindTag({ kind }: { kind: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-rule-strong px-1.5 py-0.5 font-display text-label uppercase text-ink-muted">
      {kind}
    </span>
  );
}

/* ---------- numbers ---------- */

export function StatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: ReactNode; tone?: "correct" }>;
}) {
  return (
    <dl className="grid grid-cols-3 rounded-md border border-rule divide-x divide-rule bg-paper-raised">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-4 sm:px-6 sm:py-5">
          <dt className="font-display text-label uppercase text-ink-muted">
            {s.label}
          </dt>
          <dd
            className={`mt-2 font-display text-stat tabular-nums ${s.tone === "correct" ? "text-correct" : "text-ink"}`}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Meter({
  pct,
  tone = "ink",
  children,
}: {
  pct: number;
  tone?: "ink" | "correct";
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-pill bg-rule overflow-hidden">
        <div
          className={`h-full rounded-pill transition-all ${tone === "correct" ? "bg-correct" : "bg-ink"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-meta tabular-nums text-ink-muted">{children}</span>
    </div>
  );
}

/* ---------- tables ---------- */

export type TakeRow = {
  id: string;
  slug: string;
  headline: string;
  kind: string;
  statedAt: string;
  resolutionOutcome: Resolution | null;
  pundit?: { slug: string; name: string; image: string | null };
};

export function TakesTable({ takes }: { takes: TakeRow[] }) {
  const th = "whitespace-nowrap py-2 pr-6 text-left font-display text-label uppercase text-ink-muted";
  return (
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={th}>Take</th>
              <th scope="col" className={th}>Kind</th>
              <th scope="col" className={th}>Date</th>
              <th scope="col" className={`${th} pr-0`}>Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {takes.map((take) => (
              <tr key={take.id}>
                <td className="min-w-64 py-4 pr-6">
                  <div className="flex items-start gap-3">
                    {take.pundit && (
                      <Avatar
                        src={take.pundit.image}
                        name={take.pundit.name}
                        className="size-8 mt-0.5 shrink-0"
                      />
                    )}
                    <div>
                      <Link
                        to={`/takes/${take.slug}`}
                        className="inline-block max-w-xs whitespace-normal text-body font-semibold text-ink text-pretty underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-runway"
                      >
                        {take.headline}
                      </Link>
                      {take.pundit && (
                        <p className="mt-0.5 text-meta text-ink-muted">
                          <Link
                            to={`/pundits/${take.pundit.slug}`}
                            className="hover:text-ink transition-colors"
                          >
                            {take.pundit.name}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6 align-top">
                  <KindTag kind={take.kind} />
                </td>
                <td className="py-4 pr-6 align-top whitespace-nowrap text-meta tabular-nums text-ink-muted">
                  {formatDate(take.statedAt)}
                </td>
                <td className="py-4 align-top">
                  <VerdictBadge resolution={take.resolutionOutcome} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
