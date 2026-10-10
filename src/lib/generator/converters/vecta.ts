/**
 * Parser for themes.ts (Vecta / Fractal UI design system theme shells)
 */

import { THEMES } from '../themes.ts';
import { normalizeColor } from '../../color-utils.ts';
import type { ColorRole, FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

export function convertVecta(): FractalThemeSet {
	const themes: FractalTheme[] = THEMES.map((t) => {
		const colors: FractalColor[] = [];

		const addTokens = (dict?: Record<string, string>, role?: ColorRole) => {
			if (!dict) return;
			for (const [key, val] of Object.entries(dict)) {
				if (!val) continue;
				colors.push(
					normalizeColor(key, val, {
						role
					})
				);
			}
		};

		addTokens(t['tokens-backgrounds'], 'background');
		addTokens(t['tokens-foregrounds'], 'foreground');
		addTokens(t['tokens-border'], 'border');
		addTokens(t['tokens-accents-and-states'], 'accent');
		addTokens(t['tokens-other'], 'other');
		if (t.tokens) {
			addTokens(t.tokens, 'other');
		}

		return {
			id: t.id,
			name: t.name,
			system: 'vecta',
			mode: t.mode,
			description: t.description,
			accentColor: t.accentColor,
			bgColor: t.bgColor,
			textColor: t.textColor,
			colors,
			meta: {
				auraId: t.auraId,
				auraName: t.auraName,
				auraDescription: t.auraDescription
			}
		};
	});

	return {
		id: 'themesVecta',
		name: 'Vecta Full UI Themes',
		system: 'vecta',
		group: 'styler',
		description: 'Complete UI component design tokens comprising backgrounds, text tiers, borders, and accents.',
		count: themes.length,
		themes
	};
}
