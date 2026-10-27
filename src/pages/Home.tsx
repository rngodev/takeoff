import { useEffect, useState } from "react";
import {
  PageShell,
  PunditChip,
  StatGrid,
  TakesTable,
  type Resolution,
} from "../components/ui";

type Take = {
  id: string;
  slug: string;
  headline: string;
  kind: "objective" | "subjective";
  statedAt: string;
  punditId: string;
  punditSlug: string;
  punditName: string;
  punditImage: string | null;
  resolutionOutcome: Resolution | null;
};

export default function Home() {
  const [takes, setTakes] = useState<Take[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/takes")
      .then((r) => r.json<{ takes: Take[] }>())
      .then((data) => setTakes(data.takes))
      .finally(() => setLoading(false));
  }, []);

  const uniquePundits = Array.from(
    new Map(
      takes.map((t) => [
        t.punditId,
        {
          id: t.punditId,
          slug: t.punditSlug,
          name: t.punditName,
          image: t.punditImage,
        },
      ]),
    ).values(),
  );

  const stats = [
    { label: "Takes tracked", value: takes.length },
    {
      label: "Verified correct",
      value: takes.filter((t) => t.resolutionOutcome === "correct").length,
      tone: "correct" as const,
    },
    {
      label: "Pending verdict",
      value: takes.filter((t) => !t.resolutionOutcome).length,
    },
  ].map((s) => ({ ...s, value: loading ? "—" : s.value }));

  return (
    <PageShell>
      <h1 className="font-display text-headline text-ink text-balance sm:text-display">
        Every take gets a{" "}
        <span className="bg-[linear-gradient(var(--color-runway),var(--color-runway))] bg-size-[100%_40%] bg-bottom bg-no-repeat box-decoration-clone px-1">
          scorecard
        </span>
        .
      </h1>
      <p className="mt-3 max-w-[56ch] text-body text-ink-muted text-pretty">
        A running record of pundit takes — tracked, judged, and never forgotten.
      </p>

      {!loading && uniquePundits.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {uniquePundits.map((pundit) => (
            <PunditChip
              key={pundit.id}
              to={`/pundits/${pundit.slug}`}
              name={pundit.name.split(" ")[0]}
              image={pundit.image}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <StatGrid stats={stats} />
      </div>

      <div className="mt-8">
        <TakesTable
          takes={takes.map((t) => ({
            ...t,
            pundit: {
              slug: t.punditSlug,
              name: t.punditName,
              image: t.punditImage,
            },
          }))}
        />
      </div>
    </PageShell>
  );
}
