/**
 * Parser for colors.md (Open Color / UnoCSS color ramps)
 */

import fs from 'node:fs';
import { normalizeColor } from '../../color-utils.ts';
import type { FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

export function convertUno(filePath: string): FractalThemeSet {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	const colors: FractalColor[] = [];
	let currentCategory = 'gray';

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;

		if (line.startsWith('//')) {
			currentCategory = line.replace(/^\/\/\s*/, '').toLowerCase();
			continue;
		}

		// Match e.g. "$gray-0: #f8f9fa"
		const match = line.match(/^\$([a-zA-Z]+)-([0-9]+):\s*(#[0-9a-fA-F]{3,8})/);
		if (match) {
			const hue = match[1].toLowerCase();
			const step = parseInt(match[2], 10);
			const hex = match[3];
			const tokenName = `${hue}-${step}`;

			colors.push(
				normalizeColor(tokenName, hex, {
					role: 'ramp',
					step,
					category: hue
				})
			);
		}
	}

	const theme: FractalTheme = {
		id: 'uno-open-color',
		name: 'UnoCSS Open Color',
		system: 'uno',
		mode: null,
		family: 'open-color',
		description: 'Open Color standard color ramps (steps 0-9) across 13 calibrated chromatic hues.',
		bgColor: colors.find((c) => c.name === 'gray-0')?.hex,
		textColor: colors.find((c) => c.name === 'gray-9')?.hex,
		accentColor: colors.find((c) => c.name === 'blue-6')?.hex,
		colors
	};

	return {
		id: 'themesUno',
		name: 'UnoCSS Open Color Palettes',
		system: 'uno',
		group: 'swatch',
		description: 'Calibrated color ramps spanning 13 chromatic hues with 10 lightness steps each.',
		count: 1,
		themes: [theme]
	};
}
