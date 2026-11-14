<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Waiting for what a page reads: an empty progress bar, in the middle of the room left
	 * (of the page, or of where it is put).
	 * @type {{label?: string}}
	 */
	let { label = '' } = $props();
</script>

<jl-loading><progress aria-label={label || t('loading')}></progress></jl-loading>

<style>
	:global(main:has(> jl-loading)) {
		display: flex;
		flex-direction: column;
	}
	jl-loading {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		min-height: 8rem;
	}
	progress {
		width: 6rem;
		accent-color: var(--color-fg);
	}
</style>
