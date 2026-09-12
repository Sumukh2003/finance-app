import Link from "next/link";
import {
  ArrowRight,
  Download,
  Gauge,
  LineChart,
  Lock,
  PieChart,
  Receipt,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

const FEATURES = [
  {
    icon: Receipt,
    title: "Record in seconds",
    body: "Log income and expenses with a category, an amount and a note. Search, filter and sort the whole history without waiting.",
  },
  {
    icon: Target,
    title: "Budgets that hold you to it",
    body: "Cap a category for the month and watch the bar fill as you spend. You get a warning at 80%, not a post-mortem at 110%.",
  },
  {
    icon: PieChart,
    title: "Honest breakdowns",
    body: "See exactly which categories take the biggest bite, with the share of your total spend next to each one.",
  },
  {
    icon: LineChart,
    title: "Twelve-month view",
    body: "Income against spending over a rolling year, so a bad month reads as a blip or a trend.",
  },
  {
    icon: Download,
    title: "Your data, exportable",
    body: "Download exactly what you are looking at as CSV - filters and all - and open it anywhere.",
  },
  {
    icon: Lock,
    title: "Private by construction",
    body: "Sessions live in httpOnly cookies, passwords are hashed with bcrypt, and every query is scoped to your account.",
  },
] as const;

const STEPS = [
  { step: "01", title: "Create an account", body: "Email and a password. No card, no onboarding wizard." },
  { step: "02", title: "Record what moves", body: "Add income and expenses as they happen, or in one sitting." },
  { step: "03", title: "Set your limits", body: "Give the categories that matter a monthly ceiling." },
  { step: "04", title: "Check in monthly", body: "One screen tells you whether the month went the way you planned." },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* A single soft wash behind the headline, rather than a gradient on
              every surface - it should read as depth, not as decoration. */}
          <div
            className="bg-primary/8 pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-5 py-20 text-center sm:px-6 lg:py-28">
            <Badge variant="outline" className="mx-auto">
              <Gauge className="size-3" aria-hidden />
              Free and open source
            </Badge>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Know where your money
              <span className="text-primary"> actually goes</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg text-pretty">
              WalletTrack turns a month of transactions into a picture you can
              act on. Track spending, set budgets that warn you early, and see
              the trend before it becomes a habit.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start tracking free
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section className="border-border border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Everything you need, nothing you do not
              </h2>
              <p className="text-muted-foreground mt-3 text-pretty">
                A finance tracker earns its place by being quick to update and
                clear to read. That is the whole brief.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="p-6">
                  <span
                    className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                    aria-hidden
                  >
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm text-pretty">
                    {feature.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/40 border-border border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-balance">
              Set up in four steps
            </h2>

            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((item) => (
                <li key={item.step}>
                  <span className="text-primary/40 text-3xl font-semibold tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="mt-2 font-medium">{item.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="border-border border-t">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Your next month can be the clear one
            </h2>
            <p className="text-muted-foreground mt-3 text-pretty">
              It takes a minute to sign up and about five to record a month.
              After that, you will never wonder where it went.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/register">
                Create your account
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * A static sketch of the dashboard.
 *
 * Rendered as markup rather than a screenshot so it stays sharp at any size,
 * follows the active theme, and never goes stale against the real UI.
 */
function HeroPreview() {
  const bars = [38, 52, 44, 68, 57, 79, 62, 88];

  return (
    <div className="relative mx-auto mt-16 max-w-4xl" aria-hidden>
      <Card className="overflow-hidden p-0 shadow-lg">
        <div className="border-border flex items-center gap-1.5 border-b px-4 py-3">
          <span className="bg-destructive/60 size-2.5 rounded-full" />
          <span className="bg-warning/60 size-2.5 rounded-full" />
          <span className="bg-success/60 size-2.5 rounded-full" />
        </div>

        <div className="space-y-4 p-5 text-left">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Income", value: "82,400", tone: "text-success" },
              { label: "Expenses", value: "54,180", tone: "text-destructive" },
              { label: "Net", value: "28,220", tone: "text-foreground" },
            ].map((tile) => (
              <div key={tile.label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  {tile.label}
                </p>
                <p className={`tabular mt-1 text-sm font-semibold ${tile.tone}`}>
                  {tile.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-muted/40 flex h-36 items-end gap-2 rounded-lg p-4">
            {bars.map((height, index) => (
              <div
                key={index}
                className="bg-primary/70 flex-1 rounded-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Food & Dining", pct: 72, tone: "bg-success" },
              { label: "Transport", pct: 94, tone: "bg-warning" },
              { label: "Shopping", pct: 100, tone: "bg-destructive" },
            ].map((row) => (
              <div key={row.label}>
                <div className="text-muted-foreground mb-1 flex justify-between text-[11px]">
                  <span>{row.label}</span>
                  <span className="tabular">{row.pct}%</span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${row.tone}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
