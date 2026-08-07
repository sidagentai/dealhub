"use client";

import Link from "next/link";
import { useState } from "react";
import { api, clickThroughUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Deal } from "@/lib/types";

function discountPercent(deal: Deal): number | null {
  if (!deal.price || !deal.originalPrice || deal.originalPrice <= deal.price) {
    return null;
  }
  return Math.round((1 - deal.price / deal.originalPrice) * 100);
}

export default function DealCard({ deal }: { deal: Deal }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(deal.saveCount);
  const discount = discountPercent(deal);

  async function toggleSave() {
    if (!user) return;
    if (saved) {
      setSaved(false);
      setSaveCount((c) => Math.max(0, c - 1));
      await api.unsaveDeal(deal.id).catch(() => {});
    } else {
      setSaved(true);
      setSaveCount((c) => c + 1);
      await api.saveDeal(deal.id).catch(() => {});
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={`/deal/${deal.id}`} className="block">
        {deal.imageUrl ? (
          // retailer-hosted images come from arbitrary domains; plain img on purpose
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-zinc-100 text-3xl dark:bg-zinc-800">
            🏷️
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline gap-2">
          {deal.price !== null && (
            <span className="text-lg font-bold text-emerald-600">
              ${deal.price}
            </span>
          )}
          {deal.originalPrice !== null && deal.originalPrice !== deal.price && (
            <span className="text-sm text-zinc-400 line-through">
              ${deal.originalPrice}
            </span>
          )}
          {discount !== null && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              -{discount}%
            </span>
          )}
        </div>
        <Link
          href={`/deal/${deal.id}`}
          className="line-clamp-2 font-medium hover:underline"
        >
          {deal.title}
        </Link>
        <div className="text-xs text-zinc-500">
          {deal.retailer} ·{" "}
          <Link href={`/u/${deal.poster.id}`} className="hover:underline">
            @{deal.poster.handle}
          </Link>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <a
            href={clickThroughUrl(deal.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-md bg-emerald-600 py-1.5 text-center text-sm font-medium text-white hover:bg-emerald-700"
          >
            Get deal
          </a>
          <button
            onClick={toggleSave}
            disabled={!user}
            title={user ? "Save" : "Log in to save"}
            className={`rounded-md border px-2.5 py-1.5 text-sm ${
              saved
                ? "border-emerald-600 text-emerald-600"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700"
            } disabled:opacity-40`}
          >
            ♥ {saveCount}
          </button>
        </div>
      </div>
    </article>
  );
}
