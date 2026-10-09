import { useEffect, useState } from "react";
import { Link } from "react-router";

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
  resolutionOutcome: "correct" | "incorrect" | "void" | null;
};

const resolutionLabel = {
  correct: "Correct",
  incorrect: "Incorrect",
  void: "Void",
} as const;

const resolutionClass = {
  correct: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  incorrect: "bg-red-50 text-red-700 ring-red-600/20",
  void: "bg-gray-100 text-gray-600 ring-gray-500/20",
} as const;

function Avatar({
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
        className={`${className} rounded-full object-cover outline-1 -outline-offset-1 outline-black/5`}
      />
    );
  }
  return (
    <span
      className={`${className} rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600 outline-1 -outline-offset-1 outline-black/5`}
    >
      {name[0]}
    </span>
  );
}

function VerdictBadge({
  resolution,
}: {
  resolution: "correct" | "incorrect" | "void" | null;
}) {
  if (!resolution)
    return <span className="text-sm text-gray-400">Pending</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${resolutionClass[resolution]}`}
    >
      {resolutionLabel[resolution]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    },
    {
      label: "Pending verdict",
      value: takes.filter((t) => !t.resolutionOutcome).length,
    },
  ];

  return (
    <div className="min-h-dvh bg-zinc-50 font-geist antialiased isolate">
      <header className="bg-zinc-950 border-b border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              to="/"
              aria-label="Homepage"
              className="font-marker text-3xl text-sky-400"
            >
              Takeoff
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm text-zinc-400 hover:text-sky-400 transition-colors"
              >
                Takes
              </Link>
              <Link
                to="/"
                className="text-sm text-zinc-400 hover:text-sky-400 transition-colors"
              >
                Pundits
              </Link>
            </nav>
            <button
              className="sm:hidden -mr-2 p-2 text-zinc-400"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden bg-zinc-950 border-t border-white/5 px-4 py-3 flex flex-col gap-3">
            <Link to="/" className="text-sm text-zinc-300">
              Takes
            </Link>
            <Link to="/" className="text-sm text-zinc-300">
              Pundits
            </Link>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 text-balance">
          Takeoff
        </h1>
        <p className="mt-2 max-w-[56ch] text-base text-zinc-500 text-pretty">
          A running record of pundit takes — tracked, judged, and never
          forgotten.
        </p>

        {!loading && uniquePundits.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {uniquePundits.map((pundit) => (
              <Link
                key={pundit.id}
                to={`/pundits/${pundit.slug}`}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 transition-colors hover:border-sky-300"
              >
                <Avatar
                  src={pundit.image}
                  name={pundit.name}
                  className="size-5 shrink-0"
                />
                <span className="text-sm text-zinc-700">
                  {pundit.name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        )}

        <dl className="mt-6 grid grid-cols-3 rounded-xl border border-zinc-200 divide-x divide-zinc-200 bg-white">
          {stats.map((stat, i) => (
            <div key={stat.label} className="px-6 py-5">
              <dt className="text-sm text-zinc-500">{stat.label}</dt>
              <dd
                className={`mt-1 text-3xl font-semibold tabular-nums ${i === 1 ? "text-sky-500" : "text-zinc-900"}`}
              >
                {loading ? "—" : stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="-mx-4 -my-2 mt-8 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3 pr-6 text-left text-sm font-medium text-zinc-500"
                  >
                    Take
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3 pr-6 text-left text-sm font-medium text-zinc-500"
                  >
                    Kind
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3 pr-6 text-left text-sm font-medium text-zinc-500"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3 text-left text-sm font-medium text-zinc-500"
                  >
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {takes.map((take) => (
                  <tr key={take.id}>
                    <td className="py-4 pr-6">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={take.punditImage}
                          name={take.punditName}
                          className="size-8 mt-0.5 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/takes/${take.slug}`}
                            className="text-sm font-medium text-zinc-900 hover:text-sky-600 text-pretty whitespace-normal max-w-xs inline-block transition-colors"
                          >
                            {take.headline}
                          </Link>
                          <p className="mt-0.5 text-sm text-zinc-500">
                            <Link
                              to={`/pundits/${take.punditSlug}`}
                              className="hover:text-sky-600 transition-colors"
                            >
                              {take.punditName}
                            </Link>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-sm text-zinc-500 capitalize">
                      {take.kind}
                    </td>
                    <td className="py-4 pr-6 text-sm tabular-nums text-zinc-500">
                      {formatDate(take.statedAt)}
                    </td>
                    <td className="py-4">
                      <VerdictBadge resolution={take.resolutionOutcome} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
