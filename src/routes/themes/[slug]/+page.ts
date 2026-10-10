import { error } from '@sveltejs/kit';
import { ALL_THEME_SETS } from '$lib/canonical/index.js';

export function load({ params }) {
	const group = ALL_THEME_SETS.find((set) => set.id === params.slug || set.system === params.slug);
	if (!group) error(404, 'Theme group not found');
	return { group };
}
