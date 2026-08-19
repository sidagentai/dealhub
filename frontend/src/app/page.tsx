import Link from "next/link";
import DealCard from "@/components/DealCard";
import Reveal from "@/components/Reveal";
import { API_URL } from "@/lib/api";
import type { Deal, Page, PosterCard } from "@/lib/types";

export const dynamic = "force-dynamic";

interface LiveData {
  deals: Deal[];
  posters: number;
  dealCount: number;
  followers: number;
}

async function fetchLive(): Promise<LiveData> {
  try {
    const [feedRes, postersRes] = await Promise.all([
      fetch(`${API_URL}/feed?mode=trending&size=4`, { cache: "no-store" }),
      fetch(`${API_URL}/posters`, { cache: "no-store" }),
    ]);
    const feed: Page<Deal> = feedRes.ok
      ? await feedRes.json()
      : { items: [], page: 0, hasMore: false };
    const posters: PosterCard[] = postersRes.ok ? await postersRes.json() : [];
    return {
      deals: feed.items,
      posters: posters.length,
      dealCount: posters.reduce((n, p) => n + p.dealCount, 0),
      followers: posters.reduce((n, p) => n + p.followerCount, 0),
    };
  } catch {
    return { deals: [], posters: 0, dealCount: 0, followers: 0 };
  }
}

const FEATURES = [
  {
    label: "Follow",
    title: "Follow the hunters",
    body: "Great deals come from people who hunt them daily, not from banner ads. Build a feed from posters whose taste you trust — their finds land the moment they post, ranked by nothing but who you chose to follow.",
    wide: true,
  },
  {
    label: "History",
    title: "Price history, built in",
    body: "Every price change is recorded from the moment a deal is posted. See the real discount, not the marketing one.",
    wide: false,
  },
  {
    label: "Signal",
    title: "Every click counted",
    body: "Posters see exactly how their deals perform — clicks, saves, top performers. An audience you can measure is an audience you can grow.",
    wide: false,
  },
];

export default async function LandingPage() {
  const { deals, posters, dealCount, followers } = await fetchLive();
  const [featured, ...rest] = deals;

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Split hero: headline left, live column right */}
      <section className="grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-12 bg-bg p-8 sm:p-12 lg:col-span-7">
          <div>
            <p className="meta mb-8">A social deals platform</p>
            <h1 className="font-display text-balance text-5xl font-medium leading-[1.02] tracking-tight sm:text-7xl">
              Deals from <em className="text-accent">people</em>, not
              algorithms.
            </h1>
          </div>
          <div>
            <p className="mb-8 max-w-md text-[0.95rem] leading-relaxed text-ink-dim">
              Follow posters with taste, watch real price history, and never
              wonder if a deal is actually a deal.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/feed" className="btn-primary px-6 !py-2.5">
                Browse deals
              </Link>
              <Link
                href="/signup"
                className="meta !text-[0.72rem] underline decoration-line-strong underline-offset-4 transition-colors hover:!text-ink hover:decoration-accent"
              >
                Become a poster ↗
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-px lg:col-span-5">
          <div className="grid grid-cols-3 gap-px bg-line">
            {[
              [posters, "posters"],
              [dealCount, "live deals"],
              [followers, "follows"],
            ].map(([n, label]) => (
              <div key={label} className="bg-bg p-5">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {n}
                </div>
                <div className="meta mt-1">{label}</div>
              </div>
            ))}
          </div>
          {featured && (
            <div className="flex flex-1 flex-col bg-bg p-5">
              <p className="meta mb-3">№1 trending</p>
              <DealCard deal={featured} />
            </div>
          )}
        </div>
      </section>

      {/* Trending strip */}
      {rest.length > 0 && (
        <Reveal>
          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="meta !text-[0.72rem]">Trending right now</h2>
              <Link
                href="/feed"
                className="font-mono text-[0.78rem] text-accent hover:underline"
              >
                See the full feed →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {rest.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Bento features: one wide cell, two narrow */}
      <Reveal>
        <section className="grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-12">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`bg-bg p-8 sm:p-10 ${
                f.wide ? "lg:col-span-6" : "lg:col-span-3"
              }`}
            >
              <p className="meta mb-6">{f.label}</p>
              <h3 className="font-display mb-3 text-xl font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-dim">{f.body}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* CTA band */}
      <Reveal>
        <section className="border border-line p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-balance text-3xl font-medium tracking-tight sm:text-4xl">
                Your next favorite deal
                <br />
                is already posted.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
                Free to browse, free to follow. Posters keep full ownership of
                their affiliate links.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/feed" className="btn-primary px-6">
                Start browsing
              </Link>
              <Link href="/signup" className="btn-ghost px-6">
                Sign up
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-line pt-5">
        <p className="meta">
          DealHub — a social deals platform · built in the open at{" "}
          <a
            href="https://github.com/sidagentai/dealhub"
            className="transition-colors hover:text-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/sidagentai/dealhub
          </a>
        </p>
      </footer>
    </div>
  );
}
