/**
 * Converter for themeplates.sass (Fractal foundation surface plates)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeColor } from '../../color-utils.ts';
import type { ColorRole, FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAMILIES: Record<string, { name: string; description: string }> = {
	a: { name: 'Slate Plate', description: 'Cool slate and steel tones with balanced neutral contrast.' },
	b: { name: 'Zinc Plate', description: 'Pure modern zinc monochrome neutrals with deep blacks.' },
	c: { name: 'Stone Plate', description: 'Warm sand and limestone earth hues with organic warmth.' },
	d: { name: 'Sage Plate', description: 'Muted pine, mint, and sage green undertones inspired by forest foliage.' },
	e: { name: 'Rose Plate', description: 'Subtle blush, rosewood, and terracotta tinted neutrals.' },
	f: { name: 'Steel Plate', description: 'Subtle technical blue-grey steel tones with high clarity.' },
	g: { name: 'Earthen Plate', description: 'Sun-baked clay, warm desert dusk, and rich bronze earth.' },
	h: { name: 'Iris Plate', description: 'Twilight lavender, soft violet mist, and rich indigo shadows.' }
};

export function convertThemeplates(sassFilePath?: string): FractalThemeSet {
	const defaultPath = path.resolve(__dirname, '../../../../../fractalstyler/src/lib/styles/themeplates.sass');
	const filePath = sassFilePath ?? defaultPath;
	const content = fs.readFileSync(filePath, 'utf-8');

	const colorMap: Record<string, string> = {};
	for (const line of content.split(/\r?\n/)) {
		const m = line.match(/^\$([a-zA-Z0-9]+):\s*(#[0-9a-fA-F]{3,8})/);
		if (m) {
			colorMap[m[1]] = m[2];
		}
	}

	const themes: FractalTheme[] = [];

	for (const [letter, info] of Object.entries(FAMILIES)) {
		// 1. Light (white) variant
		const lightColors: FractalColor[] = [];
		for (let step = 1; step <= 9; step++) {
			const varName = `white${letter}${step}`;
			const hex = colorMap[varName];
			if (!hex) continue;
			const role: ColorRole = step === 1 ? 'background' : step === 9 ? 'foreground' : step >= 5 ? 'accent' : 'ramp';
			lightColors.push(
				normalizeColor(varName, hex, {
					role,
					step,
					category: `plate-${letter}`
				})
			);
		}

		themes.push({
			id: `themeplate-plate-${letter}-light`,
			name: `${info.name} Light`,
			system: 'themeplates',
			mode: 'light',
			family: `plate-${letter}`,
			description: `${info.description} Calibrated light surface ramp.`,
			bgColor: colorMap[`white${letter}1`] ?? '#FFFFFF',
			textColor: colorMap[`white${letter}9`] ?? '#000000',
			accentColor: colorMap[`white${letter}6`] ?? '#666666',
			colors: lightColors
		});

		// 2. Dark (black) variant
		const darkColors: FractalColor[] = [];
		for (let step = 1; step <= 9; step++) {
			const varName = `black${letter}${step}`;
			const hex = colorMap[varName];
			if (!hex) continue;
			const role: ColorRole = step === 1 ? 'background' : step === 9 ? 'foreground' : step >= 5 ? 'accent' : 'ramp';
			darkColors.push(
				normalizeColor(varName, hex, {
					role,
					step,
					category: `plate-${letter}`
				})
			);
		}

		themes.push({
			id: `themeplate-plate-${letter}-dark`,
			name: `${info.name} Dark`,
			system: 'themeplates',
			mode: 'dark',
			family: `plate-${letter}`,
			description: `${info.description} Calibrated dark surface ramp.`,
			bgColor: colorMap[`black${letter}1`] ?? '#000000',
			textColor: colorMap[`black${letter}9`] ?? '#FFFFFF',
			accentColor: colorMap[`black${letter}6`] ?? '#888888',
			colors: darkColors
		});
	}

	return {
		id: 'themePlates',
		name: 'Themeplates Foundation Palettes',
		system: 'themeplates',
		group: 'styler',
		description: 'Systemic 9-step calibrated light and dark surface and chrome plates spanning 8 chromatic and neutral undertones.',
		count: themes.length,
		themes
	};
}
