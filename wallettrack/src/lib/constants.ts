/** Categories offered in pickers. Users may still type their own. */
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Insurance",
  "Debt & Loans",
  "Personal Care",
  "Gifts & Donations",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental Income",
  "Refunds",
  "Gifts",
  "Other",
] as const;

export const ALL_CATEGORIES = [
  ...new Set<string>([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
].sort();

export function categoriesForType(type: "income" | "expense"): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/** Sort options exposed by the transactions list, mapped to Mongo sort specs. */
export const TRANSACTION_SORTS = {
  "-date": { label: "Newest first", spec: { date: -1, _id: -1 } },
  date: { label: "Oldest first", spec: { date: 1, _id: 1 } },
  "-amount": { label: "Highest amount", spec: { amount: -1, _id: -1 } },
  amount: { label: "Lowest amount", spec: { amount: 1, _id: 1 } },
  category: { label: "Category A–Z", spec: { category: 1, date: -1 } },
} as const;

export type TransactionSort = keyof typeof TRANSACTION_SORTS;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Hard ceiling on a single amount, guarding against fat-finger and overflow. */
export const MAX_AMOUNT = 1_000_000_000;
