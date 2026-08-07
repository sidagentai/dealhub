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
    <article className="card-hover flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
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
          <div className="flex h-40 w-full items-center justify-center bg-surface-2 text-3xl">
            🏷️
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline gap-2 font-mono tabular-nums">
          {deal.price !== null && (
            <span className="text-lg font-semibold text-gain">
              ${deal.price}
            </span>
          )}
          {deal.originalPrice !== null && deal.originalPrice !== deal.price && (
            <span className="text-sm text-ink-faint line-through">
              ${deal.originalPrice}
            </span>
          )}
          {discount !== null && (
            <span className="rounded bg-gain-soft px-1.5 py-0.5 text-xs font-semibold text-gain">
              -{discount}%
            </span>
          )}
        </div>
        <Link
          href={`/deal/${deal.id}`}
          className="line-clamp-2 text-[0.95rem] font-medium tracking-tight hover:underline"
        >
          {deal.title}
        </Link>
        <div className="text-xs text-ink-dim">
          {deal.retailer} ·{" "}
          <Link
            href={`/u/${deal.poster.id}`}
            className="text-ink-dim transition-colors duration-150 hover:text-ink"
          >
            @{deal.poster.handle}
          </Link>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <a
            href={clickThroughUrl(deal.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 !py-1.5"
          >
            Get deal
          </a>
          <button
            onClick={toggleSave}
            disabled={!user}
            title={user ? "Save" : "Log in to save"}
            className={`btn-ghost !py-1.5 ${
              saved ? "!border-accent/50 !text-accent" : ""
            }`}
          >
            ♥ {saveCount}
          </button>
        </div>
      </div>
    </article>
  );
}
