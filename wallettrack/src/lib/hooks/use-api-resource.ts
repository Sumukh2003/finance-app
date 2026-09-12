"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ApiClientError, apiRequest } from "@/lib/api-client";

type State<T> = {
  data: T | null;
  error: string | null;
  /** True only on the first load, when there is nothing to show yet. */
  loading: boolean;
  /** True while refreshing with data already on screen. */
  refreshing: boolean;
};

/**
 * Fetches a JSON resource and keeps it in sync with its dependencies.
 *
 * Two distinct pending flags: `loading` drives skeletons on first paint, while
 * `refreshing` dims data that is already rendered. Collapsing them into one
 * would make every filter change blank the screen.
 */
export function useApiResource<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  const router = useRouter();
  const [state, setState] = React.useState<State<T>>({
    data: null,
    error: null,
    loading: true,
    refreshing: false,
  });

  // Serialised so the effect compares by value; a fresh object literal on every
  // render would otherwise re-fetch forever.
  const queryKey = JSON.stringify(query ?? {});
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setState((previous) => ({
      ...previous,
      loading: previous.data === null,
      refreshing: previous.data !== null,
      error: null,
    }));

    try {
      const data = await apiRequest<T>(path, {
        method: "GET",
        query: JSON.parse(queryKey),
      });

      // Drop responses from superseded requests; without this, a slow early
      // request can overwrite the results of a later, faster one.
      if (requestId !== requestIdRef.current) return;

      setState({ data, error: null, loading: false, refreshing: false });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      if (error instanceof ApiClientError && error.isUnauthorized) {
        // The session expired mid-session. Send the user to sign in rather than
        // leaving a permanently failing screen.
        router.replace("/login");
        return;
      }

      setState((previous) => ({
        ...previous,
        error:
          error instanceof ApiClientError
            ? error.message
            : "Something went wrong. Please try again.",
        loading: false,
        refreshing: false,
      }));
    }
  }, [path, queryKey, router]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refetch: load };
}
