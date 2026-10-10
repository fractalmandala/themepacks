/**
 * Parser for colourways.ts (Vibrant chromatic harmonic presets)
 */

import { COLOURWAY_PRESETS } from '../colourways.ts';
import { normalizeColor } from '../../color-utils.ts';
import type { FractalColor, FractalTheme, FractalThemeSet } from '../../types.ts';

export function convertColourways(): FractalThemeSet {
	const themes: FractalTheme[] = COLOURWAY_PRESETS.map((cw) => {
		const colors: FractalColor[] = cw.colors.map((hex, idx) =>
			normalizeColor(`stop-${idx + 1}`, hex, {
				role: 'swatch',
				step: idx + 1,
				category: cw.id
			})
		);

		return {
			id: `colourway-${cw.id}`,
			name: cw.name,
			system: 'colourways',
			mode: null,
			family: 'spectrum-harmonies',
			description: `${cw.name} high-chroma harmonic spectrum swatch for gradient generation and UI accents.`,
			bgColor: colors[colors.length - 1]?.hex ?? '#000000',
			textColor: colors[0]?.hex ?? '#FFFFFF',
			accentColor: colors[0]?.hex ?? '#FFE600',
			colors
		};
	});

	return {
		id: 'themesColourways',
		name: 'Colourways Vibrant Presets',
		system: 'colourways',
		group: 'swatch',
		description: 'Vibrant 4-6 stop spectrum swatches curated across the entire chromatic wheel for theme generation and gradient canvases.',
		count: themes.length,
		themes
	};
}
