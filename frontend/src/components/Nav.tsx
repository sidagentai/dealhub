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
      className={`meta !text-[0.72rem] border-b-2 px-2 py-4 transition-colors duration-150 ${
        active
          ? "border-accent !text-ink"
          : "border-transparent hover:!text-ink"
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
    <header className="sticky top-0 z-10 border-b border-line bg-bg">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-[1.15rem] font-semibold tracking-tight"
        >
          DealHub<span className="text-accent">.</span>
        </Link>
        <nav className="flex h-full items-center gap-3">
          <NavLink href="/feed" label="Feed" />
          <NavLink href="/search" label="Search" />
          <NavLink href="/posters" label="Posters" />
          {user?.isPoster && <NavLink href="/post" label="Post a deal" />}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {!ready ? null : user ? (
            <>
              <Link
                href={`/u/${user.id}`}
                className="font-mono text-[0.78rem] text-ink-dim transition-colors duration-150 hover:text-ink"
              >
                @{user.handle}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="meta !text-[0.72rem] px-1 transition-colors duration-150 hover:!text-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="meta !text-[0.72rem] px-1 transition-colors duration-150 hover:!text-ink"
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
