import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DealActions from "@/components/DealActions";
import PriceChart from "@/components/PriceChart";
import { API_URL } from "@/lib/api";
import type { DealDetail } from "@/lib/types";

async function fetchDeal(id: string): Promise<DealDetail | null> {
  const res = await fetch(`${API_URL}/deals/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: PageProps<"/deal/[id]">): Promise<Metadata> {
  const { id } = await params;
  const detail = await fetchDeal(id);
  if (!detail) return { title: "Deal not found" };
  const { deal } = detail;
  return {
    title: deal.title,
    description:
      deal.description ??
      `${deal.title} at ${deal.retailer}, shared by @${deal.poster.handle}`,
    openGraph: {
      title: deal.title,
      images: deal.imageUrl ? [deal.imageUrl] : undefined,
    },
  };
}

export default async function DealPage({ params }: PageProps<"/deal/[id]">) {
  const { id } = await params;
  const detail = await fetchDeal(id);
  if (!detail) notFound();
  const { deal, priceHistory } = detail;

  const discount =
    deal.price && deal.originalPrice && deal.originalPrice > deal.price
      ? Math.round((1 - deal.price / deal.originalPrice) * 100)
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        {deal.imageUrl ? (
          // arbitrary retailer-hosted domains; plain img on purpose
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-xl bg-zinc-100 text-5xl dark:bg-zinc-800">
            🏷️
          </div>
        )}
        <div>
          <p className="mb-1 text-sm text-zinc-500">
            {deal.categoryName} · {deal.retailer}
          </p>
          <h1 className="mb-3 text-2xl font-bold">{deal.title}</h1>
          <div className="mb-4 flex items-baseline gap-3">
            {deal.price !== null && (
              <span className="text-3xl font-bold text-emerald-600">
                ${deal.price}
              </span>
            )}
            {deal.originalPrice !== null &&
              deal.originalPrice !== deal.price && (
                <span className="text-lg text-zinc-400 line-through">
                  ${deal.originalPrice}
                </span>
              )}
            {discount !== null && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                -{discount}%
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-zinc-500">
            Posted by{" "}
            <Link
              href={`/u/${deal.poster.id}`}
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
            >
              @{deal.poster.handle}
            </Link>{" "}
            · {new Date(deal.postedAt).toLocaleDateString()} ·{" "}
            {deal.clickCount} clicks · {deal.saveCount} saves
          </p>
          <DealActions deal={deal} />
        </div>
      </div>

      {deal.description && (
        <p className="mb-8 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {deal.description}
        </p>
      )}

      <PriceChart history={priceHistory} />
    </div>
  );
}
