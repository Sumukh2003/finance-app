"use client";

import * as React from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/components/providers";
import { api, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { categoriesForType } from "@/lib/constants";
import { toDateInputValue } from "@/lib/date";
import { CURRENCY_SYMBOLS } from "@/lib/format";
import { amountSchema, categorySchema } from "@/lib/validations/common";
import type { Transaction } from "@/types/api";
import { cn } from "@/lib/utils";

/**
 * Form schema.
 *
 * Deliberately mirrors the server schema in `validations/transaction.ts` so the
 * user gets instant feedback; the server remains the authority, and any error
 * it returns is mapped back onto these same fields.
 */
const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: categorySchema,
  amount: amountSchema,
  description: z.string().trim().max(280, "Keep it under 280 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
});

/**
 * `amount` is coerced, so the schema's input type (what the text input holds)
 * differs from its output type (what the submit handler receives). Keeping the
 * two apart is what lets the field start empty instead of at zero.
 */
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

function defaultValues(transaction?: Transaction | null): FormInput {
  return {
    type: transaction?.type ?? "expense",
    category: transaction?.category ?? "",
    amount: transaction?.amount ?? "",
    description: transaction?.description ?? "",
    date: transaction ? transaction.date.slice(0, 10) : toDateInputValue(),
  };
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; omit to create. */
  transaction?: Transaction | null;
  onSaved: () => void;
}) {
  const currency = useCurrency();
  const isEditing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(transaction),
  });

  // Reset whenever the dialog opens so a previous edit never leaks into the
  // next one, and a cancelled draft does not reappear.
  React.useEffect(() => {
    if (open) reset(defaultValues(transaction));
  }, [open, transaction, reset]);

  // `useWatch` rather than `watch`: it subscribes through the control, which
  // the React Compiler can memoize safely.
  const type = useWatch({ control, name: "type" });
  const category = useWatch({ control, name: "category" });
  const categories = categoriesForType(type);

  async function onSubmit(values: FormOutput) {
    try {
      const payload = {
        type: values.type,
        category: values.category,
        amount: values.amount,
        description: values.description || undefined,
        // Sent as a plain calendar date. Converting to an instant first made
        // the stored day depend on the browser's offset, so a user far enough
        // east or west would see the entry land on the wrong date.
        date: values.date,
      };

      if (isEditing && transaction) {
        await api.patch(`/api/transactions/${transaction.id}`, payload);
        toast.success("Transaction updated");
      } else {
        await api.post("/api/transactions", payload);
        toast.success("Transaction added");
      }

      onOpenChange(false);
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError as never)) {
        toast.error(errorMessage(error));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this entry."
              : "Record money coming in or going out."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogBody className="space-y-4">
            {/* Type is a segmented control rather than a dropdown: there are two
                options and the choice drives the rest of the form. */}
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div>
                  <span className="mb-1.5 block text-sm font-medium">Type</span>
                  <div
                    role="radiogroup"
                    aria-label="Transaction type"
                    className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
                  >
                    {(["expense", "income"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={field.value === option}
                        onClick={() => {
                          field.onChange(option);
                          // Categories differ per type, so a stale selection
                          // would otherwise submit "Salary" as an expense.
                          if (!categoriesForType(option).includes(category)) {
                            setValue("category", "");
                          }
                        }}
                        className={cn(
                          "rounded-md py-2 text-sm font-medium capitalize transition-colors",
                          field.value === option
                            ? option === "income"
                              ? "bg-success text-success-foreground shadow-sm"
                              : "bg-destructive text-destructive-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Field label="Category" required error={errors.category?.message}>
                  {(ids) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={ids.id} aria-invalid={ids["aria-invalid"]}>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount" required error={errors.amount?.message}>
                {(ids) => (
                  <div className="relative">
                    <span
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
                      aria-hidden
                    >
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <Input
                      {...ids}
                      {...register("amount")}
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="tabular pl-8"
                    />
                  </div>
                )}
              </Field>

              <Field label="Date" required error={errors.date?.message}>
                {(ids) => (
                  <Input
                    {...ids}
                    {...register("date")}
                    type="date"
                    max={toDateInputValue()}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Note"
              hint="Optional - helps you recognise this later."
              error={errors.description?.message}
            >
              {(ids) => (
                <Textarea
                  {...ids}
                  {...register("description")}
                  rows={2}
                  placeholder="e.g. Weekly grocery run"
                  className="min-h-16"
                />
              )}
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
