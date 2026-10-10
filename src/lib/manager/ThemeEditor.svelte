<script lang="ts">
	import { untrack } from 'svelte';
	import type { FractalTokens } from '$lib/types.js';
	import ColorArea from './ColorArea.svelte';
	import Dialog from '$lib/ui/Dialog.svelte';

	const TOKEN_KEYS = [
		'bg',
		'bg-surface',
		'bg-panel',
		'bg-sunken',
		'bg-raised',
		'bg-extra',
		'bg-input',
		'bg-button',
		'text-primary',
		'text-secondary',
		'text-muted',
		'text-inverse',
		'state-surface',
		'state-hover',
		'state-selected',
		'border',
		'border-subtle',
		'border-strong',
		'theme-color',
		'theme-color-alt',
		'theme-color-sub',
		'ring',
		'white-fixed',
		'black-fixed',
		'danger',
		'danger-hover',
		'success',
		'success-hover',
		'info',
		'info-hover',
		'warning',
		'warning-hover'
	] as const satisfies readonly (keyof FractalTokens)[];

	type PreviewKind = 'bg' | 'text' | 'border' | 'status';

	interface PreviewGroup {
		label: string;
		kind: PreviewKind;
		tokens: readonly (keyof FractalTokens)[];
	}

	// The preview shows one row per token family. Families without a matching
	// utility class are painted from the preview element's own CSS variables,
	// so every swatch tracks the live draft.
	const PREVIEW_GROUPS: readonly PreviewGroup[] = [
		{
			label: 'Backgrounds',
			kind: 'bg',
			tokens: [
				'bg',
				'bg-surface',
				'bg-panel',
				'bg-sunken',
				'bg-raised',
				'bg-extra',
				'bg-input',
				'bg-button'
			]
		},
		{
			label: 'text-*',
			kind: 'text',
			tokens: ['text-primary', 'text-secondary', 'text-muted', 'text-inverse']
		},
		{
			label: 'Borders',
			kind: 'border',
			tokens: ['border', 'border-subtle', 'border-strong']
		},
		{
			label: 'States',
			kind: 'bg',
			tokens: ['state-surface', 'state-hover', 'state-selected']
		},
		{
			label: 'Accents',
			kind: 'bg',
			tokens: ['theme-color', 'theme-color-alt', 'theme-color-sub']
		},
		{
			label: 'Status (hover for more)',
			kind: 'status',
			tokens: ['info', 'warning', 'danger', 'success']
		}
	];

	interface SavePayload {
		name: string;
		tokens: FractalTokens;
		asNew: boolean;
	}

	interface Props {
		themeName: string;
		tokens: FractalTokens;
		onSave?: (payload: SavePayload) => void;
		onCancel?: () => void;
	}

	let { themeName, tokens, onSave, onCancel }: Props = $props();
	// Editing state is a one-time copy of the props. The parent keys this component
	// by theme id, so selecting another theme remounts the editor with fresh values.
	// `baseline` is the last saved/original snapshot; `dirty` compares against it so
	// the Cancel action only appears once an edit exists.
	let baseline = $state<FractalTokens>(untrack(() => ({ ...tokens })));
	let draft = $state<FractalTokens>(untrack(() => ({ ...tokens })));
	const dirty = $derived(TOKEN_KEYS.some((token) => draft[token] !== baseline[token]));

	// Save flow: confirm in a modal dialog, and let the user name the theme they
	// save as. A name equal to the current theme overwrites it; any other name
	// saves as a new theme.
	let saveOpen = $state(false);
	let saveName = $state('');
	const trimmedName = $derived(saveName.trim());
	const saveAsNew = $derived(trimmedName.length > 0 && trimmedName !== themeName);

	function setToken(token: keyof FractalTokens, value: string) {
		draft = { ...draft, [token]: value };
	}

	function openSaveDialog() {
		saveName = themeName;
		saveOpen = true;
	}

	function closeSaveDialog() {
		saveOpen = false;
	}

	function confirmSave() {
		if (!trimmedName) return;
		onSave?.({ name: trimmedName, tokens: { ...draft }, asNew: saveAsNew });
		baseline = { ...draft };
		saveOpen = false;
	}

	function discardChanges() {
		draft = { ...baseline };
		onCancel?.();
	}

	// Live preview is scoped to the editor's own preview element. The draft is a
	// temporary copy of FractalTokens; the document root and the source theme are
	// never written to until the user confirms a save.
	let previewEl = $state<HTMLElement | null>(null);

	$effect(() => {
		const el = previewEl;
		if (!el) return;
		for (const token of TOKEN_KEYS) {
			el.style.setProperty(`--${token}`, draft[token]);
		}
	});
