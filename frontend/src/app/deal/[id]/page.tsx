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
            className="w-full rounded-xl border border-line object-cover"
          />
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-line bg-surface text-5xl">
            🏷️
          </div>
        )}
        <div>
          <p className="mb-1 text-sm text-ink-dim">
            {deal.categoryName} · {deal.retailer}
          </p>
          <h1 className="mb-3 text-2xl font-semibold tracking-tight">{deal.title}</h1>
          <div className="mb-4 flex items-baseline gap-3">
            {deal.price !== null && (
              <span className="font-mono text-3xl font-semibold tabular-nums text-gain">
                ${deal.price}
              </span>
            )}
            {deal.originalPrice !== null &&
              deal.originalPrice !== deal.price && (
                <span className="font-mono text-lg text-ink-faint line-through">
                  ${deal.originalPrice}
                </span>
              )}
            {discount !== null && (
              <span className="rounded bg-gain-soft px-2 py-0.5 text-sm font-semibold text-gain">
                -{discount}%
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-ink-dim">
            Posted by{" "}
            <Link
              href={`/u/${deal.poster.id}`}
              className="font-medium text-ink hover:underline"
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
        <p className="mb-8 max-w-prose whitespace-pre-line leading-relaxed text-ink-dim">
          {deal.description}
        </p>
      )}

      <PriceChart history={priceHistory} />
    </div>
  );
}
