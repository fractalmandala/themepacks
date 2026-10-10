<script lang="ts">
	import { getStylerThemeSets } from '$lib/canonical/index.js';
	import { themeState } from '$lib/state/theme.svelte.js';

	// Only theme sets with group === 'styler' are offered for the live site.
	const sets = getStylerThemeSets();

	function choose(event: Event) {
		themeState.setTheme((event.currentTarget as HTMLSelectElement).value);
	}
</script>

<label class="row ycenter gap-xs text-body-sm text-muted">
	<select class="select" data-size="sm" data-variant="outline" aria-label="Active theme" onchange={choose}>
		{#each sets as set (set.id)}
			<optgroup label={set.name}>
				{#each set.themes as theme (theme.id)}
					<option value={theme.id} selected={theme.id === themeState.current}>{theme.name}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
</label>
