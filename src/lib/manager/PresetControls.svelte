<script lang="ts">
	import { onMount } from 'svelte';
	import { SHAPES, SIZES } from '$lib/types.js';
	import { presetState } from '$lib/state/presets.svelte.js';

	onMount(() => presetState.init());
</script>

<div class="row ycenter gap-sm" aria-label="Global component presets">
	<label class="row ycenter gap-xs text-body-sm text-muted">
		<select class="select" data-size="sm" data-variant="outline" value={presetState.size} aria-label="Global size preset" onchange={(event) => presetState.setSize((event.currentTarget as HTMLSelectElement).value as typeof presetState.size)}>
			{#each SIZES as size}<option value={size}>{size}</option>{/each}
		</select>
	</label>
	<label class="row ycenter gap-xs text-body-sm text-muted">
		<select class="select" data-size="sm" data-variant="outline" value={presetState.shape} aria-label="Global shape preset" onchange={(event) => presetState.setShape((event.currentTarget as HTMLSelectElement).value as typeof presetState.shape)}>
			{#each SHAPES as shape}<option value={shape}>{shape}</option>{/each}
		</select>
	</label>
	<button class="button" data-size="sm" data-variant="outline" type="button" onclick={() => presetState.reset()}>Reset</button>
</div>
