"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CategoryNode } from "@/lib/types";

const inputClass = "field";

export default function PostDealPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [form, setForm] = useState({
    affiliateUrl: "",
    title: "",
    description: "",
    categoryId: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    retailer: "",
    expiresAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const deal = await api.createDeal({
        affiliateUrl: form.affiliateUrl,
        title: form.title,
        description: form.description || undefined,
        categoryId: Number(form.categoryId),
        price: form.price ? Number(form.price) : undefined,
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : undefined,
        imageUrl: form.imageUrl || undefined,
        retailer: form.retailer,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : undefined,
      });
      router.push(`/deal/${deal.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "something went wrong");
      setBusy(false);
    }
  }

  if (ready && !user) {
    return (
      <p className="py-12 text-center text-ink-dim">
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>{" "}
        to post deals.
      </p>
    );
  }
  if (ready && user && !user.isPoster) {
    return (
      <p className="py-12 text-center text-ink-dim">
        Your account isn&apos;t a poster account. Sign up as a poster to share
        deals.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Post a deal</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Deal link (your affiliate URL)">
          <input
            className={inputClass}
            type="url"
            placeholder="https://…"
            value={form.affiliateUrl}
            onChange={(e) => set("affiliateUrl", e.target.value)}
            required
          />
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            placeholder="Sony WH-1000XM5 40% off"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            maxLength={200}
          />
        </Field>
        <Field label="Why is this a good deal?">
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="Lowest price I've seen — usually sits at $349."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={10000}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
            >
              <option value="">Pick one…</option>
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {c.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Retailer">
            <input
              className={inputClass}
              placeholder="Amazon"
              value={form.retailer}
              onChange={(e) => set("retailer", e.target.value)}
              required
              maxLength={100}
            />
          </Field>
          <Field label="Deal price ($)">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </Field>
          <Field label="Original price ($)">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              value={form.originalPrice}
              onChange={(e) => set("originalPrice", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Image URL (optional)">
          <input
            className={inputClass}
            type="url"
            placeholder="https://…"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </Field>
        <Field label="Expires (optional)">
          <input
            className={inputClass}
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full !py-2.5"
        >
          {busy ? "Publishing…" : "Publish deal"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.83rem] font-medium text-ink-dim">
        {label}
      </span>
      {children}
    </label>
  );
}
