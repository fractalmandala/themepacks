<script lang="ts">
	import ThemeEditor from '$lib/manager/ThemeEditor.svelte';
	import type { FractalTheme, FractalTokens, FractalThemeSet } from '$lib/canonical/index.js';

	let { data }: { data: { group: FractalThemeSet; theme: FractalTheme } } = $props();
	let editorTokens = $derived.by(() => {
		const theme = data.theme;
		const baseTokens = tokensFor(theme);
		if (typeof localStorage === 'undefined') return baseTokens;
		try {
			const saved = localStorage.getItem(`theme-editor:${theme.id}`);
			return saved ? { ...baseTokens, ...JSON.parse(saved) } : baseTokens;
		} catch {
			return baseTokens;
		}
	});
	let editorRevision = $state(0);
	let status = $state('');
	let copiedHex = $state('');

	async function copyHex(hex: string) {
		try {
			await navigator.clipboard.writeText(hex);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = hex;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
		}
		copiedHex = hex;
		setTimeout(() => {
			if (copiedHex === hex) copiedHex = '';
		}, 1200);
	}

	function tokenValue(theme: FractalTheme, ...names: string[]): string {
		for (const name of names) {
			const color = theme.colors.find((candidate) => candidate.name === name)?.hex;
			if (color) return color;
		}
		return theme.bgColor ?? '#000000';
	}

	function tokensFor(theme: FractalTheme): FractalTokens {
		const accent = tokenValue(theme, 'theme-color', 'accent') || theme.accentColor || '#04825b';
		return {
			bg: tokenValue(theme, 'bg'),
			'bg-surface': tokenValue(theme, 'bg-surface', 'alt', 'bg'),
			'bg-panel': tokenValue(theme, 'bg-panel', 'alt', 'bg'),
			'bg-sunken': tokenValue(theme, 'bg-sunken', 'alt', 'bg'),
			'bg-raised': tokenValue(theme, 'bg-raised', 'bg-panel', 'alt', 'bg'),
			'bg-extra': tokenValue(theme, 'bg-extra', 'bg-button', 'alt', 'bg'),
			'bg-input': tokenValue(theme, 'bg-input', 'bg-sunken', 'alt', 'bg'),
			'bg-button': tokenValue(theme, 'bg-button', 'bg-extra', 'accent', 'bg'),
			'text-primary': tokenValue(theme, 'text-primary', 'fg'),
			'text-secondary': tokenValue(theme, 'text-secondary', 'prop', 'fg'),
			'text-muted': tokenValue(theme, 'text-muted', 'comment', 'fg'),
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

	function saveTheme({
		name,
		tokens,
		asNew
	}: {
		name: string;
		tokens: FractalTokens;
		asNew: boolean;
	}) {
		try {
			const key = asNew ? `theme-editor-new:${name}` : `theme-editor:${data.theme.id}`;
			localStorage.setItem(key, JSON.stringify(tokens));
			status = asNew
				? `Saved edits as new theme “${name}”.`
				: `Saved changes for “${data.theme.name}”.`;
		} catch {
			status = 'Unable to save this theme configuration in localStorage.';
		}
	}

	function discardChanges() {
		editorRevision++;
		status = 'Unsaved changes discarded.';
	}

	function cssFor(theme: FractalTheme) {
		return `{\n${theme.colors.map((color) => `  --${color.name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()}: ${color.hex};`).join('\n')}\n}`;
	}
</script>

<svelte:head>
	<title>{data.theme.name} · Themepacks</title>
	<meta name="description" content={data.theme.description ?? data.theme.name} />
</svelte:head>

<section class="box">
	{#if data.group.group === 'styler'}
		{#if status}<p class="text-body-sm text-muted" role="status">{status}</p>{/if}
		{#key `${data.theme.id}-${editorRevision}`}
			<ThemeEditor
				themeName={data.theme.name}
				tokens={editorTokens}
				onSave={saveTheme}
				onCancel={discardChanges}
			/>
		{/key}
		<section class="box gap-sm">
			<div class="row xbetween ycenter gap-md wrap">
				<button class="button" data-size="md" data-variant="outline" type="button" onclick={() => navigator.clipboard?.writeText(cssFor(data.theme))}>Copy CSS</button>
			</div>
			<pre class="box border bg-raised pad-md mono text-body-sm">
				{cssFor(data.theme)}
			</pre>
		</section>
		<section class="box gap-bs tt-c" aria-label={`Other themes in ${data.group.name}`}>
			<h2 class="card-title">Other themes in {data.group.name}</h2>
			<div class="row gap-xs wrap">
				{#each data.group.themes.filter((other) => other.id !== data.theme.id) as other (other.id)}
					<a class="btn px-sm" data-variant="outline" href={`/themes/${data.group.id}/${other.id}`}>{other.name}</a>
				{/each}
			</div>
		</section>
	{:else}
		<div class="page-header">
			<h2 class="page-title">{data.theme.name}</h2>
			<p class="page-desc text-secondary">{data.theme.description ?? data.theme.id}</p>
			<div class="row gap-xs wrap pt-sm">
				<span class="badge">{data.group.group}</span>
				<span class="badge">{data.theme.mode ?? 'neutral'}</span>
				{#if data.theme.family}<span class="badge">{data.theme.family}</span>{/if}
				<code class="mono text-body-sm text-muted">{data.theme.id}</code>
			</div>
		</div>
		<div class="box gap-md surface border radius-md px-md" aria-label="Theme swatches">
			<div class="row gap-md wrap">
				{#each data.theme.colors as color (color.name)}
					<div class="box gap-2xs">
						<button
							class="swatch-square"
							style="background: {color.hex}"
							type="button"
							aria-label={`Copy ${color.hex}`}
							title={copiedHex === color.hex ? 'Copied!' : `Copy ${color.hex}`}
							onclick={() => copyHex(color.hex)}
						>
							{#if copiedHex === color.hex}
								<span class="copied-mark">✓</span>
							{/if}
						</button>
						<span class="mono text-xs text-muted">{color.name}</span>
						<span class="mono text-xs text-muted">{color.hex}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>

<style lang="sass">
	.swatch-square
		display: inline-flex
		align-items: center
		justify-content: center
		height: 56px
		width: 56px
		padding: 0
		border: 1px solid var(--border)
		border-radius: var(--radius-sm)
		cursor: pointer

	.copied-mark
		display: inline-flex
		align-items: center
		justify-content: center
		height: 24px
		width: 24px
		border-radius: var(--radius-full)
		background: rgb(255 255 255 / 0.85)
		color: #111111
		font-size: var(--text-sm)
		font-weight: 700
</style>

