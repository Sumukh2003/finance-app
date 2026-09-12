"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    // Validate as the user corrects a field rather than only on submit, so the
    // password rules stop nagging the moment they are satisfied.
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // `useWatch` rather than `watch`: it subscribes through the control, which
  // the React Compiler can memoize safely.
  const password = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(values: RegisterInput) {
    setFormError(null);

    try {
      // Registration signs the user in, so send them straight to the dashboard
      // rather than bouncing through a sign-in form they just filled out.
      await api.post("/api/auth/register", values);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        setFormError(errorMessage(error));
      }
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your money in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError ? (
          <p
            role="alert"
            className="bg-destructive-muted text-destructive flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError}
          </p>
        ) : null}

        <Field label="Name" required error={errors.name?.message}>
          {(ids) => (
            <Input
              {...ids}
              {...register("name")}
              autoComplete="name"
              placeholder="Alex Morgan"
              autoFocus
            />
          )}
        </Field>

        <Field label="Email" required error={errors.email?.message}>
          {(ids) => (
            <Input
              {...ids}
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Field label="Password" required error={errors.password?.message}>
          {(ids) => (
            <PasswordInput
              {...ids}
              {...register("password")}
              autoComplete="new-password"
              placeholder="Create a password"
            />
          )}
        </Field>

        <PasswordChecklist value={password} />

        <Field
          label="Confirm password"
          required
          error={errors.confirmPassword?.message}
        >
          {(ids) => (
            <PasswordInput
              {...ids}
              {...register("confirmPassword")}
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
          )}
        </Field>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create account
        </Button>

        <p className="text-muted-foreground text-center text-xs text-pretty">
          By creating an account you agree to keep your financial data accurate
          and to use WalletTrack responsibly.
        </p>
      </form>
    </AuthLayout>
  );
}
