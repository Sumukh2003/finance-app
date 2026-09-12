"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Mail, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { api, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";

const FAQS = [
  {
    question: "Is WalletTrack free?",
    answer:
      "Yes. It is an open-source project with no paid tier, no trial and no card required.",
  },
  {
    question: "Do you connect to my bank?",
    answer:
      "No. Transactions are entered manually, which means the app never needs your banking credentials.",
  },
  {
    question: "Can I get my data out?",
    answer:
      "Any time. The transactions page exports exactly what your filters match as a CSV file.",
  },
  {
    question: "Which currencies are supported?",
    answer:
      "Eight, including INR, USD, EUR and GBP. Change it any time under Settings.",
  },
] as const;

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactInput) {
    setFormError(null);

    try {
      await api.post("/api/contact", values);
      setSent(true);
      reset();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        setFormError(errorMessage(error));
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Get in touch
            </h1>
            <p className="text-muted-foreground mt-4 text-lg text-pretty">
              Found a bug, want a feature, or just curious how something works?
              Send a note and you will get a reply.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            <Card className="lg:col-span-3" asChild>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="size-4" aria-hidden />
                      Send a message
                    </CardTitle>
                    <CardDescription>
                      We usually reply within a couple of days.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {sent ? (
                    <p
                      role="status"
                      className="bg-success-muted text-success flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                      Thanks - your message is on its way. We will be in touch.
                    </p>
                  ) : null}

                  {formError ? (
                    <p
                      role="alert"
                      className="bg-destructive-muted text-destructive flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {formError}
                    </p>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" required error={errors.name?.message}>
                      {(ids) => (
                        <Input {...ids} {...register("name")} autoComplete="name" />
                      )}
                    </Field>

                    <Field label="Email" required error={errors.email?.message}>
                      {(ids) => (
                        <Input
                          {...ids}
                          {...register("email")}
                          type="email"
                          autoComplete="email"
                        />
                      )}
                    </Field>
                  </div>

                  <Field label="Subject" required error={errors.subject?.message}>
                    {(ids) => (
                      <Input
                        {...ids}
                        {...register("subject")}
                        placeholder="What is this about?"
                      />
                    )}
                  </Field>

                  <Field
                    label="Message"
                    required
                    hint="The more detail, the better the answer."
                    error={errors.message?.message}
                  >
                    {(ids) => (
                      <Textarea
                        {...ids}
                        {...register("message")}
                        rows={6}
                        placeholder="Tell us what is on your mind..."
                      />
                    )}
                  </Field>

                  <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
                    <Mail />
                    Send message
                  </Button>
                </CardContent>
              </form>
            </Card>

            <div className="lg:col-span-2">
              <h2 className="font-medium">Common questions</h2>

              <dl className="mt-4 space-y-5">
                {FAQS.map((faq) => (
                  <div key={faq.question}>
                    <dt className="text-sm font-medium">{faq.question}</dt>
                    <dd className="text-muted-foreground mt-1 text-sm text-pretty">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
