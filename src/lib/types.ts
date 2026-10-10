/**
 * Canonical Fractal Design System Theming Types
 * 
 * Unifies diverse color collections (Base16, Tailwind/WebAwesome, UnoCSS/OpenColor,
 * Fracta, Vecta, and Artisan Swatches) into a singular, strongly-typed schema.
 */

export type ThemeMode = 'light' | 'dark' | null;

export type ThemeSystem =
	| 'base16'
	| 'tailwind'
	| 'uno'
	| 'fracta'
	| 'vecta'
	| 'artisan'
	| 'colourways'
	| 'indes'
	| 'themeplates'
	| 'custom';

export type ColorRole =
	| 'background'
	| 'foreground'
	| 'border'
	| 'accent'
	| 'syntax'
	| 'ramp'
	| 'swatch'
	| 'state'
	| 'other';

export interface ContrastRatio {
	/** WCAG 2.1 contrast ratio against pure white (#FFFFFF), e.g. 21.0 */
	white: number;
	/** WCAG 2.1 contrast ratio against pure black (#000000), e.g. 1.0 */
	black: number;
}

export interface FractalColor {
	name: string;
	/** Canonical lowercase 6-digit or 8-digit hex code with '#' prefix */
	hex: string;
	/** Normalized CSS oklch color string: e.g. "oklch(0.765 0.165 42.51)" */
	oklch?: string;
	/** Normalized CSS rgb/rgba color string: e.g. "rgb(230, 57, 70)" */
	rgb?: string;
	/** Functional semantic category or role */
	role?: ColorRole;
	/** Scale step or level if part of a ramp (e.g. 50, 500, "90", 2) */
	step?: string | number;
	/** Category or hue family (e.g. "grey", "red", "blue", "neutrals") */
	category?: string;
	/** WCAG contrast ratings */
	contrast?: ContrastRatio;
}

export interface FractalTheme {
	/** Unique kebab-case identifier, e.g. "base16-atelier-cave-dark", "fracta-bone-light" */
	id: string;
	/** Human-readable display name, e.g. "Atelier Cave Dark" */
	name: string;

	/** Origin design system or specification */
	system: ThemeSystem;

	/** Light/dark variant, or null for mode-agnostic swatch libraries & ramps */
	mode: ThemeMode;

	/** Optional description or aesthetic thesis */
	description?: string;

	/** Theme author, designer, or source attribution */
	author?: string;

	/** Grouping family, e.g. "bone", "atelier-cave", "wa-bright" */
	family?: string;

	/** Primary accent color token (hex or CSS color) */
	accentColor?: string;

	/** Primary canvas / page background color */
	bgColor?: string;

	/** Primary text / foreground color */
	textColor?: string;

	/** Array of color definitions */
	colors: FractalColor[];

	/** System-specific metadata preserving original schema extras (auras, tags, etc.) */
	meta?: Record<string, unknown>;
}

/** Theme set group: 'styler' (Fractalstyler themes), 'swatch' (palettes), 'ide' (editor themes) */
export type ThemeGroup = 'styler' | 'swatch' | 'ide';

export interface FractalThemeSet {
	/** Themeset identifier, e.g. "themesBase16", "themesTailwind", "themesFracta" */
	id: string;

	/** Display title for the themeset */
	name: string;

	/** Origin design system */
	system: ThemeSystem;

	/** Whether a fractalstyler theme or not */
	group: ThemeGroup;

	/** Brief description of the collection */
	description: string;

	/** Count of themes in this set */
	count: number;

	/** Collection of themes */
	themes: FractalTheme[];
}

export interface FractalTokens {
	"bg": string;
	"bg-surface": string;
	"bg-panel": string;
	"bg-sunken": string;
	"bg-raised": string;
	"bg-extra": string;
	"bg-input": string;
	"bg-button": string;
	"text-primary": string;
	"text-secondary": string;
	"text-muted": string;
	"text-inverse": string;
	"state-surface": string;
	"state-hover": string;
	"state-selected": string;
	"border": string;
	"border-subtle": string;
	"border-strong": string;
	"theme-color": string;
	"theme-color-alt": string;
	"theme-color-sub": string;
	"ring": string;
	"white-fixed": string;
	"black-fixed": string;
	"danger": string;
	"danger-hover": string;
	"success": string;
	"success-hover": string;
	"info": string;
	"info-hover": string;
	"warning": string;
	"warning-hover": string;
}

// Single source of truth for component prop unions.
//
// Every union is declared as a runtime `as const` array first and the type is
// derived from it. That matters because TypeScript types are erased: a demo
// that needs to *enumerate* a union's members at runtime (option pickers, "show
// all variants" grids) otherwise has to re-list the members by hand and silently
// drifts when the union changes. With this shape there is exactly one list, and
// it serves the compiler and the browser alike.
//
// Convention: `export const XS = [...] as const; export type X = (typeof XS)[number];`
// Consumers that only need the type should still `import type { X }` from here —
// never redeclare the union locally.

/**
 * Formats a values array as a documentation union string — `'a' | 'b'`.
 * Used by the catalogue so a prop's documented type expands from the same array
 * the type is derived from, instead of being hand-copied.
 */
export const union = (values: readonly string[]): string => values.map((value) => `'${value}'`).join(' | ');

// Base Element Look Variant
export const VARIANTS = [
	'primary',
	'secondary',
	'soft',
	'outline',
	'ghost',
	'link',
	'destructive',
	'icon',
	'iconbox',
	'icon-sm',
	'icon-md',
	'icon-bs',
	'icon-lg'
] as const;
export type DataVariant = (typeof VARIANTS)[number];

export const SIZES = ['sm', 'md', 'bs', 'lg'] as const;
export type DataSize = (typeof SIZES)[number];

export const SHAPES = ['square', 'modern', 'curved', 'round'] as const;
export type DataShape = (typeof SHAPES)[number];

export const ALERTVARIANTS = ['info', 'success', 'warning', 'danger'] as const;
export type AlertVariant = (typeof ALERTVARIANTS)[number];

export const presetApplication = [
	'button', 'input', 'select', 'input.input', 'select.select', '.card', 'a.btn'
] as const;
