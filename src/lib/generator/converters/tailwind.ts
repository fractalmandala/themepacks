/**
 * Parser for allsets.sass (WebAwesome / Tailwind-style color ramp systems)
 */

import fs from 'node:fs';
import { normalizeColor } from '../../color-utils.ts';
import type { FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

export function convertTailwind(filePath: string): FractalThemeSet {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	const themes: FractalTheme[] = [];

	let currentPalette: string | null = null;
	let currentColors: FractalColor[] = [];
	let currentKeyColors: Record<string, string> = {};

	function commitCurrent() {
		if (currentPalette && currentColors.length > 0) {
			const id = `tailwind-${currentPalette}`;
			const name = `Tailwind ${capitalize(currentPalette.replace(/^wa-palette-/, '').replace(/-/g, ' '))}`;

			// Gray-95 is light bg, Gray-05 is dark bg; Gray-10 is text, Blue-60 is accent
			const gray95 = currentColors.find((c) => c.name === 'gray-95')?.hex;
			const gray10 = currentColors.find((c) => c.name === 'gray-10')?.hex;
			const blue60 = currentColors.find((c) => c.name === 'blue-60' || c.name === 'blue-50')?.hex;

			themes.push({
				id,
				name,
				system: 'tailwind',
				mode: null,
				family: currentPalette,
				description: `Lightness scale color system with steps 05-95 across 10 spectral hues (${currentPalette}).`,
				bgColor: gray95,
				textColor: gray10,
				accentColor: blue60,
				colors: currentColors,
				meta: {
					keyTokens: currentKeyColors
				}
			});
		}
		currentPalette = null;
		currentColors = [];
		currentKeyColors = {};
	}

	for (const rawLine of lines) {
		const line = rawLine.trim();

		// Detect palette header e.g. ".wa-palette-bright" or ".wa-palette-default"
		const paletteMatch = line.match(/^\.?(wa-palette-[\w-]+)/);
		if (paletteMatch) {
			const palName = paletteMatch[1];
			if (currentPalette && currentPalette !== palName) {
				commitCurrent();
			}
			currentPalette = palName;
			continue;
		}

		if (!currentPalette) continue;

		// Match color declaration e.g. "--wa-color-red-95: #ffefef" or "--wa-color-orange-95: oklch(...)"
		const tokenMatch = line.match(/^--wa-color-([a-z]+)-([0-9]{2}):\s*([^;]+)/);
		if (tokenMatch) {
			const hue = tokenMatch[1];
			const step = tokenMatch[2];
			const rawVal = tokenMatch[3].trim();
			const tokenName = `${hue}-${step}`;

			const normalized = normalizeColor(tokenName, rawVal, {
				role: 'ramp',
				step: parseInt(step, 10),
				category: hue
			});

			currentColors.push(normalized);
			continue;
		}

		// Match key aliases e.g. "--wa-color-red: var(--wa-color-red-60)"
		const keyMatch = line.match(/^--wa-color-([a-z]+):\s*var\(--wa-color-[a-z]+-([0-9]{2})\)/);
		if (keyMatch) {
			currentKeyColors[keyMatch[1]] = keyMatch[2];
		}
	}

	commitCurrent();

	return {
		id: 'themesTailwind',
		name: 'Tailwind & WebAwesome Palettes',
		system: 'tailwind',
		group: 'swatch',
		description: 'Complete multi-hue lightness scale color systems (bright, default, and shoelace palettes).',
		count: themes.length,
		themes
	};
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
