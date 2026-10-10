
<script lang="ts">

	import { ALL_THEME_SETS } from '$lib/canonical/index.js';
	import PageShell from '$lib/ui/PageShell.svelte'
    import { page } from '$app/state';
    let { children } = $props();

</script>

     <aside class="sidebar-left box gap-md" style="padding-block: var(--space-lg)">
            <nav class="box gap-xs" aria-label="Theme systems">
                {#each ALL_THEME_SETS as set (set.id)}
                    <a class="nav-link" href={`/themes/${set.id}`} aria-current={page.params.slug === set.id ? 'page' : undefined}>{set.name} <span class="mono text-muted">{set.count}</span></a>
                {/each}
            </nav>
        </aside>
        <PageShell isHeader={false} articleGap="narrow-half gap-2xl">
                {@render children()}
        </PageShell>
