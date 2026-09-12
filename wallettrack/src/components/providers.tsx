"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import type { CurrencyCode } from "@/lib/format";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
};

const SessionContext = React.createContext<SessionUser | null>(null);

/**
 * The signed-in user, resolved on the server and handed down.
 *
 * Server-rendered rather than fetched on mount, so the shell never flashes a
 * placeholder name and there is no extra round trip before the first paint.
 */
export function useSessionUser(): SessionUser {
  const user = React.useContext(SessionContext);

  if (!user) {
    throw new Error("useSessionUser must be used inside the dashboard layout");
  }

  return user;
}

/** The user's preferred currency, for formatting amounts. */
export function useCurrency(): CurrencyCode {
  return React.useContext(SessionContext)?.currency ?? "INR";
}

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  // The object identity is stable across re-renders so consumers do not
  // re-render whenever the layout does.
  const value = React.useMemo(() => user, [user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function AppProviders({
  children,
  nonce,
}: {
  children: React.ReactNode;
  /** Passed through so the theme script satisfies the CSP set by the proxy. */
  nonce?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
      <Toaster
        position="bottom-right"
        // Inherit the app palette rather than sonner's own, so toasts do not
        // look like they came from a different product.
        toastOptions={{
          classNames: {
            toast:
              "group border border-border bg-popover text-popover-foreground shadow-lg rounded-lg",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
            error: "border-destructive/40",
            success: "border-success/40",
          },
        }}
      />
    </ThemeProvider>
  );
}
