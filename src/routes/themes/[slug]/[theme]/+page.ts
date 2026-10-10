import { error } from '@sveltejs/kit';
import { ALL_THEME_SETS } from '$lib/canonical/index.js';

export function load({ params }) {
	const group = ALL_THEME_SETS.find((set) => set.id === params.slug || set.system === params.slug);
	const theme = group?.themes.find((candidate) => candidate.id === params.theme);
	if (!group || !theme) error(404, 'Theme not found');
	return { group, theme };
}
