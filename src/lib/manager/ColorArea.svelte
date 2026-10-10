<script lang="ts">
	import ColorPicker from './ColorPicker.svelte';

	interface Props {
		token: string;
		value: string;
		onChange: (value: string) => void;
	}

	let { token, value, onChange }: Props = $props();
</script>

<div class="box gap-xs bg-raised border radius-sm pad-sm">
	<ColorPicker {value} {onChange} name={token}/>
</div>
