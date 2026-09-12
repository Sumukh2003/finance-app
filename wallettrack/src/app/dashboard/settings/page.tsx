"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { PasswordInput } from "@/components/auth/password-input";
import { useSessionUser } from "@/components/providers";
import { api, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/format";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/lib/validations/auth";

const CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "JPY",
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile and sign-in details.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard />
        <PasswordCard />
      </div>
    </div>
  );
}

function ProfileCard() {
  const user = useSessionUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name, currency: user.currency },
  });

  async function onSubmit(values: UpdateProfileInput) {
    try {
      await api.patch("/api/auth/me", values);
      toast.success("Profile updated");
      // The shell renders the name and currency from the server session, so
      // refresh it rather than leaving the header showing the old values.
      reset(values);
      router.refresh();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        toast.error(errorMessage(error));
      }
    }
  }

  return (
    <Card asChild>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" aria-hidden />
              Profile
            </CardTitle>
            <CardDescription>How your account appears in WalletTrack.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Field label="Name" required error={errors.name?.message}>
            {(ids) => <Input {...ids} {...register("name")} autoComplete="name" />}
          </Field>

          <Field
            label="Email"
            hint="Your email address cannot be changed here."
          >
            {(ids) => <Input {...ids} value={user.email} disabled readOnly />}
          </Field>

          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Field
                label="Currency"
                hint="Used to format every amount in the app."
                error={errors.currency?.message}
              >
                {(ids) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={ids.id}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {CURRENCY_SYMBOLS[code]} &nbsp; {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";

  async function onSubmit(values: ChangePasswordInput) {
    try {
      await api.post("/api/auth/password", values);
      toast.success("Password changed");
      reset();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        toast.error(errorMessage(error));
      }
    }
  }

  return (
    <Card asChild>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4" aria-hidden />
              Password
            </CardTitle>
            <CardDescription>Choose a strong, unique password.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Field
            label="Current password"
            required
            error={errors.currentPassword?.message}
          >
            {(ids) => (
              <PasswordInput
                {...ids}
                {...register("currentPassword")}
                autoComplete="current-password"
              />
            )}
          </Field>

          <Field label="New password" required error={errors.newPassword?.message}>
            {(ids) => (
              <PasswordInput
                {...ids}
                {...register("newPassword")}
                autoComplete="new-password"
              />
            )}
          </Field>

          {newPassword ? <PasswordChecklist value={newPassword} /> : null}

          <Field
            label="Confirm new password"
            required
            error={errors.confirmPassword?.message}
          >
            {(ids) => (
              <PasswordInput
                {...ids}
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
            )}
          </Field>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
