import { cn } from "@/lib/utils";

/**
 * The wallet mark: a card silhouette with a coin slot, drawn rather than
 * borrowed from an icon set so the brand does not look like every other
 * lucide-powered dashboard.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8", className)}
    >
      <rect
        x="2.5"
        y="6.5"
        width="27"
        height="19"
        rx="5"
        className="fill-primary"
      />
      <path
        d="M2.5 12.5h18a3 3 0 0 1 0 6h-18"
        className="stroke-primary-foreground/35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="16" r="2.75" className="fill-primary-foreground" />
      <circle cx="23" cy="16" r="1" className="fill-primary" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark ? (
        <span className="text-[17px] font-semibold tracking-tight">
          Wallet<span className="text-primary">Track</span>
        </span>
      ) : null}
    </span>
  );
}
