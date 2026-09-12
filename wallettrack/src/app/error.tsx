"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Shows a recoverable state rather than an unstyled crash page. The digest is
 * surfaced because it is the only handle a user can quote in a bug report -
 * the message and stack are withheld in production by design.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app] Unhandled render error", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span
          className="bg-destructive-muted text-destructive mx-auto flex size-14 items-center justify-center rounded-full"
          aria-hidden
        >
          <AlertTriangle className="size-6" />
        </span>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          The page hit an unexpected error. Trying again often clears it.
        </p>

        {error.digest ? (
          <p className="text-muted-foreground mt-4 font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCw />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
