"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PosterCard } from "@/lib/types";

export default function PostersPage() {
  const { ready, user } = useAuth();
  const [posters, setPosters] = useState<PosterCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    // fetched after auth is ready so isFollowing reflects the session
    api
      .posters()
      .then(setPosters)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready, user?.id]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Posters</h1>
      <p className="mb-8 text-sm text-ink-dim">
        The people finding the deals. Follow them and their posts land in your
        Following feed.
      </p>

      {loading ? (
        <p className="py-12 text-center text-ink-faint">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posters.map((poster) => (
            <article
              key={poster.id}
              className="card-hover flex gap-4 rounded-xl border border-line bg-surface p-5"
            >
              <Link href={`/u/${poster.id}`} className="shrink-0">
                {poster.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster.avatarUrl}
                    alt={poster.displayName}
                    className="h-14 w-14 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-accent-soft text-xl font-semibold text-accent">
                    {poster.displayName[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/u/${poster.id}`}
                      className="block truncate font-medium tracking-tight hover:underline"
                    >
                      {poster.displayName}
                    </Link>
                    <p className="text-xs text-ink-dim">
                      @{poster.handle} ·{" "}
                      <span className="font-mono tabular-nums">
                        {poster.followerCount}
                      </span>{" "}
                      follower{poster.followerCount === 1 ? "" : "s"} ·{" "}
                      <span className="font-mono tabular-nums">
                        {poster.dealCount}
                      </span>{" "}
                      deal{poster.dealCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <FollowButton
                    userId={poster.id}
                    initialFollowing={poster.isFollowing}
                  />
                </div>
                {poster.bio && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-dim">
                    {poster.bio}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
