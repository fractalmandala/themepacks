<script lang="ts">
	import type { Snippet } from 'svelte';
	import Close from '$lib/icon/Close.svelte';

	interface Props {
		open?: boolean;
		title?: string;
		closable?: boolean;
		onclose?: () => void;
		children?: Snippet;
	}

	let { open = $bindable(false), title, closable = true, onclose, children }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);

	// Keep the native dialog in sync with the bound `open` value.
	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (open) {
			if (!el.open) el.showModal();
		} else if (el.open) {
			el.close();
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogEl) open = false;
	}

	function handleClose() {
		// Fired on Escape or close(); sync the bound value back.
		if (open) open = false;
		onclose?.();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="dialog"
	aria-label={title || 'Dialog'}
	onclick={handleBackdropClick}
	onclose={handleClose}
>
	<div class="dialog-body box gap-md pad-lg">
		{#if title || closable}
			<header class="dialog-header row gap-sm">
				{#if title}<h2 class="card-title grow">{title}</h2>{/if}
				{#if closable}
					<button
						class="dialog-close"
						type="button"
						aria-label="Close dialog"
						onclick={() => (open = false)}
					>
						<Close size={16} color="currentColor" />
					</button>
				{/if}
			</header>
		{/if}
		{@render children?.()}
	</div>
</dialog>

<style lang="sass">
	// Native <dialog> centred over its ::backdrop overlay.
	.dialog
		position: fixed
		inset: 0
		margin: auto
		width: min(28rem, calc(100% - 2rem))
		height: fit-content
		max-height: calc(100vh - 2rem)
		padding: 0
		border: 1px solid var(--border)
		background: var(--bg-panel)
		color: var(--text-primary)
		box-shadow: var(--shadow-lg)
		overflow: hidden
		&::backdrop
			background: rgb(0 0 0 / 0.5)

	.dialog-header
		align-items: flex-start
		.dialog-close
			display: inline-flex
			align-items: center
			justify-content: center
			height: 24px
			width: 24px
			border: none
			border-radius: var(--radius-sm)
			background: transparent
			color: var(--text-secondary)
			cursor: pointer
			&:hover
				background: var(--state-hover)
				color: var(--text-primary)
</style>