<script>
	import { facets } from '#lib/facets.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Filters made from the jobs shown: for each property that would leave some out (how,
	 * what kind, which country, which city), its values to tap, each with how many. Nothing
	 * when there is nothing to choose.
	 * @type {{jobs: import('#lib/profile.js').Job[], chosen: import('#lib/facets.js').Chosen, shown: number}}
	 */
	let { jobs, chosen = $bindable(), shown } = $props();
	const found = $derived(facets(jobs));
	const any = $derived(Object.values(chosen).some((v) => v?.length));

	/** @param {import('#lib/facets.js').FacetKey} key @param {string} value */
	const label = (key, value) => (key === 'remote' ? t(`job.remote.${value}`) : key === 'employment' ? t(`job.employment.${value}`) : value);

	/** @param {import('#lib/facets.js').FacetKey} key @param {string} value */
	function toggle(key, value) {
		const now = chosen[key] || [];
		chosen = { ...chosen, [key]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] };
	}
</script>

{#if found.length}
	<jl-filters role="group" aria-label={t('filter.label')}>
		{#each found as facet (facet.key)}
			<div role="group" aria-label={t(`filter.${facet.key}`)}>
				<span>{t(`filter.${facet.key}`)}</span>
				{#each facet.values as v (v.value)}
					<button type="button" aria-pressed={chosen[facet.key]?.includes(v.value) ? 'true' : 'false'} onclick={() => toggle(facet.key, v.value)}>
						{label(facet.key, v.value)} <small>{v.count}</small>
					</button>
				{/each}
			</div>
		{/each}
		{#if any}
			<p role="status">
				<small>{t('filter.shown', { count: shown, total: jobs.length })}</small>
				<button type="button" data-plain onclick={() => (chosen = {})}>{t('filter.clear')}</button>
			</p>
		{/if}
	</jl-filters>
{/if}

<style>
	jl-filters {
		display: grid;
		gap: var(--space-s);
		margin-bottom: var(--space-m);
	}
	/* One line per property; on a phone it scrolls sideways rather than taking the screen. */
	div {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		overflow-x: auto;
		scrollbar-width: none;
		margin-inline: calc(-1 * var(--gutter));
		padding-inline: var(--gutter);
	}
	@media (min-width: 48rem) {
		div {
			flex-wrap: wrap;
			overflow: visible;
			margin-inline: 0;
			padding-inline: 0;
		}
	}
	span {
		flex: none;
		min-width: 4.5rem;
		margin-right: var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	button {
		flex: none;
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
		background: none;
		color: inherit;
		font: inherit;
		font-size: var(--font-size-small);
		cursor: pointer;
	}
	button:hover {
		background: var(--color-soft);
	}
	button[aria-pressed='true'] {
		border-color: var(--color-fg);
		background: var(--color-soft);
		font-weight: var(--font-weight-strong);
	}
	button small {
		opacity: 0.7;
	}
	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
		margin: 0;
	}
	[data-plain] {
		border-color: transparent;
		text-decoration: underline;
	}
</style>
