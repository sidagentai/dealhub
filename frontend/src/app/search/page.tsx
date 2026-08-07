"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DealCard from "@/components/DealCard";
import { api } from "@/lib/api";
import type { CategoryNode, Deal } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();

  // form state seeded from the URL so searches are shareable/linkable
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "relevance");

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const run = useCallback(
    async (nextPage: number, replace: boolean) => {
      setLoading(true);
      try {
        const result = await api.search({
          q: params.get("q") ?? undefined,
          category: params.get("category")
            ? Number(params.get("category"))
            : undefined,
          minPrice: params.get("min_price") ?? undefined,
          maxPrice: params.get("max_price") ?? undefined,
          sort: params.get("sort") ?? undefined,
          page: nextPage,
        });
        setDeals((d) => (replace ? result.items : [...d, ...result.items]));
        setPage(nextPage);
        setHasMore(result.hasMore);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  // any change to the URL params re-runs the search
  useEffect(() => {
    run(0, true);
  }, [run]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (minPrice) next.set("min_price", minPrice);
    if (maxPrice) next.set("max_price", maxPrice);
    if (sort !== "relevance") next.set("sort", sort);
    router.push(`/search?${next}`);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            placeholder="Search deals…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.id}>{c.name} (all)</option>
                {c.subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <input
            className={`${inputClass} w-28`}
            type="number"
            min="0"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            className={`${inputClass} w-28`}
            type="number"
            min="0"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <select
            className={inputClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevance">Most relevant</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
      {loading && <p className="py-8 text-center text-zinc-400">Searching…</p>}
      {!loading && searched && deals.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          No deals match your search.
        </p>
      )}
      {!loading && hasMore && (
        <div className="py-6 text-center">
          <button
            onClick={() => run(page + 1, false)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
