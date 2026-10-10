import {
	ALL_THEME_SETS,
	getForStylerThemes,
	type FractalTheme,
	type ThemeMode,
	type ThemeSystem
} from '$lib/canonical/index.js';

const CANONICAL_THEMES = getForStylerThemes();
const DEFAULT_THEME =
	CANONICAL_THEMES.find((theme) => theme.mode === 'light') ?? CANONICAL_THEMES[0];

export class ThemeState {
	current = $state<string>(DEFAULT_THEME?.id ?? '');
	isOpen = $state(false);
	history = $state<string[]>([]);
	initialized = $state(false);
	#colorVarNames: string[] = [];

	get allThemes(): FractalTheme[] {
		return CANONICAL_THEMES;
	}

	get currentTheme(): FractalTheme {
		return CANONICAL_THEMES.find((theme) => theme.id === this.current) ?? DEFAULT_THEME;
	}

	get isDark(): boolean {
		return this.currentTheme?.mode === 'dark';
	}

	get themeSets() {
		return ALL_THEME_SETS.filter((set) => set.group === 'styler');
	}

	themesByMode(mode: Exclude<ThemeMode, null>): FractalTheme[] {
		return CANONICAL_THEMES.filter((theme) => theme.mode === mode);
	}

	themesBySystem(system: ThemeSystem): FractalTheme[] {
		return CANONICAL_THEMES.filter((theme) => theme.system === system);
	}

	// Only Fractalstyler (group = 'styler') themes can be applied as the live theme.
	isSelectable(id: string): boolean {
		return CANONICAL_THEMES.some((theme) => theme.id === id);
	}

	init() {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;

		const savedTheme = localStorage.getItem('theme');
		const theme = savedTheme ? CANONICAL_THEMES.find((candidate) => candidate.id === savedTheme) : undefined;
		this.current = theme?.id ?? DEFAULT_THEME?.id ?? '';
		this.apply(this.current);
	}

	setTheme(id: string, remember = true): FractalTheme | undefined {
		const theme = CANONICAL_THEMES.find((candidate) => candidate.id === id);
		if (!theme || theme.id === this.current) return theme;

		if (remember && this.current) this.history = [...this.history, this.current];
		this.current = theme.id;
		this.persist();
		this.apply(theme.id);
		return theme;
	}

	chooseTheme(theme: FractalTheme): FractalTheme | undefined {
		return this.setTheme(theme.id);
	}

	undo(): FractalTheme | undefined {
		const previous = this.history.at(-1);
		if (!previous) return undefined;
		this.history = this.history.slice(0, -1);
		return this.setTheme(previous, false);
	}

	toggleMode(): FractalTheme | undefined {
		const targetMode = this.isDark ? 'light' : 'dark';
		const sameFamily = CANONICAL_THEMES.find(
			(theme) => theme.mode === targetMode && theme.family === this.currentTheme?.family
		);
		return this.setTheme(sameFamily?.id ?? this.themesByMode(targetMode)[0]?.id ?? '');
	}

	cycleNext(): FractalTheme | undefined {
		if (!CANONICAL_THEMES.length) return undefined;
		const index = CANONICAL_THEMES.findIndex((theme) => theme.id === this.current);
		return this.setTheme(CANONICAL_THEMES[(index + 1) % CANONICAL_THEMES.length].id);
	}

	cycleRandom(): FractalTheme | undefined {
		const candidates = CANONICAL_THEMES.filter((theme) => theme.id !== this.current);
		const theme = candidates[Math.floor(Math.random() * candidates.length)];
		return theme ? this.setTheme(theme.id) : undefined;
	}

	resetDefault(): FractalTheme | undefined {
		this.history = [];
		return this.setTheme(DEFAULT_THEME?.id ?? '', false);
	}

	togglePicker() {
		this.isOpen = !this.isOpen;
	}

	openPicker() {
		this.isOpen = true;
	}

	closePicker() {
		this.isOpen = false;
	}

	private persist() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem('theme', this.current);
		} catch {
			// Storage can be unavailable in private browsing.
		}
	}

	private apply(id: string) {
		if (typeof document === 'undefined') return;
		const theme = CANONICAL_THEMES.find((candidate) => candidate.id === id);
		if (!theme) return;

		const root = document.documentElement;
		for (const candidate of CANONICAL_THEMES) root.classList.remove(candidate.id);
		root.classList.add(theme.id);
		root.setAttribute('data-theme', theme.mode ?? 'light');
		root.setAttribute('data-mode', theme.mode ?? 'light');
		root.setAttribute('data-theme-id', theme.id);
		root.setAttribute('data-theme-family', theme.family ?? theme.id);
		root.setAttribute('data-theme-system', theme.system);
		root.style.colorScheme = theme.mode === 'dark' ? 'dark' : 'light';

		// Write the active theme's colors as CSS variables (--theme-color, --bg, ...),
		// removing the previous theme's variables first so nothing stale remains.
		for (const name of this.#colorVarNames) root.style.removeProperty(`--${name}`);
		for (const color of theme.colors) root.style.setProperty(`--${color.name}`, color.hex);
		this.#colorVarNames = theme.colors.map((color) => color.name);
	}
}

export const themeState = new ThemeState();
