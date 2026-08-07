"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { StatsResponse } from "@/lib/types";

/** Poster dashboard — the API only serves this to the profile's owner. */
export default function StatsPanel({ userId }: { userId: number }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  const isOwner = user?.id === userId;

  useEffect(() => {
    if (!isOwner) return;
    api.stats(userId).then(setStats).catch(() => {});
  }, [isOwner, userId]);

  if (!isOwner || !stats) return null;

  return (
    <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Your stats (only you can see this)
      </h2>
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total clicks" value={stats.totalClicks} />
        <Stat label="Clicks (7 days)" value={stats.clicksLast7Days} />
        <Stat label="Saves" value={stats.totalSaves} />
        <Stat label="Deals posted" value={stats.dealCount} />
      </div>
      {stats.topDeals.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            Top performing deals
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="py-1 font-medium">Deal</th>
                <th className="py-1 text-right font-medium">Clicks</th>
                <th className="py-1 text-right font-medium">Saves</th>
              </tr>
            </thead>
            <tbody>
              {stats.topDeals.map((d) => (
                <tr
                  key={d.dealId}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="max-w-0 truncate py-2 pr-4">
                    <a href={`/deal/${d.dealId}`} className="hover:underline">
                      {d.title}
                    </a>
                  </td>
                  <td className="py-2 text-right tabular-nums">{d.clicks}</td>
                  <td className="py-2 text-right tabular-nums">{d.saves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
