"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delay` milliseconds.
 *
 * Used for the search box: without it, every keystroke fires its own request,
 * so typing "groceries" costs nine round trips and the responses can land out
 * of order, leaving the list showing results for a prefix.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
