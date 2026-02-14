#!/usr/bin/env bun

/**
 * convert_json.ts
 *
 * Reads the JSON produced by md_to_json.ts (default:
 *   public/assets/data/urteil_etwas_ausfuehrlicher.json)
 * and converts its "entries" into an array of WorkItem objects matching
 * src/app/data/workitem.ts.
 *
 * Output is written next to the input with the same basename and the suffix
 * ".workitems.json" (by default:
 *   public/assets/data/urteil_etwas_ausfuehrlicher.workitems.json)
 *
 * Usage:
 *   bun ./scripts/convert_json.ts [inputJson] [outputJson]
 */

import { promises as fs } from 'fs';
import path from 'path';

type Verdict = 'yes' | 'no' | 'maybe';

interface WorkItem {
	id: string;
	title: string;
	verdict: Verdict;
	estimate: number;
	description: string;
	subitems?: WorkItem[];
}

interface SubItem { subtitle: string; sub_description: string }
interface Entry { title: string; description?: string; items: SubItem[] }
interface InputJson { section_title: string; entries: Entry[] }

function buildParentDescription(entry: Entry): string {
	// Only keep the entry-level description; subitems are represented separately
	return (entry.description || '').trim();
}

function toSubWorkItems(items: SubItem[], parentId: string): WorkItem[] {
	const subs: WorkItem[] = [];
	let idx = 1;
	for (const it of items) {
		const id = `${parentId}-${idx}`;
		const title = (it.subtitle || '').trim() || `Item ${idx}`;
		const description = it.sub_description?.trim() || '';
		const verdict: Verdict = 'maybe';
		const estimate = 0;
		subs.push({ id, title, verdict, estimate, description });
		idx++;
	}
	return subs;
}

function toWorkItems(entries: Entry[]): WorkItem[] {
	const items: WorkItem[] = [];
	let counter = 1;
	for (const e of entries) {
		const id = `E-${String(counter).padStart(3, '0')}`;
		const title = e.title;
		const description = buildParentDescription(e);
		const verdict: Verdict = 'maybe';
		const estimate = 0;
		const subitems = toSubWorkItems(e.items || [], id);
		const wi: WorkItem = { id, title, verdict, estimate, description, subitems: subitems.length ? subitems : undefined };
		items.push(wi);
		counter++;
	}
	return items;
}

async function main() {
	const defaultInput = path.join('public', 'assets', 'data', 'urteil_etwas_ausfuehrlicher.json');
	const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(defaultInput);
	const outputPath = process.argv[3]
		? path.resolve(process.argv[3])
		: path.resolve(
				path.dirname(inputPath),
				path.basename(inputPath, path.extname(inputPath)) + '.workitems.json'
			);

	const raw = await fs.readFile(inputPath, 'utf8');
	const parsed: InputJson = JSON.parse(raw);
	const workitems = toWorkItems(parsed.entries || []);

	await fs.writeFile(outputPath, JSON.stringify(workitems, null, 2) + '\n', 'utf8');
	console.log(`Wrote ${workitems.length} workitems to ${outputPath}`);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
