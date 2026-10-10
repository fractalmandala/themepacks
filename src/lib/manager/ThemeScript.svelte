<script lang="ts">
 	import { ALL_THEME_SETS } from '$lib/canonical/index.js';
	import { getAntiFlickerScript } from '$lib/utils/anti-flicker.js';

	const STYLER_THEME_SETS = ALL_THEME_SETS.filter((themeSet) => themeSet.group === 'styler');
	const DEFAULT_STYLER_THEME = STYLER_THEME_SETS.flatMap((themeSet) => themeSet.themes).find((theme) => theme.mode === 'light')?.id ?? STYLER_THEME_SETS[0]?.themes[0]?.id ?? '';

	interface Props {
		defaultTheme?: string;
		groupName?: (typeof STYLER_THEME_SETS)[number]['id'];
	}

	let { defaultTheme = DEFAULT_STYLER_THEME, groupName = STYLER_THEME_SETS[0].id }: Props = $props();

	const scriptCode = $derived(getAntiFlickerScript(defaultTheme, groupName));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script>${scriptCode}<\/script>`}
</svelte:head>
