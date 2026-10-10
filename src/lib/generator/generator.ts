/**
 * Generator for the Single Source of Truth Trio:
 * - thatTheme.json (portable canonical data)
 * - thatTheme.ts   (typed compile-time exports)
 * - thatTheme.md   (human-readable design spec with color swatches & WCAG ratings)
 */

import type { FractalTheme, FractalThemeSet } from '../types.js';

export function generateJson(themeSet: FractalThemeSet): string {
	return JSON.stringify(themeSet, null, 2);
}

export function generateTs(themeSet: FractalThemeSet, constName: string): string {
	const jsonContent = JSON.stringify(themeSet, null, 2);

	return `/**
 * Canonical Typed Themeset: ${themeSet.name} (${themeSet.system})
 * Generated automatically from canonical design system sources.
 */

import type { FractalTheme, FractalThemeSet } from '../types.ts';

export const ${constName}: FractalThemeSet = ${jsonContent} as const;

export const themes: readonly FractalTheme[] = ${constName}.themes;

export default ${constName};
`;
}

export function generateMarkdown(themeSet: FractalThemeSet): string {
	let md = `# ${themeSet.name}\n\n`;
	md += `> **System**: \`${themeSet.system}\` | **Themes**: ${themeSet.count}\n`;
	if (themeSet.description) {
		md += `> ${themeSet.description}\n`;
	}
	md += `\n---\n\n`;

	if (themeSet.themes.length > 1) {
		md += `## Table of Themes\n\n`;
		for (const theme of themeSet.themes) {
			const modeBadge = theme.mode ? `\`${theme.mode}\`` : '`mode-agnostic`';
			const colorCount = theme.colors.length;
			md += `- [${theme.name}](#${slugify(theme.id)}) (${modeBadge} • ${colorCount} colors)\n`;
		}
		md += `\n---\n\n`;
	}

	for (const theme of themeSet.themes) {
		md += `## ${theme.name} <a id="${slugify(theme.id)}"></a>\n\n`;

		const details: string[] = [];
		details.push(`**ID**: \`${theme.id}\``);
		details.push(`**System**: \`${theme.system}\``);
		if (theme.mode) details.push(`**Mode**: \`${theme.mode}\``);
		if (theme.family) details.push(`**Family**: \`${theme.family}\``);
		if (theme.author) details.push(`**Author**: ${theme.author}`);

		md += details.join(' | ') + '\n\n';

		if (theme.description) {
			md += `*${theme.description}*\n\n`;
		}

		// Key Tokens Banner if present
		if (theme.accentColor || theme.bgColor || theme.textColor) {
			md += `### Key Tokens\n\n`;
			md += `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">\n`;
			if (theme.accentColor) {
				md += `  <div style="display:flex;align-items:center;gap:8px;">
    <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:${theme.accentColor};border:1px solid rgba(128,128,128,0.25)"></span>
    <strong>Accent:</strong> <code>${theme.accentColor}</code>
  </div>\n`;
			}
			if (theme.bgColor) {
				md += `  <div style="display:flex;align-items:center;gap:8px;">
    <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:${theme.bgColor};border:1px solid rgba(128,128,128,0.25)"></span>
    <strong>Background:</strong> <code>${theme.bgColor}</code>
  </div>\n`;
			}
			if (theme.textColor) {
				md += `  <div style="display:flex;align-items:center;gap:8px;">
    <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:${theme.textColor};border:1px solid rgba(128,128,128,0.25)"></span>
    <strong>Text:</strong> <code>${theme.textColor}</code>
  </div>\n`;
			}
			md += `</div>\n\n`;
		}

		// Palette Grid
		md += `### Color Specifications (${theme.colors.length} tokens)\n\n`;
		md += `| Swatch | Token Name | Role | Hex | OKLCH | RGB | Contrast (W / B) |\n`;
		md += `| :---: | :--- | :--- | :--- | :--- | :--- | :---: |\n`;

		for (const color of theme.colors) {
			const swatchHtml = `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${color.hex};vertical-align:middle;border:1px solid rgba(128,128,128,0.25)"></span>`;
			const roleText = color.role ? `\`${color.role}\`` : '—';
			const oklchText = color.oklch ? `\`${color.oklch}\`` : '—';
			const rgbText = color.rgb ? `\`${color.rgb}\`` : '—';
			const contrastText = color.contrast
				? `${color.contrast.white}:1 / ${color.contrast.black}:1`
				: '—';

			md += `| ${swatchHtml} | \`${color.name}\` | ${roleText} | \`${color.hex}\` | ${oklchText} | ${rgbText} | ${contrastText} |\n`;
		}

		md += `\n---\n\n`;
	}

	return md;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
