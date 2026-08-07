"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-200 dark:bg-zinc-800"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Nav() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Link href="/" className="mr-2 text-lg font-bold tracking-tight">
          Deal<span className="text-emerald-600">Hub</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/" label="Feed" />
          <NavLink href="/search" label="Search" />
          {user?.isPoster && <NavLink href="/post" label="Post a deal" />}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!ready ? null : user ? (
            <>
              <Link
                href={`/u/${user.id}`}
                className="text-sm font-medium hover:underline"
              >
                @{user.handle}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
