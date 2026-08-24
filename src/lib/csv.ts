// Minimal CSV writing, shared by every export route. No library:
// escaping a cell is three rules (wrap in quotes if it holds a
// comma, a quote, or a newline; double any quote inside it), and
// that is the whole format.

function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(
  header: string[],
  rows: (string | number | null)[][]
): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
  // CRLF, not \n: it is the format's own line ending, and Excel on
  // Windows is more forgiving of it than the reverse.
  return lines.join("\r\n") + "\r\n";
}

// A UTF-8 byte order mark. Without it, Excel on Windows guesses the
// wrong encoding for anything outside plain ASCII (an apostrophe in
// a bet description, a currency symbol) and prints it as garbage.
// Written as an escape so it survives being opened in any editor,
// rather than as a literal invisible character.
export const CSV_BOM = "\uFEFF";
