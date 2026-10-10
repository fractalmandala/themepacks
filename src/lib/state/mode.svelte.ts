import { getDarkThemes, getLightThemes } from '$lib/canonical/index.js';
import { transition, type TransitionSpec } from '$lib/utils/transitions.js';

export type Mode = 'dark' | 'light' | 'system';
export type ResolvedMode = 'dark' | 'light';

export interface ModeOptions {
	attribute?: string;
	storageKey?: string;
	defaultMode?: Mode;
}

const DEFAULTS = {
	attribute: 'data-mode',
	storageKey: 'mode',
	defaultMode: 'system' as Mode
};

export function modeScript(options: ModeOptions = {}): string {
	const { attribute, storageKey, defaultMode } = { ...DEFAULTS, ...options };
	return `(function(){try{var mode=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};if(mode==='system')mode=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute(${JSON.stringify(attribute)},mode)}catch(e){}})()`;
}

class ModeStore {
	#attribute: string;
	#storageKey: string;
	#system: MediaQueryList | undefined;

	preference = $state<Mode>('system');
	resolved = $state<ResolvedMode>('light');

	constructor(options: ModeOptions = {}) {
		const { attribute, storageKey, defaultMode } = { ...DEFAULTS, ...options };
		this.#attribute = attribute;
		this.#storageKey = storageKey;
		this.preference = defaultMode;

		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem(storageKey) as Mode | null;
		if (stored === 'dark' || stored === 'light' || stored === 'system') this.preference = stored;
		this.#system = window.matchMedia('(prefers-color-scheme: dark)');
		this.#system.addEventListener('change', () => this.#apply());
		window.addEventListener('storage', (event) => {
			if (event.key !== this.#storageKey) return;
			if (event.newValue === 'dark' || event.newValue === 'light' || event.newValue === 'system') {
				this.preference = event.newValue;
				this.#apply();
			}
		});
		this.#apply();
	}

	get isDark() {
		return this.resolved === 'dark';
	}

	get themeIds() {
		return this.resolved === 'dark'
			? getDarkThemes().map((theme) => theme.id)
			: getLightThemes().map((theme) => theme.id);
	}

	#apply() {
		this.resolved = this.preference === 'system'
			? this.#system?.matches ? 'dark' : 'light'
			: this.preference;
		document.documentElement.setAttribute(this.#attribute, this.resolved);
	}

	async set(next: Mode, spec?: TransitionSpec) {
		const commit = () => {
			this.preference = next;
			try {
				localStorage.setItem(this.#storageKey, next);
			} catch {}
			this.#apply();
		};
		if (spec) await transition(commit, spec);
		else commit();
	}

	toggle(spec?: TransitionSpec) {
		const next = this.resolved === 'dark' ? 'light' : 'dark';
		return this.set(next, spec);
	}

	setLight(spec?: TransitionSpec) {
		return this.set('light', spec);
	}

	setDark(spec?: TransitionSpec) {
		return this.set('dark', spec);
	}
}

let store: ModeStore | undefined;

export function mode(options?: ModeOptions): ModeStore {
	store ??= new ModeStore(options);
	return store;
}
