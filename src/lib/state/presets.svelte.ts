import { presetApplication, SHAPES, SIZES, type DataShape, type DataSize, type DataVariant } from '$lib/types.js';

const STORAGE_KEY = 'themepacks:presets';

// Default variant applied to form controls that do not declare their own data-variant.
const VARIANT_TARGETS = 'input, select';
const DEFAULT_VARIANT: DataVariant = 'primary';

type Applied = { size?: string; shape?: string; variant?: string };

export class PresetState {
	size = $state<DataSize>('bs');
	shape = $state<DataShape>('modern');
	initialized = $state(false);
	#observer: MutationObserver | undefined;
	#applied = new WeakMap<Element, Applied>();

	init() {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
			if (SIZES.includes(saved.size)) this.size = saved.size;
			if (SHAPES.includes(saved.shape)) this.shape = saved.shape;
		} catch {
			// Invalid or unavailable storage falls back to the built-in defaults.
		}
		this.apply();
		this.#observer = new MutationObserver(() => this.apply());
		this.#observer.observe(document.documentElement, { childList: true, subtree: true });
	}

	setSize(size: DataSize) {
		this.size = size;
		this.persist();
		this.apply();
	}

	setShape(shape: DataShape) {
		this.shape = shape;
		this.persist();
		this.apply();
	}

	reset() {
		this.size = 'bs';
		this.shape = 'modern';
		this.persist();
		this.apply();
	}

	private persist() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ size: this.size, shape: this.shape }));
		} catch {}
	}

	// Removes only the attributes this system added. Attributes that the markup
	// declared itself were never recorded, so they are never removed.
	private clearApplied() {
		for (const selector of presetApplication) {
			for (const element of document.querySelectorAll(selector)) {
				const applied = this.#applied.get(element);
				if (!applied) continue;
				if (applied.size && element.getAttribute('data-size') === applied.size) element.removeAttribute('data-size');
				if (applied.shape && element.getAttribute('data-shape') === applied.shape) element.removeAttribute('data-shape');
				if (applied.variant && element.getAttribute('data-variant') === applied.variant) element.removeAttribute('data-variant');
				this.#applied.delete(element);
			}
		}
	}

	private apply() {
		if (typeof document === 'undefined') return;
		this.clearApplied();
		for (const selector of presetApplication) {
			for (const element of document.querySelectorAll(selector)) {
				const applied: Applied = this.#applied.get(element) ?? {};
				if (!element.hasAttribute('data-size')) {
					element.setAttribute('data-size', this.size);
					applied.size = this.size;
				}
				if (!element.hasAttribute('data-shape')) {
					element.setAttribute('data-shape', this.shape);
					applied.shape = this.shape;
				}
				if (element.matches(VARIANT_TARGETS) && !element.hasAttribute('data-variant')) {
					element.setAttribute('data-variant', DEFAULT_VARIANT);
					applied.variant = DEFAULT_VARIANT;
				}
				if (applied.size || applied.shape || applied.variant) this.#applied.set(element, applied);
			}
		}
	}
}

export const presetState = new PresetState();
