"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [handleOrEmail, setHandleOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      signIn(await api.login(handleOrEmail, password));
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="field"
          placeholder="Handle or email"
          value={handleOrEmail}
          onChange={(e) => setHandleOrEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-dim">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
