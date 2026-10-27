import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Avatar,
  BackLink,
  Meter,
  PageShell,
  StatGrid,
  TakesTable,
  type Resolution,
} from "../components/ui";

type PunditData = {
  pundit: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    url: string | null;
    stats: {
      takes: number;
      correct: number;
      incorrect: number;
      pending: number;
    };
  };
  takes: Array<{
    id: string;
    slug: string;
    headline: string;
    kind: "objective" | "subjective";
    statedAt: string;
    resolutionOutcome: Resolution | null;
  }>;
};

export default function Pundit() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PunditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/pundits/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json<PunditData>();
      })
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && notFound) {
    return (
      <PageShell>
        <p className="text-body text-ink-muted">Pundit not found.</p>
      </PageShell>
    );
  }

  const pundit = data?.pundit;
  const takes = data?.takes ?? [];
  const { correct = 0, incorrect = 0 } = pundit?.stats ?? {};
  const resolved = correct + incorrect;
  const accuracyPct = resolved > 0 ? Math.round((correct / resolved) * 100) : null;

  return (
    <PageShell>
      <BackLink to="/">All takes</BackLink>

      {loading ? (
        <div className="mt-8 text-meta text-ink-muted">Loading…</div>
      ) : pundit ? (
        <>
          <div className="mt-6 flex items-start gap-5">
            <Avatar
              src={pundit.image}
              name={pundit.name}
              className="size-16 shrink-0 sm:size-20"
            />
            <div>
              <h1 className="font-display text-headline text-ink text-balance">
                {pundit.name}
              </h1>
              {pundit.description && (
                <p className="mt-2 max-w-[52ch] text-body text-ink-muted text-pretty">
                  {pundit.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <StatGrid
              stats={[
                { label: "Takes tracked", value: pundit.stats.takes },
                { label: "Verified correct", value: pundit.stats.correct, tone: "correct" },
                {
                  label: "Accuracy",
                  value: accuracyPct !== null ? `${accuracyPct}%` : "—",
                },
              ]}
            />
          </div>

          {accuracyPct !== null && (
            <div className="mt-3">
              <Meter pct={accuracyPct} tone="correct">
                {correct} of {resolved} resolved takes
              </Meter>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-title text-ink">Takes</h2>
            <div className="mt-2">
              <TakesTable takes={takes} />
            </div>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
