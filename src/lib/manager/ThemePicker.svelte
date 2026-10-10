<script lang="ts">
	import type { Snippet } from 'svelte';
	import Close from '$lib/icon/Close.svelte';
	import Moon from '$lib/icon/Moon.svelte';
	import Palette from '$lib/icon/Palette.svelte';
	import Sun from '$lib/icon/Sun.svelte';
	import Undo from '$lib/icon/undo.svelte';
	import {
		ALL_THEME_SETS,
		getForStylerThemes,
		type FractalTheme,
		type ThemeSystem
	} from '$lib/canonical/index.js';

	interface Props {
		selectedTheme?: string;
		triggerButton?: Snippet;
		onThemeChange?: (theme: FractalTheme) => void;
	}

	let {
		selectedTheme: initialTheme,
		triggerButton,
		onThemeChange
	}: Props = $props();

	const stylerSets = ALL_THEME_SETS.filter((themeSet) => themeSet.group === 'styler');
	const themes = getForStylerThemes();
	const lightThemeIds = new Set(themes.filter((theme) => theme.mode === 'light').map((theme) => theme.id));
	const darkThemeIds = new Set(themes.filter((theme) => theme.mode === 'dark').map((theme) => theme.id));
	const systems = stylerSets.map((themeSet) => themeSet.system);

	let isOpen = $state(false);
	let modeFilter = $state<'all' | 'light' | 'dark'>('all');
	let systemFilter = $state<'all' | ThemeSystem>('all');
	let search = $state('');
	let history = $state<string[]>([]);
	let currentThemeId = $state('');

	$effect(() => {
		if (!currentThemeId) currentThemeId = initialTheme ?? themes[0]?.id ?? '';
	});

	const currentTheme = $derived(themes.find((theme) => theme.id === currentThemeId));
	const filteredThemes = $derived.by(() => {
		const query = search.trim().toLowerCase();

		return themes.filter((theme) => {
			const matchesMode =
				modeFilter === 'all' ||
				(modeFilter === 'light' && lightThemeIds.has(theme.id)) ||
				(modeFilter === 'dark' && darkThemeIds.has(theme.id));
			const matchesSystem = systemFilter === 'all' || theme.system === systemFilter;
			const matchesSearch =
				!query ||
				[theme.id, theme.name, theme.system, theme.family, theme.description]
					.filter(Boolean)
					.some((value) => value!.toLowerCase().includes(query));

			return matchesMode && matchesSystem && matchesSearch;
		});
	});

	function chooseTheme(theme: FractalTheme, saveHistory = true) {
		if (theme.id === currentThemeId) return;
		if (saveHistory && currentThemeId) history = [...history, currentThemeId];

		currentThemeId = theme.id;
		if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme.id);
		onThemeChange?.(theme);
	}

	function pickTheme(themeId: string) {
		const theme = themes.find((candidate) => candidate.id === themeId);
		if (theme) chooseTheme(theme);
	}

	function undoTheme() {
		const previousThemeId = history.at(-1);
		if (!previousThemeId) return;
		history = history.slice(0, -1);
		const theme = themes.find((candidate) => candidate.id === previousThemeId);
		if (theme) chooseTheme(theme, false);
	}

	function resetFilters() {
		modeFilter = 'all';
		systemFilter = 'all';
		search = '';
	}
</script>

