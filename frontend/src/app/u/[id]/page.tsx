import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DealCard from "@/components/DealCard";
import FollowButton from "@/components/FollowButton";
import StatsPanel from "@/components/StatsPanel";
import { API_URL } from "@/lib/api";
import type { Deal, Page, UserProfile } from "@/lib/types";

async function fetchProfile(id: string): Promise<UserProfile | null> {
  const res = await fetch(`${API_URL}/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[id]">): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchProfile(id);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `@${profile.handle}`,
    description: profile.bio ?? `Deals posted by ${profile.displayName}`,
  };
}

export default async function ProfilePage({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const profile = await fetchProfile(id);
  if (!profile) notFound();

  const dealsRes = await fetch(`${API_URL}/users/${id}/deals`, {
    cache: "no-store",
  });
  const deals: Page<Deal> = dealsRes.ok
    ? await dealsRes.json()
    : { items: [], page: 0, hasMore: false };

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {profile.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.displayName}</h1>
          <p className="text-sm text-zinc-500">
            @{profile.handle} · {profile.followerCount} follower
            {profile.followerCount === 1 ? "" : "s"}
            {profile.isPoster && " · poster"}
          </p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
        <FollowButton userId={profile.id} />
      </div>

      {profile.isPoster && <StatsPanel userId={profile.id} />}

      {deals.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.items.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-zinc-500">No deals posted yet.</p>
      )}
    </div>
  );
}
