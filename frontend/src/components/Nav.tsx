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
      className={`rounded-md px-3 py-1.5 text-[0.83rem] font-medium transition-colors duration-150 ${
        active
          ? "bg-surface-2 text-ink"
          : "text-ink-dim hover:text-ink"
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
    <header className="sticky top-0 z-10 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Link
          href="/"
          className="mr-3 text-[1.05rem] font-semibold tracking-tight"
        >
          Deal<span className="text-accent">Hub</span>
        </Link>
        <nav className="flex items-center gap-0.5">
          <NavLink href="/" label="Feed" />
          <NavLink href="/search" label="Search" />
          {user?.isPoster && <NavLink href="/post" label="Post a deal" />}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!ready ? null : user ? (
            <>
              <Link
                href={`/u/${user.id}`}
                className="text-[0.83rem] font-medium text-ink-dim transition-colors duration-150 hover:text-ink"
              >
                @{user.handle}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="rounded-md px-3 py-1.5 text-[0.83rem] font-medium text-ink-dim transition-colors duration-150 hover:text-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-[0.83rem] font-medium text-ink-dim transition-colors duration-150 hover:text-ink"
              >
                Log in
              </Link>
              <Link href="/signup" className="btn-primary !py-1.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
