"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-sm leading-none font-medium text-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  /** Rendered beneath the label as guidance. Replaced by `error` when invalid. */
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /**
   * Receives the ids to wire onto the control, so the label points at the right
   * element and the error is announced when it appears.
   */
  children: (ids: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
};

/**
 * A labelled form control with its description and error message.
 *
 * Centralising the id plumbing here is what keeps every form in the app
 * accessible by default rather than by remembering to do it each time.
 */
function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const id = React.useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </Label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p
          id={errorId}
          // `role="alert"` so the message is read out the moment it renders,
          // not only when the user happens to navigate onto the field.
          role="alert"
          className="text-destructive flex items-start gap-1.5 text-xs"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Field, Label };
