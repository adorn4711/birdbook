#!/usr/bin/env bun

/**
 * Converts a CSV file to JSON (array of objects) and writes it next to the CSV
 * with the same basename and .json extension.
 *
 * Usage:
 *   bun ./scripts/convert_csv_json.ts [inputCsvPath] [outputJsonPath]
 *
 * Defaults:
 *   inputCsvPath: public/assets/data/urteil_mit_schaetzung_20260107.csv
 *   outputJsonPath: public/assets/data/urteil_mit_schaetzung_20260107.json
 */

import { promises as fs } from 'fs';
import path from 'path';

function detectDelimiter(line: string): string {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const c of candidates) {
    const count = (line.match(new RegExp(`\\${c}`, 'g')) || []).length;
    if (count > bestCount) {
      best = c;
      bestCount = count;
    }
  }
  return best;
}

/**
 * RFC4180-ish CSV parser supporting quoted fields and escaped quotes.
 */
function parseCSV(text: string, delimiter?: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  // Normalize newlines
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Auto-detect delimiter from first line if not provided
  if (!delimiter) {
    const firstLine = text.split('\n', 1)[0] ?? '';
    delimiter = detectDelimiter(firstLine);
  }

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === delimiter) {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  // Push last field/row if any
  row.push(field);
  if (row.length > 1 || row[0] !== '') {
    rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows: string[][]): Record<string, unknown>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  
  const mapping: Record<number, string> = {0: 'id', 1: 'description', 2: 'verdict', 3: 'estimate'};
  const dataRows = rows.slice(1);
  const objects = dataRows.map((r) => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < headers.length; i++) {
      const key = mapping[i] || headers[i] || `col_${i}`;

      const raw = (r[i] ?? '').trim();
      // Try to coerce numbers when appropriate
      const num = Number(raw);
      const val = raw === '' ? '' : !Number.isNaN(num) && raw.match(/^[-+]?\d+(\.\d+)?$/) ? num : raw;
      obj[key] = val;
    }
    return obj;
  });
  return objects;
}

async function main() {
  const defaultInput = path.join('public', 'assets', 'data', 'urteil_mit_schaetzung_20260107.csv');
  const inputCsv = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(defaultInput);
  const outputJson = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.resolve(path.dirname(inputCsv), path.basename(inputCsv, path.extname(inputCsv)) + '.json');

  console.log(`Reading CSV: ${inputCsv}`);
  const csvText = await fs.readFile(inputCsv, 'utf8');
  const rows = parseCSV(csvText);
  const json = rowsToObjects(rows);

  console.log(`Writing JSON: ${outputJson}`);
  await fs.writeFile(outputJson, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Done. ${json.length} records written.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
