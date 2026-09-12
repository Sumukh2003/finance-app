"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/components/providers";
import { api, applyFieldErrors, errorMessage } from "@/lib/api-client";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { CURRENCY_SYMBOLS, formatMonthLabel } from "@/lib/format";
import { amountSchema, categorySchema } from "@/lib/validations/common";
import type { BudgetSummaryItem } from "@/types/api";

const formSchema = z.object({
  category: categorySchema,
  limit: amountSchema,
});

// See the note in transaction-dialog: `limit` is coerced, so input and
// output types differ and both are declared explicitly.
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function BudgetDialog({
  open,
  onOpenChange,
  month,
  budget,
  /** Categories already budgeted this month, hidden from the picker when creating. */
  usedCategories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  budget?: BudgetSummaryItem | null;
  usedCategories: string[];
  onSaved: () => void;
}) {
  const currency = useCurrency();
  const isEditing = Boolean(budget);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "", limit: "" },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        category: budget?.category ?? "",
        limit: budget?.limit ?? "",
      });
    }
  }, [open, budget, reset]);

  // One budget per category per month, so an unused category list prevents the
  // conflict before the server has to reject it.
  const available = React.useMemo(() => {
    const taken = new Set(usedCategories.filter((c) => c !== budget?.category));
    return EXPENSE_CATEGORIES.filter((category) => !taken.has(category));
  }, [usedCategories, budget?.category]);

  async function onSubmit(values: FormOutput) {
    try {
      if (isEditing && budget) {
        await api.patch(`/api/budgets/${budget.id}`, { limit: values.limit });
        toast.success("Budget updated");
      } else {
        await api.post("/api/budgets", {
          category: values.category,
          limit: values.limit,
          month,
        });
        toast.success("Budget created");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit budget" : "New budget"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Adjust the limit for ${budget?.category}.`
              : `Cap a category for ${formatMonthLabel(month)}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogBody className="space-y-4">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Field label="Category" required error={errors.category?.message}>
                  {(ids) =>
                    isEditing ? (
                      // The category identifies the budget; changing it would be
                      // a different budget, so editing only adjusts the limit.
                      <Input {...ids} value={field.value} disabled readOnly />
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={ids.id} aria-invalid={ids["aria-invalid"]}>
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.length ? (
                            available.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-muted-foreground px-2.5 py-3 text-sm">
                              Every category already has a budget this month.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )
                  }
                </Field>
              )}
            />

            <Field
              label="Monthly limit"
              required
              hint="You will be warned as spending approaches this amount."
              error={errors.limit?.message}
            >
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
                    {...register("limit")}
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
              {isEditing ? "Save changes" : "Create budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
