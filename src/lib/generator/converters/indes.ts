/**
 * Parser for indes.json (Indic regional and cultural UI token themes)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeColor } from '../../color-utils.ts';
import type { ColorRole, FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawIndesItem {
	token: string;
	hexcode: string;
	mode: 'light' | 'dark';
}

type RawIndesData = Record<string, RawIndesItem[]>;

const THEME_METADATA: Record<string, { name: string; description: string }> = {
	gangotri: {
		name: 'Gangotri',
		description: 'Glacial whites, crisp slate blues, and granite bedrock inspired by the sacred Himalayan river source in Uttarakhand.'
	},
	bhirrana: {
		name: 'Bhirrana',
		description: 'Bronze-age ash greys, baked silt, and earthen tones drawn from one of the oldest Indus Valley settlements in Haryana.'
	},
	thar: {
		name: 'Thar',
		description: 'Desert sandstones, golden dune quartz, and warm wind-swept earthen hues of the Great Indian Desert in Rajasthan.'
	},
	shivalik: {
		name: 'Shivalik',
		description: 'Sub-Himalayan forest pine, deep stone moss, and highland cedar canopy of the outer Himalayan ranges.'
	},
	rajpath: {
		name: 'Rajpath',
		description: 'Ceremonial navy, civic sandstone, and monumental granite inspired by the central grand vista of New Delhi.'
	},
	hampi: {
		name: 'Hampi',
		description: 'Weathered boulder granite, sun-baked terracotta ruins, and timeless Deccan plateau bedrock of the Vijayanagara Empire in Karnataka.'
	},
	mizo: {
		name: 'Mizo',
		description: 'Cloud-covered mountain indigo, lush highland dusk, and twilight mist drawn from the hills of Mizoram.'
	}
};

export function convertIndes(filePath?: string): FractalThemeSet {
	const jsonPath = filePath ?? path.join(__dirname, '../indes.json');
	const rawContent = fs.readFileSync(jsonPath, 'utf-8');
	const data: RawIndesData = JSON.parse(rawContent);

	const themes: FractalTheme[] = [];

	for (const [key, items] of Object.entries(data)) {
		const meta = THEME_METADATA[key] ?? {
			name: key.charAt(0).toUpperCase() + key.slice(1),
			description: `Indic regional design theme based on ${key}.`
		};

		// 1. Process Dark Variant
		const darkItems = items.filter((item) => item.mode === 'dark');
		if (darkItems.length > 0) {
			const colors: FractalColor[] = darkItems.map((item) => {
				const role: ColorRole = item.token.startsWith('fg') ? 'foreground' : 'background';
				const stepMatch = item.token.match(/\d+/);
				const step = stepMatch ? parseInt(stepMatch[0], 10) : undefined;
				return normalizeColor(item.token, item.hexcode, {
					role,
					step,
					category: role
				});
			});

			const bgToken = colors.find((c) => c.name === 'bg-10')?.hex ?? '#1E293B';
			const fgToken = colors.find((c) => c.name === 'fg-10')?.hex ?? '#F8FAFC';
			const accentToken = colors.find((c) => c.name === 'bg-50')?.hex ?? '#94A3B8';

			themes.push({
				id: `indes-${key}-dark`,
				name: `${meta.name} Dark`,
				system: 'indes',
				mode: 'dark',
				family: key,
				description: `${meta.description} (Dark Mode UI)`,
				bgColor: bgToken,
				textColor: fgToken,
				accentColor: accentToken,
				colors,
				meta: {
					region: key,
					mode: 'dark'
				}
			});
		}

		// 2. Process Light Variant
		const lightItems = items.filter((item) => item.mode === 'light');
		if (lightItems.length > 0) {
			// Normalize duplicate fg-10 tokens into sequential fg-10, fg-20...
			let seenFg10 = false;
			const colors: FractalColor[] = lightItems.map((item) => {
				let tokenName = item.token;
				if (tokenName === 'fg-10') {
					if (seenFg10) {
						tokenName = 'fg-20';
					} else {
						seenFg10 = true;
					}
				}

				const role: ColorRole = tokenName.startsWith('fg') ? 'foreground' : 'background';
				const stepMatch = tokenName.match(/\d+/);
				const step = stepMatch ? parseInt(stepMatch[0], 10) : undefined;
				return normalizeColor(tokenName, item.hexcode, {
					role,
					step,
					category: role
				});
			});

			const bgToken = colors.find((c) => c.name === 'bg-10')?.hex ?? '#FAFAFA';
			const fgToken = colors.find((c) => c.name === 'fg-10')?.hex ?? '#121216';
			const accentToken = colors.find((c) => c.name === 'fg-50')?.hex ?? '#52525B';

			themes.push({
				id: `indes-${key}-light`,
				name: `${meta.name} Light`,
				system: 'indes',
				mode: 'light',
				family: key,
				description: `${meta.description} (Light Mode UI)`,
				bgColor: bgToken,
				textColor: fgToken,
				accentColor: accentToken,
				colors,
				meta: {
					region: key,
					mode: 'light'
				}
			});
		}
	}

	return {
		id: 'themesIndes',
		name: 'Indes UI Themes',
		system: 'indes',
		group: 'swatch',
		description: 'Indic regional and architectural UI design token themes calibrated across paired light and dark modes.',
		count: themes.length,
		themes
	};
}
