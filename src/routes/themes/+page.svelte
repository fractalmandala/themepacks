<script lang="ts">
	import { onMount } from 'svelte';
	import ThemePicker from '$lib/manager/ThemePicker.svelte';
	import { ALL_THEME_SETS, getAllThemes, type FractalTheme, type ThemeSystem } from '$lib/canonical/index.js';
	import { themeState } from '$lib/state/theme.svelte.js';

	const themes = getAllThemes();
	const systems = ALL_THEME_SETS.map((set) => set.system);
	let mode = $state<'all' | 'light' | 'dark'>('all');
	let system = $state<ThemeSystem>(systems[0]);
	let family = $state('');
	let search = $state('');
	let selected = $state<FractalTheme | null>(null);
	let copied = $state('');

	const families = $derived.by(() => [...new Set(themes.filter((theme) => theme.system === system).map((theme) => theme.family).filter((value): value is string => Boolean(value)))].sort());
	const visibleThemes = $derived.by(() => {
		const query = search.trim().toLowerCase();
		return themes.filter((theme) => {
			const matchesMode = mode === 'all' || theme.mode === mode;
			const matchesSystem = theme.system === system;
			const matchesFamily = !family || theme.family === family;
			const matchesSearch = !query || [theme.id, theme.name, theme.system, theme.family, theme.description, theme.author].filter(Boolean).some((value) => value!.toLowerCase().includes(query));
			return matchesMode && matchesSystem && matchesFamily && matchesSearch;
		});
	});
	const groupedThemes = $derived([{ system, themes: visibleThemes }]);

	function chooseTheme(theme: FractalTheme) {
		themeState.setTheme(theme.id);
		selected = theme;
	}

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
		}
		copied = text;
		setTimeout(() => (copied = ''), 1400);
	}

	function cssFor(theme: FractalTheme) {
		return `:root[data-theme="${theme.id}"] {\n${theme.colors.map((color) => `  --${color.name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()}: ${color.hex};`).join('\n')}\n}`;
	}

	function jsonFor(theme: FractalTheme) {
		return JSON.stringify({ id: theme.id, name: theme.name, system: theme.system, mode: theme.mode, family: theme.family, colors: theme.colors }, null, 2);
	}

	function groupSlug(currentSystem: ThemeSystem) {
		return ALL_THEME_SETS.find((set) => set.system === currentSystem)?.id ?? currentSystem;
	}

	function closeModal() {
		selected = null;
	}
</script>

<svelte:head><title>Themepacks Explorer</title><meta name="description" content="Explore canonical Fractal Design themes." /></svelte:head>

