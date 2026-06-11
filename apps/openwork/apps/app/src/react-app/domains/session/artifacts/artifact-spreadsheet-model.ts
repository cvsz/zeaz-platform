import ExcelJS from "exceljs";

import type { Data } from "./open-target";

export type SpreadsheetRows = string[][];

function extension(name: string) {
  const clean = name.toLowerCase().split(/[?#]/)[0] ?? name.toLowerCase();
  const index = clean.lastIndexOf(".");
  
  return index >= 0 ? clean.slice(index + 1) : "";
}

function delimiterForName(name: string) {
  return extension(name) === "tsv" ? "\t" : ",";
}

function parseDelimited(content: string, delimiter: string): SpreadsheetRows {
  const rows: SpreadsheetRows = [];

  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }

    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.length ? rows : [[""]];
}

function serializeDelimited(rows: SpreadsheetRows, delimiter: string) {
  return rows
    .map((row) => row.map((value) => {
      const cell = String(value ?? "");

      if (!cell.includes(delimiter) && !/["\r\n]/.test(cell)) {
        return cell;
      }
      
      return `"${cell.replace(/"/g, '""')}"`;
    }).join(delimiter))
    .join("\n") + "\n";
}

function normalizeRows(rows: SpreadsheetRows): SpreadsheetRows {
  return rows.length ? rows : [[""]];
}

function arrayBufferFrom(output: ExcelJS.Buffer): ArrayBuffer {
  const bytes = output instanceof Uint8Array ? output : new Uint8Array(output);
  const copy = new Uint8Array(bytes.byteLength);

  copy.set(bytes);

  return copy.buffer;
}

export async function parseSpreadsheet(input: { name: string; content: Data }): Promise<SpreadsheetRows> {
  const ext = extension(input.name);

  if (ext === "csv" || ext === "tsv") { 
    return parseDelimited(input.content.kind === "text" ? input.content.data : "", delimiterForName(input.name));
  }

  const workbook = new ExcelJS.Workbook();

  if (input.content.kind === "binary") {
    await workbook.xlsx.load(input.content.data);
  }

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    return [[""]]; 
  }

  const rows: SpreadsheetRows = [];

  sheet.eachRow({ includeEmpty: true }, (row) => {
    const values = row.values;
    const cells: string[] = [];

    if (Array.isArray(values)) {
      for (const cell of values.slice(1)) {
        cells.push(cell == null ? "" : String(cell));
      }
    }

    rows.push(cells);
  });

  return normalizeRows(rows);
}

export async function serializeSpreadsheet(name: string, rows: SpreadsheetRows): Promise<Data> {
  const ext = extension(name);

  if (ext === "csv" || ext === "tsv") {
    return { kind: "text", data: serializeDelimited(rows, delimiterForName(name)) };
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  sheet.addRows(rows);

  const output = await workbook.xlsx.writeBuffer();

  return { kind: "binary", data: arrayBufferFrom(output) };
}
