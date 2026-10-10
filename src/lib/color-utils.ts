import type { ContrastRatio, FractalColor } from './types.ts';

export interface RGB {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
	a?: number; // 0-1
}

export interface OKLab {
	L: number;
	a: number;
	b: number;
}

export interface OKLCH {
	l: number; // Lightness [0, 1]
	c: number; // Chroma [0, ~0.4]
	h: number; // Hue angle [0, 360)
}

function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

function srgbToLinear(c: number): number {
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
	return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function oklchToOklab(oklch: OKLCH): OKLab {
	const hRad = (oklch.h * Math.PI) / 180;
	return {
		L: oklch.l,
		a: oklch.c * Math.cos(hRad),
		b: oklch.c * Math.sin(hRad)
	};
}

export function oklabToOklch(lab: OKLab): OKLCH {
	const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
	let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
	if (h < 0) h += 360;

	return {
		l: lab.L,
		c: c < 1e-6 ? 0 : c,
		h: c < 1e-6 ? 0 : h
	};
}

export function oklabToRgb(lab: OKLab): RGB {
	const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
	const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
	const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return {
		r: Math.round(clamp(linearToSrgb(rLin), 0, 1) * 255),
		g: Math.round(clamp(linearToSrgb(gLin), 0, 1) * 255),
		b: Math.round(clamp(linearToSrgb(bLin), 0, 1) * 255)
	};
}

export function rgbToOklab(rgb: RGB): OKLab {
	const rLin = srgbToLinear(clamp(rgb.r, 0, 255) / 255);
	const gLin = srgbToLinear(clamp(rgb.g, 0, 255) / 255);
	const bLin = srgbToLinear(clamp(rgb.b, 0, 255) / 255);

	const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
	const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
	const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	return {
		L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
	};
}


export function parseHex(hex: string): RGB | null {
	let h = hex.trim();
	if (h.startsWith('#')) h = h.slice(1);

	if (h.length === 3) {
		return {
			r: parseInt(h[0] + h[0], 16),
			g: parseInt(h[1] + h[1], 16),
			b: parseInt(h[2] + h[2], 16)
		};
	}
	if (h.length === 4) {
		return {
			r: parseInt(h[0] + h[0], 16),
			g: parseInt(h[1] + h[1], 16),
			b: parseInt(h[2] + h[2], 16),
			a: Math.round((parseInt(h[3] + h[3], 16) / 255) * 100) / 100
		};
	}
	if (h.length === 6) {
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16)
		};
	}
	if (h.length === 8) {
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
			a: Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100) / 100
		};
	}
	return null;
}

export function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
	let hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
	if (rgb.a !== undefined && rgb.a < 1) {
		hex += toHex(Math.round(rgb.a * 255));
	}
	return hex.toLowerCase();
}

export function parseOklch(str: string): OKLCH | null {
	// e.g. "oklch(96.406% 0.04001 53.476)" or "oklch(0.765 0.165 42.51)"
	const match = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
	if (!match) return null;

	let lStr = match[1];
	let l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
	let c = parseFloat(match[2]);
	let h = parseFloat(match[3]);

	return {
		l: clamp(l, 0, 1),
		c: Math.max(0, c),
		h: ((h % 360) + 360) % 360
	};
}

export function formatOklch(oklch: OKLCH): string {
	const l = (oklch.l * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
	const c = oklch.c.toFixed(4).replace(/\.?0+$/, '');
	const h = oklch.h.toFixed(2).replace(/\.?0+$/, '');
	return `oklch(${l} ${c} ${h})`;
}

export function formatRgb(rgb: RGB): string {
	if (rgb.a !== undefined && rgb.a < 1) {
		return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
	}
	return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}


export function getRelativeLuminance(rgb: RGB): number {
	const r = srgbToLinear(rgb.r / 255);
	const g = srgbToLinear(rgb.g / 255);
	const b = srgbToLinear(rgb.b / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(l1: number, l2: number): number {
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	const ratio = (lighter + 0.05) / (darker + 0.05);
	return Math.round(ratio * 100) / 100;
}

export function calculateContrast(rgb: RGB): ContrastRatio {
	const lum = getRelativeLuminance(rgb);
	const lumWhite = 1.0;
	const lumBlack = 0.0;
	return {
		white: getContrastRatio(lum, lumWhite),
		black: getContrastRatio(lum, lumBlack)
	};
}

// ---------------------------------------------------------------------------
// Normalizer / Hydrator
// ---------------------------------------------------------------------------

/**
 * Takes any partial color specification (hex or oklch or rgb)
 * and produces a fully populated FractalColor with hex, oklch, rgb, and contrast.
 */
export function normalizeColor(
	name: string,
	rawVal: string,
	options: Partial<FractalColor> = {}
): FractalColor {
	let rgb: RGB | null = null;
	const trimmed = rawVal.trim();

	if (trimmed.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
		rgb = parseHex(trimmed);
	} else if (trimmed.startsWith('oklch')) {
		const oklch = parseOklch(trimmed);
		if (oklch) {
			const lab = oklchToOklab(oklch);
			rgb = oklabToRgb(lab);
		}
	} else if (trimmed.startsWith('rgb')) {
		const match = trimmed.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
		if (match) {
			rgb = {
				r: clamp(parseFloat(match[1]), 0, 255),
				g: clamp(parseFloat(match[2]), 0, 255),
				b: clamp(parseFloat(match[3]), 0, 255)
			};
		}
	}

	if (!rgb) {
		// Fallback for edge cases
		return {
			name,
			hex: trimmed.startsWith('#') ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`,
			...options
		};
	}

	const hex = rgbToHex(rgb);
	const lab = rgbToOklab(rgb);
	const oklchObj = oklabToOklch(lab);
	const oklch = formatOklch(oklchObj);
	const rgbStr = formatRgb(rgb);
	const contrast = options.contrast ?? calculateContrast(rgb);

	return {
		name,
		hex,
		oklch,
		rgb: rgbStr,
		contrast,
		...options
	};
}
