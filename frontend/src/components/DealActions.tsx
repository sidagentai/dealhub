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
        className="btn-primary px-6 !py-2.5"
      >
        Get this deal at {deal.retailer} →
      </a>
      <button
        onClick={toggleSave}
        disabled={!user}
        title={user ? undefined : "Log in to save"}
        className={`btn-ghost !py-2.5 ${saved ? "!border-accent/50 !text-accent" : ""}`}
      >
        {saved ? "♥ Saved" : "♡ Save"}
      </button>
      <button
        onClick={share}
        className="btn-ghost !py-2.5"
      >
        {copied ? "Link copied!" : "Share"}
      </button>
    </div>
  );
}
