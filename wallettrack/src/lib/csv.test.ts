import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("leaves plain text untouched", () => {
    expect(csvCell("Groceries")).toBe("Groceries");
  });

  it("quotes values containing a comma, quote or newline", () => {
    expect(csvCell("Rent, September")).toBe('"Rent, September"');
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
  });

  it("renders empty for null and undefined", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("keeps numbers numeric so spreadsheets can sum them", () => {
    expect(csvCell(1875.25)).toBe("1875.25");
    expect(csvCell(0)).toBe("0");
  });

  describe("spreadsheet formula injection", () => {
    // Excel, Sheets and LibreOffice execute any cell whose text starts with one
    // of these. A transaction note is attacker-controlled text, so each must be
    // defused before it reaches a downloaded file.
    const dangerous = [
      '=HYPERLINK("http://evil.tld","Click")',
      "+1+1",
      "-1+1",
      "@SUM(A1:A9)",
      "\tleading tab",
      "\rleading carriage return",
    ];

    it.each(dangerous)("neutralises %j with a leading quote", (input) => {
      const cell = csvCell(input);
      // Strip the CSV quoting layer before checking the payload itself.
      const inner = cell.startsWith('"') ? cell.slice(1, -1).replace(/""/g, '"') : cell;
      expect(inner.startsWith("'")).toBe(true);
      expect(inner.slice(1)).toBe(input);
    });

    it("does not touch text that merely contains an equals sign", () => {
      expect(csvCell("width=10")).toBe("width=10");
    });
  });
});

describe("toCsv", () => {
  it("writes a header row and CRLF line endings", () => {
    const csv = toCsv(
      [
        { date: "2026-09-02", amount: 4820.5 },
        { date: "2026-09-05", amount: 1290 },
      ],
      [
        { header: "Date", value: (row) => row.date },
        { header: "Amount", value: (row) => row.amount },
      ],
    );

    expect(csv).toBe("Date,Amount\r\n2026-09-02,4820.5\r\n2026-09-05,1290");
  });

  it("emits only the header row when there is nothing to export", () => {
    const csv = toCsv([], [{ header: "Date", value: () => "" }]);
    expect(csv).toBe("Date");
  });
});
