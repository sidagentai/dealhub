"use client";

import { useState } from "react";
import { api, clickThroughUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Deal } from "@/lib/types";

export default function DealActions({ deal }: { deal: Deal }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function toggleSave() {
    if (!user) return;
    setSaved((s) => !s);
    await (saved ? api.unsaveDeal(deal.id) : api.saveDeal(deal.id)).catch(
      () => {},
    );
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: deal.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={clickThroughUrl(deal.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700"
      >
        Get this deal at {deal.retailer} →
      </a>
      <button
        onClick={toggleSave}
        disabled={!user}
        title={user ? undefined : "Log in to save"}
        className={`rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-40 ${
          saved
            ? "border-emerald-600 text-emerald-600"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {saved ? "♥ Saved" : "♡ Save"}
      </button>
      <button
        onClick={share}
        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
      >
        {copied ? "Link copied!" : "Share"}
      </button>
    </div>
  );
}