</script>

<section class="page-doc-grid">
	<section class="page-main box gap-bs" aria-label="Theme tokens">
		<div class="row gap-xs">
			{#if dirty}
				<button
					class="button"
					data-size="md"
					data-variant="outline"
					type="button"
					onclick={discardChanges}>Cancel</button
				>
				<button
					class="button"
					data-size="md"
					data-variant="primary"
					type="button"
					onclick={openSaveDialog}>Save changes</button
				>
			{/if}
		</div>
		<div class="grid card-grid gap-sm">
			{#each TOKEN_KEYS as token}<ColorArea
					{token}
					value={draft[token]}
					onChange={(value) => setToken(token, value)}
				/>{/each}
		</div>
	</section>
	<aside class="page-sidebar" aria-label="Theme preview" bind:this={previewEl}>
		<div class="box gap-md">
			{#each PREVIEW_GROUPS as group (group.label)}
				<div class="box gap-xs">
					<span class="mono text-xs text-secondary">{group.label}</span>
					<div class="row swatch-row wrap">
						{#each group.tokens as token (token)}
							<div class="row wrap gap-2xs ycenter" title={token}>
								{#if group.kind === 'border'}
									<span class="swatch-box swatch-border" style="background: var(--{token})"></span>
								{:else if group.kind === 'status'}
									<span class="swatch-box bg-{token}"></span>
								{:else if group.kind !== 'text'}
									<span class="swatch-box" style="background: var(--{token})"></span>
								{/if}
							</div>
						{/each}
					</div>
					<div class="grid-2 gap-sm xleft">
						{#each group.tokens as token (token)}
							{#if group.kind === 'text'}
								<span
									class="swatch-text"
									class:inverse={token === 'text-inverse'}
									style="color: var(--{token})">{token}</span
								>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</aside>
</section>
<Dialog bind:open={saveOpen} title="Save changes?">
	<form
		class="box gap-md"
		onsubmit={(event) => {
			event.preventDefault();
			confirmSave();
		}}
	>
		<p class="text-body-sm text-muted">
			{#if saveAsNew}
				This will save your edits as a new theme named “{trimmedName}”.
			{:else}
				This will overwrite the existing theme “{themeName}”.
			{/if}
		</p>
		<label class="box gap-2xs text-body-sm">
			Theme name
			<input class="input" bind:value={saveName} placeholder="Theme name" />
		</label>
		<div class="row xend gap-xs">
			<button class="button" data-variant="outline" type="button" onclick={closeSaveDialog}
				>Cancel</button
			>
			<button class="button" data-variant="primary" type="submit" disabled={!trimmedName}
				>Save</button
			>
		</div>
	</form>
</Dialog>

<style lang="sass">

	.page-doc-grid
		display: grid
		grid-template-columns: 1fr
		grid-template-areas: "top" "bottom"
		gap: var(--space-bs)
		.page-sidebar
			grid-area: top
		.page-main
			grid-area: bottom
		@media (min-width: 1281px)
			grid-template-columns: 1fr 360px
			grid-template-areas: "bottom top"
			.page-sidebar
				padding-inline: var(--space-bs)

	.swatch-row
		display: flex
		flex-direction: row
		border: 1px solid var(--border-strong)
		background: var(--border-strong)
		gap: 1px
		width: max-content
	// Token swatches. Colours come from the preview element's CSS variables,
	// so every swatch reflects the live draft.
	.swatch-box
		display: inline-flex
		align-items: center
		justify-content: center
		height: 32px
		width: 32px

	// Text tokens are painted as coloured text over a light/dark checker so
	// both light and dark token values stay legible.
	.swatch-text
		border: none
		font-size: var(--text-md)
		width: max-content
		flex-wrap: wrap
		height: 32px
		display: flex
		flex-direction: column
		justify-content: center
		padding-inline: var(--space-sm)
		background: var(--bg)
		&.inverse
			background: var(--text-secondary)

	.swatch-border
		background: var(--bg-surface)
</style>
