/**
 * Master Conversion Script
 * 
 * Orchestrates parsing of all design system sources into the canonical FractalTheme schema
 * and emits the Single Source of Truth Trio (.json, .ts, .md) for each themeset.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { convertBase16 } from './converters/base16.ts';
import { convertTailwind } from './converters/tailwind.ts';
import { convertUno } from './converters/uno.ts';
import { convertFracta } from './converters/fracta.ts';
import { convertVecta } from './converters/vecta.ts';
import { convertArtisan } from './converters/artisan.ts';
import { convertColourways } from './converters/colourways.ts';
import { convertIndes } from './converters/indes.ts';
import { convertThemeplates } from './converters/themeplates.ts';
import { generateJson, generateMarkdown, generateTs } from './generator.ts';
import type { FractalThemeSet } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, '../canonical');

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function loadOrConvert(
	setName: string,
	rawSourcePath: string,
	convertFn: () => FractalThemeSet
): FractalThemeSet {
	if (fs.existsSync(rawSourcePath)) {
		const result = convertFn();
		emitTrio(setName, result);
		return result;
	}

	const existingJsonPath = path.join(OUT_DIR, `${setName}.json`);
	if (fs.existsSync(existingJsonPath)) {
		console.log(`  ℹ Using existing canonical cache for ${setName}`);
		return JSON.parse(fs.readFileSync(existingJsonPath, 'utf-8')) as FractalThemeSet;
	}

	throw new Error(`Neither raw source (${rawSourcePath}) nor canonical JSON (${existingJsonPath}) exists.`);
}

export function runAllConversions() {
	ensureDir(OUT_DIR);

	console.log('🚀 Starting Canonical Design System Theming conversion...\n');

	// 1. Base16
	console.log('📦 Converting 1/8: themesBase16 (base16/*.yaml)...');
	const base16Dir = path.join(__dirname, 'base16');
	const themesBase16 = loadOrConvert('themesBase16', base16Dir, () => convertBase16(base16Dir));

	// 2. Tailwind / WebAwesome
	console.log('📦 Converting 2/8: themesTailwind (allsets.sass)...');
	const tailwindPath = path.join(__dirname, 'allsets.sass');
	const themesTailwind = loadOrConvert('themesTailwind', tailwindPath, () => convertTailwind(tailwindPath));

	// 3. UnoCSS / Open Color
	console.log('📦 Converting 3/8: themesUno (colors.md)...');
	const unoPath = path.join(__dirname, 'colors.md');
	const themesUno = loadOrConvert('themesUno', unoPath, () => convertUno(unoPath));

	// 4. Fracta
	console.log('📦 Converting 4/8: themesFracta (palettes.json)...');
	const fractaPath = path.join(__dirname, 'palettes.json');
	const themesFracta = loadOrConvert('themesFracta', fractaPath, () => convertFracta(fractaPath));

	// 5. Vecta
	console.log('📦 Converting 5/8: themesVecta (themes.ts)...');
	const themesVecta = convertVecta();
	emitTrio('themesVecta', themesVecta);

	// 6. Artista
	console.log('📦 Converting 6/8: themesArtista (artisan-colors.ts)...');
	const themesArtista = convertArtisan();
	emitTrio('themesArtista', themesArtista);

	// 7. Colourways
	console.log('📦 Converting 7/8: themesColourways (colourways.ts)...');
	const themesColourways = convertColourways();
	emitTrio('themesColourways', themesColourways);

	// 8. Indes
	console.log('📦 Converting 8/9: themesIndes (indes.json)...');
	const themesIndes = convertIndes();
	emitTrio('themesIndes', themesIndes);

	// 9. Themeplates
	console.log('📦 Converting 9/9: themePlates (themeplates.sass)...');
	const themePlates = convertThemeplates();
	emitTrio('themePlates', themePlates);

	// Master Index
	emitMasterIndex([
		themesBase16,
		themesTailwind,
		themesUno,
		themesFracta,
		themesVecta,
		themesArtista,
		themesColourways,
		themesIndes,
		themePlates
	]);

	console.log('\n✨ All 9 themesets successfully converted and emitted to canonical/');
}

function emitTrio(setName: string, themeSet: FractalThemeSet) {
	const jsonPath = path.join(OUT_DIR, `${setName}.json`);
	const tsPath = path.join(OUT_DIR, `${setName}.ts`);
	const mdPath = path.join(OUT_DIR, `${setName}.md`);

	fs.writeFileSync(jsonPath, generateJson(themeSet), 'utf-8');
	fs.writeFileSync(tsPath, generateTs(themeSet, setName), 'utf-8');
	fs.writeFileSync(mdPath, generateMarkdown(themeSet), 'utf-8');

	console.log(`  ✓ ${setName}:`);
	console.log(`    - JSON: ${path.relative(process.cwd(), jsonPath)}`);
	console.log(`    - TS:   ${path.relative(process.cwd(), tsPath)}`);
	console.log(`    - MD:   ${path.relative(process.cwd(), mdPath)} (${themeSet.themes.length} themes, ${totalColors(themeSet)} colors)`);
}

function totalColors(set: FractalThemeSet): number {
	return set.themes.reduce((acc, t) => acc + t.colors.length, 0);
}

function emitMasterIndex(themeSets: FractalThemeSet[]) {
	const indexTsPath = path.join(OUT_DIR, 'index.ts');
	const indexJsonPath = path.join(OUT_DIR, 'index.json');

	const summary = themeSets.map((s) => ({
		id: s.id,
		name: s.name,
		system: s.system,
		description: s.description,
		count: s.count,
		totalColors: totalColors(s)
	}));

	fs.writeFileSync(indexJsonPath, JSON.stringify(summary, null, 2), 'utf-8');

	const imports = themeSets
		.map((s) => `import { ${s.id} } from './${s.id}.ts';`)
		.join('\n');

	const exportsList = themeSets.map((s) => `\t${s.id}`).join(',\n');

	const tsContent = `/**
 * Master Index for Canonical Fractal Themesets
 */

import type { FractalTheme, FractalThemeSet } from '../types.ts';

${imports}

export {
${exportsList}
};

export const ALL_THEME_SETS: readonly FractalThemeSet[] = [
${exportsList}
] as const;

export function getAllThemes(): FractalTheme[] {
	return ALL_THEME_SETS.flatMap((s) => s.themes);
}

export function getThemeById(id: string): FractalTheme | undefined {
	for (const set of ALL_THEME_SETS) {
		const found = set.themes.find((t) => t.id === id);
		if (found) return found;
	}
	return undefined;
}

export * from '../types.ts';
`;

	fs.writeFileSync(indexTsPath, tsContent, 'utf-8');
	console.log(`  ✓ Master Index emitted: index.ts, index.json`);
}

// Auto-run if executed directly via Node
runAllConversions();
