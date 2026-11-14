<script>
	import config from '#lib/data/config.json';
	import Search from '#lib/components/Search.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Search (/search): organizations on joblist and their open jobs. */
</script>

<svelte:head><title>{t('nav.search')} · {config.name}</title></svelte:head>

<jl-search>
	<hgroup>
		<h1>{t('nav.search')}</h1>
		<p>{t('search.lead')}</p>
	</hgroup>
	<Search />
</jl-search>

<style>
	/* As wide as its results and their map; its title and box as wide as reading. */
	:global(main:has(> jl-search)) {
		display: flex;
		flex-direction: column;
		max-width: calc(var(--wide-width) + 2 * var(--gutter));
	}
	/* Its results take the room left, so waiting shows in its middle. */
	jl-search {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	hgroup {
		max-width: var(--reading-width);
		margin: 0 auto var(--space-m);
		text-align: center;
	}
	hgroup p {
		margin: 0;
		color: var(--color-muted);
	}
</style>
