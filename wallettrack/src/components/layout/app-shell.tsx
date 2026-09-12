"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useSessionUser } from "@/components/providers";
import { api, errorMessage } from "@/lib/api-client";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/budgets", label: "Budgets", icon: Target },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  // Exact match for the index route; prefix match for its children, so
  // /dashboard/transactions does not also light up "Overview".
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            // Communicates the current page to assistive tech, which cannot
            // infer it from the highlight.
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu() {
  const user = useSessionUser();
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  async function signOut() {
    setSigningOut(true);

    try {
      await api.post("/api/auth/logout");
      // `refresh()` clears cached server-rendered pages, so the shell cannot
      // keep showing the previous user's data after the redirect.
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors",
            "hover:bg-sidebar-accent/60 focus-visible:outline-ring focus-visible:outline-2",
          )}
        >
          <span
            className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            aria-hidden
          >
            {initialsOf(user.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="text-muted-foreground block truncate text-xs">
              {user.email}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            // Keep the menu open until the request settles, so the click does
            // not appear to do nothing on a slow connection.
            event.preventDefault();
            void signOut();
          }}
          disabled={signingOut}
        >
          <LogOut />
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation; leaving it open over the new page is a
  // classic mobile-nav bug.
  React.useEffect(() => setMobileNavOpen(false), [pathname]);

  // Lock background scrolling while the drawer covers the page.
  React.useEffect(() => {
    if (!mobileNavOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  React.useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="bg-background min-h-dvh">
      <a
        href="#main-content"
        className={cn(
          "sr-only z-100 focus:not-sr-only focus:fixed focus:top-3 focus:left-3",
          "focus:bg-card focus:text-foreground focus:rounded-md focus:border focus:px-4 focus:py-2 focus:shadow-lg",
        )}
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 hidden w-60 flex-col border-r lg:flex">
        <div className="border-sidebar-border flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="rounded-md">
            <Logo />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>

        <div className="border-sidebar-border border-t p-2">
          <UserMenu />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="lg:hidden">
          <div
            className="animate-in fade-in-0 fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div
            className="bg-sidebar animate-in slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-xl duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="border-sidebar-border flex h-14 items-center justify-between border-b px-4">
              <Logo />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setMobileNavOpen(false)} />
            </div>

            <div className="border-sidebar-border border-t p-2">
              <UserMenu />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="bg-background/85 border-border sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="size-5" />
          </Button>

          <Link href="/dashboard" className="lg:hidden">
            <Logo showWordmark={false} />
          </Link>

          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
