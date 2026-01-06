export function calculateStats(transactions: any[]) {
  let income = 0;
  let expense = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let thisMonthExpense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;

    const date = new Date(t.date);
    if (
      t.type === "expense" &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    ) {
      thisMonthExpense += t.amount;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
    thisMonthExpense,
  };
}
