"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function FollowButton({ userId }: { userId: number }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  if (!user || user.id === userId) return null;

  async function toggle() {
    setFollowing((f) => !f);
    await (following ? api.unfollow(userId) : api.follow(userId)).catch(() =>
      setFollowing(following),
    );
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-full px-5 py-1.5 text-sm font-medium ${
        following
          ? "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
