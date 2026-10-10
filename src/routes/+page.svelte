<script lang="ts">
	import { type FractalTheme, type FractalTokens, ALL_THEME_SETS } from '$lib/canonical/index.js';
	import PageShell from '$lib/ui/PageShell.svelte';

	const themeGroups = [
		{ title: 'Styler', sets: ALL_THEME_SETS.filter((set) => set.group === 'styler') },
		{ title: 'Swatches', sets: ALL_THEME_SETS.filter((set) => set.group === 'swatch') },
		{ title: 'IDE', sets: ALL_THEME_SETS.filter((set) => set.group === 'ide') }
	];

	const themes = ALL_THEME_SETS.filter((set) => set.group === 'styler').flatMap((set) => set.themes);
	let selectedId = $state(themes[0]?.id ?? '');
	let status = $state('');

	const selectedTheme = $derived(themes.find((theme) => theme.id === selectedId) ?? themes[0]);

	function tokenValue(theme: FractalTheme, ...names: string[]): string {
		for (const name of names) {
			const color = theme.colors.find((candidate) => candidate.name === name)?.hex;
			if (color) return color;
		}
		return theme.bgColor ?? '#000000';
	}

	function tokensFor(theme: FractalTheme): FractalTokens {
		const bg = tokenValue(theme, 'bg');
		const surface = tokenValue(theme, 'bg-surface', 'alt', 'bg');
		const panel = tokenValue(theme, 'bg-panel', 'alt', 'bg');
		const text = tokenValue(theme, 'text-primary', 'fg');
		const secondary = tokenValue(theme, 'text-secondary', 'prop', 'fg');
		const muted = tokenValue(theme, 'text-muted', 'comment', 'fg');
		const accent = tokenValue(theme, 'theme-color', 'accent') || theme.accentColor || '#04825b';

		return {
			bg,
			'bg-surface': surface,
			'bg-panel': panel,
			'bg-sunken': tokenValue(theme, 'bg-sunken', 'alt', 'bg'),
			'bg-raised': tokenValue(theme, 'bg-raised', 'bg-panel', 'alt', 'bg'),
			'bg-extra': tokenValue(theme, 'bg-extra', 'bg-button', 'alt', 'bg'),
			'bg-input': tokenValue(theme, 'bg-input', 'bg-sunken', 'alt', 'bg'),
			'bg-button': tokenValue(theme, 'bg-button', 'bg-extra', 'accent', 'bg'),
			'text-primary': text,
			'text-secondary': secondary,
			'text-muted': muted,
			'text-inverse': tokenValue(theme, 'text-inverse', 'white-fixed', 'bg'),
			'state-surface': tokenValue(theme, 'state-surface', 'bg-panel', 'alt', 'bg'),
			'state-hover': tokenValue(theme, 'state-hover', 'border', 'alt', 'bg'),
			'state-selected': tokenValue(theme, 'state-selected', 'border-strong', 'alt', 'bg'),
			border: tokenValue(theme, 'border', 'border-subtle', 'alt', 'bg'),
			'border-subtle': tokenValue(theme, 'border-subtle', 'border', 'alt', 'bg'),
			'border-strong': tokenValue(theme, 'border-strong', 'border', 'fg', 'bg'),
			'theme-color': accent,
			'theme-color-alt': tokenValue(theme, 'theme-color-alt', 'accent', 'theme-color') || accent,
			'theme-color-sub': tokenValue(theme, 'theme-color-sub', 'theme-color', 'accent') || accent,
			ring: tokenValue(theme, 'ring', 'theme-color', 'accent'),
			'white-fixed': tokenValue(theme, 'white-fixed', 'text-inverse', 'bg'),
			'black-fixed': tokenValue(theme, 'black-fixed', 'bg', 'fg'),
			danger: tokenValue(theme, 'danger', 'accent'),
			'danger-hover': tokenValue(theme, 'danger-hover', 'danger', 'accent'),
			success: tokenValue(theme, 'success', 'accent'),
			'success-hover': tokenValue(theme, 'success-hover', 'success', 'accent'),
			info: tokenValue(theme, 'info', 'accent'),
			'info-hover': tokenValue(theme, 'info-hover', 'info', 'accent'),
			warning: tokenValue(theme, 'warning', 'accent'),
			'warning-hover': tokenValue(theme, 'warning-hover', 'warning', 'accent')
		};
	}

	function saveTheme(payload: { name: string; tokens: FractalTokens; asNew: boolean }) {
		const key = `theme-editor:${payload.asNew ? payload.name : selectedTheme.id}`;
		localStorage.setItem(key, JSON.stringify(payload.tokens));
		status = payload.asNew ? `Saved “${payload.name}” as a new draft theme.` : `Saved changes for “${selectedTheme.name}”.`;
	}
</script>

<svelte:head>
	<title>Themepacks</title>
	<meta name="description" content="Live-edit Fractalstyler theme tokens before saving." />
</svelte:head>

<PageShell headerTitle="Themepacks" headerDesc="A collection of themes for Fractalstyler, and various other swatches and theme packs." contentWidth="pt-lg">
	<div class="box gap-2xl">
		{#each themeGroups as group (group.title)}
			<section class="box gap-bs">
				<h2>{group.title}</h2>
				<div class="grid-4 gap-bs">
					{#each group.sets as set (set.id)}
						<a class="card box gap-md" data-variant="secondary" href={`/themes/${set.id}`}>
							<p class="card-title">{set.name}</p>
							<p class="card-desc text-muted">{set.description}</p>
							<footer class="box">
								<span class="text-xs tt-u weight-600">{set.group} | {set.count} Themes</span>
							</footer>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</PageShell>