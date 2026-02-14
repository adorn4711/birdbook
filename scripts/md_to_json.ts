#!/usr/bin/env bun

/**
 * md_to_json.ts
 *
 * Reads a Markdown file and extracts the section
 *   "## I. Der Tenor (Die Entscheidung)"
 * Produces a JSON file with the same basename in the same folder containing
 * one entry per "###" header under that section. Each entry includes:
 *  - title: the H3 text
 *  - description: the first non-empty paragraph after the H3 (until the first bullet)
 *  - items: array of { subtitle, sub_description } parsed from bullet list lines
 *    where subtitle is the bold marker (e.g., **bb)**) and sub_description is the trailing text.
 *
 * Usage:
 *   bun ./scripts/md_to_json.ts [inputMdPath] [outputJsonPath]
 * Defaults:
 *   inputMdPath: public/assets/data/urteil_etwas_ausfuehrlicher.md
 *   outputJsonPath: same folder + same basename with .json
 */

import { promises as fs } from 'fs';
import path from 'path';

interface SubItem { subtitle: string; sub_description: string }
interface Entry { title: string; description?: string; items: SubItem[] }
interface Output { section_title: string; entries: Entry[] }

const SECTION_TITLE = 'I. Der Tenor (Die Entscheidung)';

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function isH2(line: string): boolean {
  return /^##\s+/.test(line.trim());
}

function isTargetH2(line: string): boolean {
  const m = /^##\s+(.*)$/.exec(line.trim());
  return !!m && m[1].trim() === SECTION_TITLE;
}

function isH3(line: string): boolean {
  return /^###\s+/.test(line.trim());
}

function parseBoldLabel(line: string): { subtitle: string; rest: string } | null {
  // Example: "*   **bb)** The text..."
  const trimmed = line.trim();
  if (!trimmed.startsWith('*')) return null;
  // Remove leading '*'
  const afterStar = trimmed.replace(/^\*\s+/, '');
  // Capture bold "**...**" if present
  const boldMatch = /^\*\*(.+?)\*\*\s*(.*)$/.exec(afterStar);
  if (boldMatch) {
    return { subtitle: boldMatch[1].trim(), rest: boldMatch[2].trim() };
  }
  // No bold label; treat entire line as description
  return { subtitle: '', rest: afterStar.trim() };
}

function extractSection(lines: string[]): string[] {
  let inSection = false;
  const section: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inSection) {
      if (isTargetH2(line)) {
        inSection = true;
        continue; // skip the H2 line itself
      }
    } else {
      if (isH2(line)) {
        // next H2 reached; end of section
        break;
      }
      section.push(line);
    }
  }
  return section;
}

function parseEntries(sectionLines: string[]): Entry[] {
  const entries: Entry[] = [];
  let i = 0;
  while (i < sectionLines.length) {
    const line = sectionLines[i];
    if (isH3(line)) {
      // New entry
      const title = line.replace(/^###\s+/, '').trim();
      i++;
      // Collect description: first non-empty non-bullet line(s) until a bullet or next header
      let description = '';
      const descLines: string[] = [];
      while (i < sectionLines.length) {
        const l = sectionLines[i];
        if (isH2(l) || isH3(l)) break;
        if (/^\*\s+/.test(l.trim())) break; // bullets start
        if (l.trim() !== '') descLines.push(l.trim());
        i++;
      }
      if (descLines.length) description = descLines.join(' ');

      // Collect bullets
      const items: SubItem[] = [];
      while (i < sectionLines.length) {
        const l = sectionLines[i];
        if (isH2(l) || isH3(l)) break; // next header
        const parsed = parseBoldLabel(l);
        if (parsed) {
          // Skip empty lines; only push when we have some content
          if (parsed.subtitle !== '' || parsed.rest !== '') {
            items.push({ subtitle: parsed.subtitle, sub_description: parsed.rest });
          }
        }
        i++;
      }

      entries.push({ title, description: description || undefined, items });
    } else {
      i++;
    }
  }
  return entries;
}

async function main() {
  const defaultInput = path.join('public', 'assets', 'data', 'urteil_etwas_ausfuehrlicher.md');
  const inputMd = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(defaultInput);
  const outputJson = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.resolve(path.dirname(inputMd), path.basename(inputMd, path.extname(inputMd)) + '.json');

  const text = await fs.readFile(inputMd, 'utf8');
  const lines = splitLines(text);
  const section = extractSection(lines);
  const entries = parseEntries(section);
  const out: Output = { section_title: SECTION_TITLE, entries };

  await fs.writeFile(outputJson, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${entries.length} entries to ${outputJson}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
