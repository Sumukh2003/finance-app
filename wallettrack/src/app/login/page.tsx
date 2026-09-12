"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, ApiClientError, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);

  const justRegistered = searchParams.get("registered") === "1";
  // Only same-site paths are honoured, so a crafted `?next=https://evil.tld`
  // cannot turn the sign-in page into an open redirect.
  const rawNext = searchParams.get("next");
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    try {
      await api.post("/api/auth/login", values);
      router.replace(next);
      // Discards any cached server render from a previous session.
      router.refresh();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        setFormError(
          error instanceof ApiClientError ? error.message : errorMessage(error),
        );
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {justRegistered ? (
        <p className="bg-success-muted text-success flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your account is ready. Sign in to get started.
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

      <Field label="Email" required error={errors.email?.message}>
        {(ids) => (
          <Input
            {...ids}
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
          />
        )}
      </Field>

      <Field label="Password" required error={errors.password?.message}>
        {(ids) => (
          <PasswordInput
            {...ids}
            {...register("password")}
            autoComplete="current-password"
            placeholder="Your password"
          />
        )}
      </Field>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to WalletTrack?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a Suspense boundary so the shell can still be
          prerendered while the query string resolves. */}
      <React.Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </React.Suspense>
    </AuthLayout>
  );
}
