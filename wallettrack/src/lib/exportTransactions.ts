import Papa from "papaparse";

export function exportTransactionsCSV(transactions: any[]) {
  const csv = Papa.unparse(
    transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Title: t.title,
      Amount: t.amount,
      Type: t.type,
      Category: t.category,
    }))
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();

  URL.revokeObjectURL(url);
}
