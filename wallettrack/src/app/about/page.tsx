import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Lock, Server, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  title: "About",
  description:
    "What WalletTrack is, the principles behind it, and the stack it runs on.",
};

const PRINCIPLES = [
  {
    icon: Sparkles,
    title: "Clarity over cleverness",
    body: "Numbers are formatted consistently, aligned in columns, and never dressed up. If a figure is bad news, the interface says so plainly.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    body: "No third-party analytics, no bank credentials, no data sharing. Every query is scoped to your account, and sessions live in httpOnly cookies that scripts cannot read.",
  },
  {
    icon: Server,
    title: "Correct by default",
    body: "Every request is validated on the server against the same rules the forms enforce, so bad data never reaches the database.",
  },
  {
    icon: Database,
    title: "Nothing locked in",
    body: "Export everything you can see to CSV whenever you want. The data model is plain documents in MongoDB - no proprietary format.",
  },
] as const;

const STACK = [
  { name: "Next.js 16", role: "App Router, server components, route handlers" },
  { name: "TypeScript", role: "Strict mode across the app and the API" },
  { name: "MongoDB + Mongoose", role: "Documents, indexes and aggregations" },
  { name: "Tailwind CSS v4", role: "Token-driven design system with dark mode" },
  { name: "Zod", role: "One schema shared by the client and the server" },
  { name: "Recharts", role: "Charts that follow the active theme" },
] as const;

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-border border-b">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              A finance tracker that respects your time
            </h1>
            <p className="text-muted-foreground mt-5 text-lg text-pretty">
              Most personal finance apps want a bank connection, a subscription
              and twenty minutes of onboarding. WalletTrack wants an email
              address and about five minutes a month.
            </p>
            <p className="text-muted-foreground mt-4 text-pretty">
              It does four things: records what you earn and spend, groups it by
              category, holds that spending against limits you set, and shows
              the trend over a rolling year. Everything else was left out on
              purpose.
            </p>
          </div>
        </section>

        <section className="border-border border-b">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              What it is built on
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <Card key={principle.title} className="p-6">
                  <span
                    className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                    aria-hidden
                  >
                    <principle.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-medium">{principle.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm text-pretty">
                    {principle.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/40 border-border border-b">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">The stack</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Chosen to keep the app fast to run and straightforward to maintain.
            </p>

            <dl className="border-border mt-8 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {STACK.map((item) => (
                <div key={item.name} className="bg-card p-5">
                  <dt className="font-medium">{item.name}</dt>
                  <dd className="text-muted-foreground mt-1 text-sm text-pretty">
                    {item.role}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              Ready to see your own numbers?
            </h2>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create an account
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
