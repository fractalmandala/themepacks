<script lang="ts">

	export interface Props {
		size: number,
		color: string
	}

	let {
		size = 16, color = "currentColor"
	}: Props = $props()

</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 21L12 12M12 12L21 3M12 12L3 3M12 12L21 21" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
