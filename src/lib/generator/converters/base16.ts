/**
 * Parser for Base16 YAML Theme Files
 */

import fs from 'node:fs';
import path from 'node:path';
import { normalizeColor } from '../../color-utils.ts';
import type { ColorRole, FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

const ROLE_MAP: Record<string, ColorRole> = {
	base00: 'background', // Default Background
	base01: 'background', // Lighter Background (status bars, line numbers)
	base02: 'background', // Selection Background
	base03: 'border',     // Comments, Invisibles, Line Highlighting
	base04: 'foreground', // Dark Foreground (Status bars)
	base05: 'foreground', // Default Foreground, Caret, Delimiters, Operators
	base06: 'foreground', // Light Foreground (Not often used)
	base07: 'foreground', // Light Background (Not often used)
	base08: 'syntax',     // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
	base09: 'syntax',     // Integers, Boolean, Constants, XML Attributes, Markup Link Url
	base0A: 'syntax',     // Classes, Markup Bold, Search Text Background
	base0B: 'syntax',     // Strings, Inherited Class, Markup Code, Diff Inserted
	base0C: 'syntax',     // Support, Regular Expressions, Escape Characters, Markup Quotes
	base0D: 'accent',     // Functions, Methods, Attribute IDs, Headings
	base0E: 'syntax',     // Keywords, Storage, Selector, Markup Italic, Diff Changed
	base0F: 'syntax'      // Deprecated, Opening/Closing Embedded Language Tags
};

interface SimpleYamlBase16 {
	system?: string;
	name: string;
	author?: string;
	variant?: 'light' | 'dark';
	palette: Record<string, string>;
}

export function parseSimpleYaml(content: string): SimpleYamlBase16 | null {
	const lines = content.split('\n');
	let name = '';
	let author = '';
	let variant: 'light' | 'dark' = 'dark';
	const palette: Record<string, string> = {};

	let inPalette = false;

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;

		if (line.startsWith('name:')) {
			name = line.replace('name:', '').trim().replace(/^["']|["']$/g, '');
		} else if (line.startsWith('author:')) {
			author = line.replace('author:', '').trim().replace(/^["']|["']$/g, '');
		} else if (line.startsWith('variant:')) {
			const v = line.replace('variant:', '').trim().replace(/^["']|["']$/g, '').toLowerCase();
			if (v === 'light' || v === 'dark') variant = v;
		} else if (line.startsWith('palette:')) {
			inPalette = true;
		} else if (inPalette) {
			const match = line.match(/^(base[0-9A-Fa-f]{2}):\s*["']?(#?[0-9a-fA-F]{6})["']?/);
			if (match) {
				const key = match[1];
				let hex = match[2];
				if (!hex.startsWith('#')) hex = '#' + hex;
				palette[key] = hex;
			}
		}
	}

	if (!name || Object.keys(palette).length === 0) return null;

	return {
		name,
		author,
		variant,
		palette
	};
}

export function convertBase16(dirPath: string): FractalThemeSet {
	const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
	const themes: FractalTheme[] = [];

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const content = fs.readFileSync(filePath, 'utf-8');
		const parsed = parseSimpleYaml(content);
		if (!parsed) continue;

		const baseSlug = path.basename(file, path.extname(file));
		const id = `base16-${baseSlug}`;
		const colors: FractalColor[] = [];

		for (const [key, hexVal] of Object.entries(parsed.palette)) {
			const role = ROLE_MAP[key] ?? 'syntax';
			colors.push(
				normalizeColor(key, hexVal, {
					role,
					step: key
				})
			);
		}

		themes.push({
			id,
			name: parsed.name,
			system: 'base16',
			mode: parsed.variant ?? 'dark',
			author: parsed.author,
			family: baseSlug.replace(/-(light|dark)$/, ''),
			bgColor: parsed.palette.base00,
			textColor: parsed.palette.base05,
			accentColor: parsed.palette.base0D ?? parsed.palette.base08,
			colors
		});
	}

	return {
		id: 'themesBase16',
		name: 'Base16 Color Themes',
		system: 'base16',
		group: 'ide',
		description: 'Canonical Base16 styling architecture mapping 16 indexed functional color registers.',
		count: themes.length,
		themes
	};
}
