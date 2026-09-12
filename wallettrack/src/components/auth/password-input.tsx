"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a reveal toggle.
 *
 * The toggle is a real button rather than an icon-shaped div, so it is
 * reachable by keyboard, and its label states the action and current state.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        // Excluded from the tab order: it is a convenience control, and
        // stopping between every password field and the submit button is worse
        // than reaching it with a pointer or via the field's own controls.
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className={cn(
          "text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2",
          "rounded p-1.5 transition-colors focus-visible:outline-ring focus-visible:outline-2",
        )}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
