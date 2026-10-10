<script lang="ts">
	import { onMount } from 'svelte';
	import { themeState } from '../state/theme.svelte.js';
	import Sun from '$lib/icon/Sun.svelte';
	import Moon from '$lib/icon/Moon.svelte';

	interface Props {
		class?: string;
		title?: string;
		iconSize?: number;
		iconColor?: string;
	}

	let { class: className = '', title, iconSize = 14, iconColor = "currentColor" }: Props = $props();

	onMount(() => {
		themeState.init();
	});
</script>

<button
	type="button"
	class="theme-icon-btn {className}"
	title={title || (themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
	aria-label={title || (themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
	onclick={() => themeState.toggleMode()}
>
	{#if themeState.isDark}
		<Sun size={iconSize} color={iconColor} />
	{:else}
		<Moon size={iconSize} color={iconColor} />
	{/if}
</button>
