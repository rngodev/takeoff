import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  BackLink,
  KindTag,
  Meter,
  PageShell,
  PunditChip,
  StatGrid,
  TakesTable,
  VerdictBadge,
  formatDate,
  formatNumber,
  type Resolution,
} from "../components/ui";

const verdictDescription = {
  correct: "This take was verified as accurate.",
  incorrect: "This take did not hold up to scrutiny.",
  void: "This take was voided — the conditions needed to evaluate it never materialized.",
} as const;

type RelatedTake = {
  id: string;
  slug: string;
  headline: string;
  kind: "objective" | "subjective";
  statedAt: string;
  resolutionOutcome: Resolution | null;
};

type TakeData = {
  take: {
    id: string;
    slug: string;
    headline: string;
    kind: "objective" | "subjective";
    statedAt: string;
    source: string | null;
    pundit: {
      slug: string;
      name: string;
      image: string | null;
    };
    resolution: {
      outcome: Resolution;
      resolvedAt: string;
      notes: string | null;
    } | null;
    stats: {
      agree: number;
      disagree: number;
      boosts: number;
    };
  };
  moreTakes: RelatedTake[];
};

export default function Take() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<TakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/takes/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json<TakeData>();
      })
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && notFound) {
    return (
      <PageShell>
        <p className="text-body text-ink-muted">Take not found.</p>
      </PageShell>
    );
  }

  const take = data?.take;
  const moreTakes = data?.moreTakes ?? [];
  const total = (take?.stats.agree ?? 0) + (take?.stats.disagree ?? 0);
  const agreePct = total > 0 ? Math.round(((take?.stats.agree ?? 0) / total) * 100) : 0;

  return (
    <PageShell>
      {take ? (
        <BackLink to={`/pundits/${take.pundit.slug}`}>{take.pundit.name}</BackLink>
      ) : (
        <BackLink to="/">All takes</BackLink>
      )}

      {loading ? (
        <div className="mt-8 text-meta text-ink-muted">Loading…</div>
      ) : take ? (
        <>
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <KindTag kind={take.kind} />
              <span className="text-meta text-ink-muted">
                {formatDate(take.statedAt)}
              </span>
              {take.source && (
                <>
                  <span className="text-ink-muted" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-meta text-ink-muted">{take.source}</span>
                </>
              )}
            </div>
            <h1 className="mt-3 max-w-[30ch] font-display text-headline text-ink text-balance">
              {take.headline}
            </h1>

            <div className="mt-4">
              <PunditChip
                to={`/pundits/${take.pundit.slug}`}
                name={take.pundit.name}
                image={take.pundit.image}
              />
            </div>
          </div>

          {take.resolution && (
            <div className="mt-8 rounded-md border border-rule bg-paper-raised px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <VerdictBadge resolution={take.resolution.outcome} />
                <span className="text-meta text-ink-muted">
                  Resolved {formatDate(take.resolution.resolvedAt)}
                </span>
              </div>
              <p className="mt-3 text-body text-ink text-pretty">
                {verdictDescription[take.resolution.outcome]}
              </p>
              {take.resolution.notes && (
                <p className="mt-2 text-body text-ink-muted text-pretty">
                  {take.resolution.notes}
                </p>
              )}
            </div>
          )}

          <div className="mt-8">
            <StatGrid
              stats={[
                { label: "Agreed", value: formatNumber(take.stats.agree) },
                { label: "Disagreed", value: formatNumber(take.stats.disagree) },
                { label: "Boosted", value: formatNumber(take.stats.boosts) },
              ]}
            />
          </div>

          {total > 0 && (
            <div className="mt-3">
              <Meter pct={agreePct}>{agreePct}% agreed</Meter>
            </div>
          )}

          {moreTakes.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-title text-ink">
                More from {take.pundit.name}
              </h2>
              <div className="mt-2">
                <TakesTable takes={moreTakes} />
              </div>
            </div>
          )}
        </>
      ) : null}
    </PageShell>
  );
}
