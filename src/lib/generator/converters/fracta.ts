/**
 * Parser for palettes.json (Fracta paired syntax and editor themes)
 */

import fs from 'node:fs';
import { normalizeColor } from '../../color-utils.ts';
import type { ColorRole, FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

const TOKEN_ROLE_MAP: Record<string, ColorRole> = {
	bg: 'background',
	alt: 'background',
	sel: 'background',
	border: 'border',
	fg: 'foreground',
	prop: 'foreground',
	accent: 'accent',
	fn: 'syntax',
	op: 'syntax',
	key: 'syntax',
	num: 'syntax',
	str: 'syntax',
	type: 'syntax',
	punct: 'syntax',
	comment: 'syntax'
};

interface RawFractaTheme {
	name: string;
	family: string;
	tag?: string;
	thesis?: string;
	light?: Record<string, string>;
	dark?: Record<string, string>;
}

interface RawFractaJson {
	themes: RawFractaTheme[];
}

export function convertFracta(filePath: string): FractalThemeSet {
	const content = fs.readFileSync(filePath, 'utf-8');
	const parsed: RawFractaJson = JSON.parse(content);

	const themes: FractalTheme[] = [];

	for (const raw of parsed.themes) {
		const baseSlug = raw.name.toLowerCase().replace(/\s+/g, '-');

		// Process Light Variant
		if (raw.light) {
			const lightColors: FractalColor[] = Object.entries(raw.light).map(([token, hex]) =>
				normalizeColor(token, hex, {
					role: TOKEN_ROLE_MAP[token] ?? 'other'
				})
			);

			themes.push({
				id: `fracta-${baseSlug}-light`,
				name: `${raw.name} Light`,
				system: 'fracta',
				mode: 'light',
				family: raw.family,
				description: raw.thesis,
				bgColor: raw.light.bg,
				textColor: raw.light.fg,
				accentColor: raw.light.accent,
				colors: lightColors,
				meta: {
					tag: raw.tag,
					thesis: raw.thesis
				}
			});
		}

		// Process Dark Variant
		if (raw.dark) {
			const darkColors: FractalColor[] = Object.entries(raw.dark).map(([token, hex]) =>
				normalizeColor(token, hex, {
					role: TOKEN_ROLE_MAP[token] ?? 'other'
				})
			);

			themes.push({
				id: `fracta-${baseSlug}-dark`,
				name: `${raw.name} Dark`,
				system: 'fracta',
				mode: 'dark',
				family: raw.family,
				description: raw.thesis,
				bgColor: raw.dark.bg,
				textColor: raw.dark.fg,
				accentColor: raw.dark.accent,
				colors: darkColors,
				meta: {
					tag: raw.tag,
					thesis: raw.thesis
				}
			});
		}
	}

	return {
		id: 'themesFracta',
		name: 'Fracta Editor Themes',
		system: 'fracta',
		group: 'styler',
		description: 'Paired light and dark syntax and UI chrome palettes calibrated for focused editing.',
		count: themes.length,
		themes
	};
}
