<script lang="ts">
	interface Props {
		value: string;
		name: string;
		onChange?: (value: string) => void;
	}

	let { value, onChange, name }: Props = $props();

	function update(next: string) {
		if (/^#[0-9a-f]{6}$/i.test(next)) onChange?.(next.toLowerCase());
	}
</script>

<div class="box gap-xs">
	<div class="row gap-xs">
			<input style="padding: 0" data-variant="ghost" type="color" data-size="lg" value={value} aria-label="Choose color" oninput={(event) => update((event.currentTarget as HTMLInputElement).value)} />
	<input class="input" type="text" value={value} inputmode="text" aria-label="Hex color value" oninput={(event) => update((event.currentTarget as HTMLInputElement).value)} />
	</div>
	<span class="text-body-sm">{name}</span>
</div>