<div class="theme-picker">
	{#if triggerButton}
		{@render triggerButton()}
	{:else}
		<button type="button" class="picker-trigger" onclick={() => (isOpen = !isOpen)} aria-expanded={isOpen}>
			<Palette size="16" />
			<span>{currentTheme?.name ?? 'Choose theme'}</span>
		</button>
	{/if}

	{#if isOpen}
		<div class="picker" role="dialog" aria-label="Theme picker">
			<header>
				<div>
					<strong>Theme picker</strong>
					<small>{filteredThemes.length} of {themes.length} themes</small>
				</div>
				<div class="actions">
					<button type="button" onclick={undoTheme} disabled={!history.length} title="Undo theme selection" aria-label="Undo theme selection"><Undo /></button>
					<button type="button" onclick={() => (isOpen = false)} aria-label="Close theme picker"><Close size={16} color="currentColor" /></button>
				</div>
			</header>

			<div class="filters">
				<div class="segmented" aria-label="Theme mode">
					{#each ['all', 'light', 'dark'] as mode}
						<button type="button" class:active={modeFilter === mode} onclick={() => (modeFilter = mode as typeof modeFilter)}>
							{#if mode === 'light'}<Sun size={14} color="currentColor" />{:else if mode === 'dark'}<Moon size={14} color="currentColor" />{:else}<Palette size={14} />{/if}
							<span>{mode[0].toUpperCase() + mode.slice(1)}</span>
						</button>
					{/each}
				</div>
				<select bind:value={systemFilter} aria-label="Theme system">
					<option value="all">All systems</option>
					{#each systems as system}
						<option value={system}>{system}</option>
					{/each}
				</select>
				<input bind:value={search} type="search" placeholder="Search themes" aria-label="Search themes" />
				<button type="button" onclick={resetFilters}>Reset</button>
			</div>

			<div class="grid">
				{#each filteredThemes as theme (theme.id)}
					<button
						type="button"
						class="theme-card"
						class:selected={theme.id === currentThemeId}
						onclick={() => pickTheme(theme.id)}
						title={theme.description ?? theme.name}
					>
						<div class="preview" style={`background: ${theme.bgColor ?? '#888'}; color: ${theme.textColor ?? '#fff'}; border-color: ${theme.accentColor ?? '#888'}`}>
							<span style={`background: ${theme.accentColor ?? 'currentColor'}`}></span>
							<span style={`background: ${theme.textColor ?? 'currentColor'}`}></span>
						</div>
						<strong>{theme.name}</strong>
						<small>{theme.system} · {theme.mode ?? 'neutral'}</small>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.theme-picker { position: relative; color: var(--text-primary, #e5e7eb); }
	button, input, select { font: inherit; }
	button { cursor: pointer; }
	.picker-trigger { display: inline-flex; align-items: center; gap: .5rem; border: 1px solid var(--border, #475569); border-radius: .5rem; padding: .5rem .75rem; background: var(--bg-surface, #1e293b); color: inherit; }
	.picker { position: absolute; z-index: 10; top: calc(100% + .5rem); right: 0; width: min(48rem, calc(100vw - 2rem)); padding: 1rem; border: 1px solid var(--border, #475569); border-radius: .75rem; background: var(--bg-surface, #0f172a); box-shadow: 0 1rem 3rem #0006; }
	header, .filters, .actions, .segmented { display: flex; align-items: center; gap: .5rem; }
	header { justify-content: space-between; margin-bottom: .75rem; }
	header small, .theme-card small { display: block; color: var(--text-secondary, #94a3b8); font-size: .72rem; }
	.actions button, .filters button, .segmented button, select, input { border: 1px solid var(--border, #475569); border-radius: .375rem; padding: .4rem .55rem; background: transparent; color: inherit; }
	.filters { flex-wrap: wrap; margin-bottom: .75rem; }
	.filters input { flex: 1 1 10rem; min-width: 8rem; }
	.segmented button.active, .theme-card.selected { border-color: var(--theme-color, #14b8a6); background: color-mix(in srgb, var(--theme-color, #14b8a6) 16%, transparent); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: .5rem; max-height: 32rem; overflow: auto; }
	.theme-card { min-width: 0; border: 1px solid var(--border, #475569); border-radius: .5rem; padding: .5rem; text-align: left; background: transparent; color: inherit; }
	.preview { display: flex; align-items: center; gap: .35rem; height: 3rem; margin-bottom: .45rem; padding: .5rem; border: 2px solid; border-radius: .35rem; }
	.preview span { width: .8rem; height: .8rem; border-radius: 50%; }
	.theme-card strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	@media (max-width: 600px) { .picker { position: fixed; inset: 1rem; width: auto; } }
</style>
