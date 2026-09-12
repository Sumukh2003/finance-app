/**
 * Shapes returned by the API, shared by the routes that produce them and the
 * components that consume them, so a change on one side is a type error on the
 * other rather than a runtime surprise.
 */

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  /** ISO-8601 timestamp. */
  date: string;
  amount: number;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type TransactionTotals = {
  income: number;
  expense: number;
  net: number;
  count: number;
};

export type TransactionListResponse = {
  transactions: Transaction[];
  pagination: Pagination;
  /** Totals for the whole filtered set, not just the current page. */
  totals: TransactionTotals;
};

export type BudgetSummaryItem = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;
  overBudget: boolean;
};

export type BudgetSummary = {
  month: string;
  items: BudgetSummaryItem[];
  totals: {
    limit: number;
    spent: number;
    remaining: number;
    progress: number;
    overBudgetCount: number;
  };
};

export type CategoryBreakdown = {
  category: string;
  total: number;
  count: number;
  /** Percentage of total expense for the month. */
  share: number;
};

export type TrendPoint = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export type DashboardResponse = {
  month: string;
  summary: {
    /** Income recorded in the selected month. */
    income: number;
    /** Expense recorded in the selected month. */
    expense: number;
    /** The month's own movement: `income - expense`. */
    net: number;
    /**
     * Running balance across every transaction up to the end of the selected
     * month. Any addition or deletion, in any month, changes this.
     */
    balance: number;
    /** Running balance at the start of the month, i.e. `balance - net`. */
    openingBalance: number;
    /** The month's net as a share of the month's income. */
    savingsRate: number;
    previous: { income: number; expense: number; net: number };
  };
  categories: CategoryBreakdown[];
  trend: TrendPoint[];
  budgets: BudgetSummary;
  recentTransactions: Transaction[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt?: string;
};
