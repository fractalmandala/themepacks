<script lang="ts">

	interface Props {
		size?: number | string;
		color?: string;
	}

	let { size = 16, color= "currentColor" }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 10C2 10 13 10 16 10C24 10 24 21 16 21M9 17L2 10L9 3" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
