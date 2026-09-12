import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <Logo className="mb-10" />

      <span
        className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full"
        aria-hidden
      >
        <Compass className="size-6" />
      </span>

      <p className="text-muted-foreground mt-6 text-sm font-medium tracking-wide uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-pretty">
        The page you were looking for does not exist, or it has moved somewhere
        else.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <Home />
            Back home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
