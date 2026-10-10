<script lang="ts">

    import '$lib/styles/index.sass'
	import { ALL_THEME_SETS, getAllThemes, type FractalTheme, type ThemeSystem } from '$lib/canonical/index.js';
	import ThemePicker from '$lib/manager/ThemePicker.svelte';
    import PresetControls from '$lib/manager/PresetControls.svelte';
    import { themeState } from '$lib/state/theme.svelte.js';
    import ThemeSelect from '$lib/manager/ThemeSelect.svelte'
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    let { children } = $props();

    // Apply the saved or default theme on every page. Fractalstyler's color
    // tokens are scoped to [data-mode], which only apply() sets.
    onMount(() => themeState.init());

    let selected = $state<FractalTheme | null>(null);
	function chooseTheme(theme: FractalTheme) {
		themeState.setTheme(theme.id);
		selected = theme;
	}

</script>

<div class="app-shell">
    <header class="app-header row wfull xbetween ycenter">
        <a class="logo-link" href="/">
            <span class="weight-700 text-bs">Fractal Themepacks</span>
        </a>
            <nav class="header-nav row gap-bs ycenter">
                <a href="/themes">Themes</a>
                <ThemeSelect/>
                <PresetControls/>
            </nav>
        	
    </header>
    <main class="app-main">

   

            {@render children()}

    </main>
    <footer class="app-footer bt bg-panel">
        <span class="text-xs tt-u">2026 | <a class="link" href="https://www.fractalsvelte.dev">Fractalsvelte</a></span>
    </footer>
</div>