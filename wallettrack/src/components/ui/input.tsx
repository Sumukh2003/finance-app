import * as React from "react";

import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full rounded-md border border-input bg-background text-sm text-foreground",
  "placeholder:text-muted-foreground/70 transition-colors",
  "focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-60",
  // Paired with `aria-invalid` on the control, so the visual error state and
  // the state announced to assistive tech can never drift apart.
  "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
].join(" ");

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldBase, "h-10 px-3 py-2", className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "min-h-24 resize-y px-3 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export { Input, Textarea, fieldBase };
