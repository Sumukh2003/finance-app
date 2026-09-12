"use client";

import { Check } from "lucide-react";

import { passwordRequirements } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

/**
 * Live feedback on the password policy.
 *
 * Showing the rules as they are met beats rejecting the whole form on submit
 * with a single "password too weak" message and no indication of what is wrong.
 */
export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Password requirements">
      {passwordRequirements.map((requirement) => {
        const met = requirement.test(value);

        return (
          <li
            key={requirement.id}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              met ? "text-success" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                met
                  ? "border-success bg-success text-success-foreground"
                  : "border-current",
              )}
              aria-hidden
            >
              {met ? <Check className="size-2.5" strokeWidth={3} /> : null}
            </span>
            <span>{requirement.label}</span>
            <span className="sr-only">{met ? " - met" : " - not met"}</span>
          </li>
        );
      })}
    </ul>
  );
}
