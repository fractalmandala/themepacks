/**
 * Master Index for Canonical Fractal Themesets
 */

import type { FractalTheme, FractalThemeSet, ThemeGroup } from '../types.ts';

import { themesBase16 } from './themesBase16.ts';
import { themesTailwind } from './themesTailwind.ts';
import { themesUno } from './themesUno.ts';
import { themesFracta } from './themesFracta.ts';
import { themesVecta } from './themesVecta.ts';
import { themesArtista } from './themesArtista.ts';
import { themesColourways } from './themesColourways.ts';
import { themesIndes } from './themesIndes.ts';
import { themePlates } from './themePlates.ts';

export {
	themesBase16,
	themesTailwind,
	themesUno,
	themesFracta,
	themesVecta,
	themesArtista,
	themesColourways,
	themesIndes,
	themePlates
};

export const ALL_THEME_SETS: readonly FractalThemeSet[] = [
	themesBase16,
	themesTailwind,
	themesUno,
	themesFracta,
	themesVecta,
	themesArtista,
	themesColourways,
	themesIndes,
	themePlates
] as const;

export function getAllThemes(): FractalTheme[] {
	return ALL_THEME_SETS.flatMap((s) => s.themes);
}

export function getForStylerThemes(): FractalTheme[] {
	return getStylerThemeSets().flatMap((set) => set.themes);
}

export function getLightThemes(): Pick<FractalTheme, 'id' | 'system'>[] {
	return getStylerThemeSets().flatMap((set) =>
		set.themes
			.filter((theme) => theme.mode === 'light')
			.map(({ id, system }) => ({ id, system }))
	);
}

export function getDarkThemes(): Pick<FractalTheme, 'id' | 'system'>[] {
	return getStylerThemeSets().flatMap((set) =>
		set.themes
			.filter((theme) => theme.mode === 'dark')
			.map(({ id, system }) => ({ id, system }))
	);
}

export function getThemeSetsByGroup(group: ThemeGroup): FractalThemeSet[] {
	return ALL_THEME_SETS.filter((set) => set.group === group);
}

export function getStylerThemeSets(): FractalThemeSet[] {
	return getThemeSetsByGroup('styler');
}

export function getSwatches(): FractalThemeSet[] {
	return getThemeSetsByGroup('swatch');
}

export function getIde(): FractalThemeSet[] {
	return getThemeSetsByGroup('ide');
}

export function getThemeById(id: string): FractalTheme | undefined {
	for (const set of ALL_THEME_SETS) {
		const found = set.themes.find((t) => t.id === id);
		if (found) return found;
	}
	return undefined;
}

export * from '../types.ts';
