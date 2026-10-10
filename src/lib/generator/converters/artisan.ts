/**
 * Parser for artisan-colors.ts (Artisan pigments and WCAG rated swatches)
 */

import { ARTISAN_COLORS } from '../artisan-colors.ts';
import { normalizeColor } from '../../color-utils.ts';
import type { FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

export function convertArtisan(): FractalThemeSet {
	const colors: FractalColor[] = ARTISAN_COLORS.map((c) =>
		normalizeColor(c.name, c.hex, {
			role: 'swatch',
			category: c.category,
			contrast: {
				white: c.contrastWhite,
				black: c.contrastBlack
			}
		})
	);

	const theme: FractalTheme = {
		id: 'artisan-swatches',
		name: 'Artisan Pigment Swatches',
		system: 'artisan',
		mode: null,
		family: 'artisan-materials',
		description: 'Curated traditional pigments and modern material swatches rated for WCAG readability.',
		bgColor: colors.find((c) => c.name === 'Shell White')?.hex ?? '#F8F9FA',
		textColor: colors.find((c) => c.name === 'Black Ink')?.hex ?? '#1C1D21',
		accentColor: colors.find((c) => c.name === 'Vermilion')?.hex ?? '#E63946',
		colors
	};

	return {
		id: 'themesArtista',
		name: 'Artisan Pigment Swatches',
		system: 'artisan',
		group: 'swatch',
		description: 'Artisan color swatch library spanning 7 material categories with certified WCAG contrast ratios.',
		count: 1,
		themes: [theme]
	};
}
