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
      className={
        following
          ? "btn-ghost rounded-full px-5 !py-1.5"
          : "btn-primary rounded-full px-5 !py-1.5"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
