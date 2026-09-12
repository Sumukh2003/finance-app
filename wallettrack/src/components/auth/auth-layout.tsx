import Link from "next/link";
import { ArrowLeft, LineChart, PieChart, ShieldCheck, Wallet } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const HIGHLIGHTS = [
  { icon: Wallet, title: "One ledger", body: "Income and spending, recorded in seconds." },
  { icon: PieChart, title: "Clear breakdowns", body: "See which categories take the biggest bite." },
  { icon: LineChart, title: "Monthly trends", body: "Twelve months of cash flow at a glance." },
  { icon: ShieldCheck, title: "Private by default", body: "Your data is yours, and only yours." },
] as const;

/**
 * Shared frame for sign-in and registration.
 *
 * The marketing column is hidden below `lg` rather than stacked above the form:
 * on a phone, someone arriving to sign in wants the form, not a pitch to scroll
 * past.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="bg-sidebar border-sidebar-border relative hidden flex-col justify-between border-r p-10 lg:flex">
        <Link href="/" className="w-fit rounded-md">
          <Logo />
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Know where your money actually goes.
          </h2>
          <p className="text-muted-foreground mt-3 text-pretty">
            WalletTrack turns a month of transactions into a picture you can act
            on - without a spreadsheet.
          </p>

          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span
                  className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                  aria-hidden
                >
                  <item.icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="text-muted-foreground block text-sm">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} WalletTrack
        </p>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-md text-sm transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <Logo className="mb-6" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{subtitle}</p>

            <div className="mt-7">{children}</div>

            <div className="text-muted-foreground mt-6 text-center text-sm">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
