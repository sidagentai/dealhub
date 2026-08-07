"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import DealCard from "@/components/DealCard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CategoryNode, Deal } from "@/lib/types";

type Mode = "trending" | "following";

export default function FeedPage() {
  const { user, ready } = useAuth();
  const [mode, setMode] = useState<Mode>("trending");
  const [category, setCategory] = useState<number | undefined>();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.feed({ mode, category, page: nextPage });
        setDeals((d) => (replace ? result.items : [...d, ...result.items]));
        setPage(nextPage);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "couldn't load the feed",
        );
      } finally {
        setLoading(false);
      }
    },
    [mode, category],
  );

  useEffect(() => {
    if (!ready) return;
    load(0, true);
  }, [ready, load]);

  // infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) load(page + 1, false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, load]);

  return (
    <div>
      <div className="mb-4 flex w-fit gap-1 rounded-lg border border-line bg-surface p-1">
        <TabButton
          active={mode === "trending"}
          onClick={() => setMode("trending")}
        >
          For you
        </TabButton>
        <TabButton
          active={mode === "following"}
          onClick={() => setMode("following")}
        >
          Following
        </TabButton>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === undefined} onClick={() => setCategory(undefined)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      {mode === "following" && !user && ready ? (
        <p className="py-12 text-center text-ink-dim">
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>{" "}
          to see deals from posters you follow.
        </p>
      ) : error ? (
        <p className="py-12 text-center text-red-400">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          {!loading && deals.length === 0 && (
            <p className="py-12 text-center text-ink-dim">
              {mode === "following"
                ? "No deals yet from posters you follow."
                : "No deals posted yet."}
            </p>
          )}
          {loading && (
            <p className="py-8 text-center text-ink-faint">Loading…</p>
          )}
          <div ref={sentinel} />
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-surface-2 text-ink shadow-[inset_0_1px_0_#ffffff14]"
          : "text-ink-dim hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ${
        active
          ? "border-accent/50 bg-accent-soft text-ink"
          : "border-line text-ink-dim hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
