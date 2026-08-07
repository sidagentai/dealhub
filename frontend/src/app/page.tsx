import Link from "next/link";
import DealCard from "@/components/DealCard";
import { API_URL } from "@/lib/api";
import type { Deal, Page } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchLive(): Promise<{ deals: Deal[]; posters: number }> {
  try {
    const [feedRes, postersRes] = await Promise.all([
      fetch(`${API_URL}/feed?mode=trending&size=3`, { cache: "no-store" }),
      fetch(`${API_URL}/posters`, { cache: "no-store" }),
    ]);
    const feed: Page<Deal> = feedRes.ok
      ? await feedRes.json()
      : { items: [], page: 0, hasMore: false };
    const posters = postersRes.ok
      ? ((await postersRes.json()) as unknown[]).length
      : 0;
    return { deals: feed.items, posters };
  } catch {
    return { deals: [], posters: 0 };
  }
}

const FEATURES = [
  {
    title: "Follow the hunters",
    body: "Great deals come from people who hunt them daily, not from banner ads. Build a feed from posters whose taste you trust.",
  },
  {
    title: "Price history, built in",
    body: "Every price change is recorded from the moment a deal is posted. See the real discount, not the marketing one.",
  },
  {
    title: "Every click counted",
    body: "Posters see exactly how their deals perform — clicks, saves, top performers. An audience you can measure is an audience you can grow.",
  },
];

export default async function LandingPage() {
  const { deals, posters } = await fetchLive();

  return (
    <div className="flex flex-col gap-24 pb-16">
      {/* Hero */}
      <section className="pt-16 text-center sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tighter sm:text-6xl">
          Deals from people,
          <br />
          not algorithms.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-ink-dim sm:text-lg">
          DealHub is where deal hunters build a following. Follow posters with
          taste, watch real price history, and never wonder if a deal is
          actually a deal.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/feed" className="btn-primary px-6 !py-2.5 text-[0.95rem]">
            Browse deals
          </Link>
          <Link href="/signup" className="btn-ghost px-6 !py-2.5 text-[0.95rem]">
            Become a poster
          </Link>
        </div>
        {posters > 0 && (
          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-ink-faint">
            <span className="font-mono tabular-nums">{posters}</span> posters
            hunting deals right now
          </p>
        )}
      </section>

      {/* Live trending panel */}
      {deals.length > 0 && (
        <section className="relative">
          <div
            className="pointer-events-none absolute -inset-x-8 -top-16 -bottom-8 -z-10"
            style={{
              background:
                "radial-gradient(38rem 16rem at 50% 30%, #5e6ad222, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
              Trending right now
            </h2>
            <Link
              href="/feed"
              className="text-sm text-accent hover:underline"
            >
              See the full feed →
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-surface/60 p-4 shadow-[0_0_40px_#5e6ad214] backdrop-blur sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <div
              className="mb-4 h-px w-8 bg-accent"
              aria-hidden="true"
            />
            <h3 className="mb-2 font-medium tracking-tight">{f.title}</h3>
            <p className="text-sm leading-relaxed text-ink-dim">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight">
          Your next favorite deal is already posted.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
          Free to browse, free to follow. Posters keep full ownership of their
          affiliate links.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/feed" className="btn-primary px-6">
            Start browsing
          </Link>
          <Link href="/signup" className="btn-ghost px-6">
            Sign up
          </Link>
        </div>
      </section>

      <footer className="border-t border-line pt-6 text-center text-xs text-ink-faint">
        DealHub — a social deals platform. Built in the open at{" "}
        <a
          href="https://github.com/sidagentai/dealhub"
          className="text-ink-dim hover:text-ink"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/sidagentai/dealhub
        </a>
        .
      </footer>
    </div>
  );
}
