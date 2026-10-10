<script lang="ts">
	import type { FractalTheme } from '$lib/canonical/index.js';

	let { data } = $props();
	let mode = $state<'all' | 'light' | 'dark'>('all');
	let search = $state('');
	let copied = $state(false);

	// Canonical theme shape for this group — the exact JSON a contributor must use
	// when adding a theme, so the converter can ingest it.
	const themeTemplate = $derived.by(() => {
		const sample = data.group.themes[0];
		const color = sample?.colors[0];
		return {
			id: 'kebab-case-unique-id',
			name: 'Human Readable Name',
			system: data.group.system,
			mode: 'light',
			family: sample?.family ?? 'family-name',
			description: 'One-line description of the aesthetic.',
			bgColor: sample?.bgColor ?? '#101010',
			textColor: sample?.textColor ?? '#EDF2F7',
			accentColor: sample?.accentColor ?? '#04825B',
			colors: [
				{
					name: color?.name ?? 'fg',
					hex: color?.hex ?? '#EDF2F7',
					oklch: color?.oklch ?? 'oklch(...)',
					rgb: color?.rgb ?? 'rgb(...)',
					contrast: color?.contrast ?? { white: 1, black: 21 },
					role: color?.role ?? 'foreground',
					step: color?.step ?? 1,
					category: color?.category ?? 'foreground'
				}
			]
		};
	});
	const groupTemplateJson = $derived(JSON.stringify(themeTemplate, null, 2));

	async function copyTemplate() {
		try {
			await navigator.clipboard.writeText(groupTemplateJson);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = groupTemplateJson;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
		}
		copied = true;
		setTimeout(() => (copied = false), 1400);
	}

	const themes = $derived.by(() => {
		const query = search.trim().toLowerCase();
		return data.group.themes.filter(
			(theme: FractalTheme) =>
				(mode === 'all' || theme.mode === mode) &&
				(!query ||
					[theme.id, theme.name, theme.family, theme.description]
						.filter(Boolean)
						.some((value) => value!.toLowerCase().includes(query)))
		);
	});
</script>

<svelte:head>
	<title>{data.group.name} · Themepacks</title>
	<meta name="description" content={data.group.description} />
</svelte:head>

<section class="box gap-lg pad-lg">
	<div class="page-header">
		<h2 class="page-title">{data.group.name}</h2>
		<p class="page-desc text-secondary">{data.group.description}</p>
		<div class="row gap-bs ycenter pt-sm">
			<span class="text-sm tt-u text-theme">{data.group.group} | {data.group.count} Themes</span>
		</div>
	</div>
	<section class="row xbetween ycenter gap-md wrap" aria-label="Theme filters">
		<div class="row gap-xs wrap">
			{#each ['all', 'light', 'dark'] as option}
				<button class="button" data-size="sm" data-variant={mode === option ? 'primary' : 'outline'} type="button" onclick={() => (mode = option as typeof mode)}>{option[0].toUpperCase() + option.slice(1)}</button>
			{/each}
		</div>
	</section>

	<section class="grid-4 gap-bs" aria-label={`${data.group.name} themes`}>
		{#each themes as theme (theme.id)}
			<a class="card box gap-sm surface border radius-md pad-sm" href={`/themes/${data.group.id}/${theme.id}`}>
				<div class="box gap-2xs"><h2 class="card-title">{theme.name}</h2><code class="mono text-body-sm text-muted">{theme.id}</code></div>
				<div class="row h-md" aria-label={`${theme.colors.length} colors`}>
					{#each theme.colors.slice(0, 12) as color (color.name)}
						<svg viewBox="0 0 1 1" class="grow" aria-label={color.name}><rect width="1" height="1" fill={color.hex} /></svg>
					{/each}
				</div>
				<div class="row gap-xs"><span class="badge">{theme.mode ?? 'neutral'}</span>{#if theme.family}<span class="badge">{theme.family}</span>{/if}</div>
				<span class="text-body-sm text-theme">Open theme →</span>
			</a>
		{/each}
	</section>

	<section class="box gap-sm surface border radius-md pad-md" aria-label="Theme JSON format">
		<div class="row xbetween ycenter gap-md wrap">
			<div class="box gap-2xs">
				<h2 class="card-title">Add a theme to {data.group.name}</h2>
				<p class="text-body-sm text-muted">
					New themes in this group must use this exact JSON shape. Paste the object into
					<code class="mono text-body-sm">src/lib/canonical/{data.group.id}.ts</code>, then run
					<code class="mono text-body-sm">npm run themes:convert</code> to regenerate the
					canonical trio (.json / .ts / .md).
				</p>
			</div>
			<button class="button" data-size="sm" data-variant="outline" type="button" onclick={copyTemplate}>
				{copied ? 'Copied!' : 'Copy JSON'}
			</button>
		</div>
		<pre class="box border bg-raised pad-md mono text-body-sm">{groupTemplateJson}</pre>
	</section>
</section>
