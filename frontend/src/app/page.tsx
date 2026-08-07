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
      <div className="mb-4 flex gap-2">
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
        <p className="py-12 text-center text-zinc-500">
          <Link href="/login" className="text-emerald-600 hover:underline">
            Log in
          </Link>{" "}
          to see deals from posters you follow.
        </p>
      ) : error ? (
        <p className="py-12 text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          {!loading && deals.length === 0 && (
            <p className="py-12 text-center text-zinc-500">
              {mode === "following"
                ? "No deals yet from posters you follow."
                : "No deals posted yet."}
            </p>
          )}
          {loading && (
            <p className="py-8 text-center text-zinc-400">Loading…</p>
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
      className={`rounded-full px-4 py-1.5 text-sm font-medium ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
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
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}
