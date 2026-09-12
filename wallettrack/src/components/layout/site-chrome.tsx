"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="bg-background/80 border-border sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-6">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Site">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-border bg-background border-t px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Site">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="text-muted-foreground mt-2 text-sm">
            Personal finance tracking, without the spreadsheet.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </div>

      <div className="border-border text-muted-foreground border-t px-5 py-4 text-center text-xs sm:px-6">
        &copy; {new Date().getFullYear()} WalletTrack. Built with Next.js and MongoDB.
      </div>
    </footer>
  );
}
