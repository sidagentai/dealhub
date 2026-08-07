"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default function SignupPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    handle: "",
    email: "",
    password: "",
    displayName: "",
    isPoster: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      signIn(await api.signup(form));
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className={inputClass}
          placeholder="Handle (letters, digits, _)"
          value={form.handle}
          onChange={(e) => set("handle", e.target.value)}
          required
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9_]+"
        />
        <input
          className={inputClass}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Display name"
          value={form.displayName}
          onChange={(e) => set("displayName", e.target.value)}
          required
          maxLength={80}
        />
        <input
          className={inputClass}
          type="password"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          required
          minLength={8}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPoster}
            onChange={(e) => set("isPoster", e.target.checked)}
          />
          I want to post deals (build a following, track clicks)
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
