<script>
	import Loading from '#lib/components/Loading.svelte';
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Signing in (/signin): an organization, its domain as its handle; then its page (/{domain}). */
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<jl-signin>
	<div>
		<h1>{t('signin.title')}</h1>
		{#if !session.ready}
			<Loading />
		{:else if session.handle}
			<p>{t('signin.as', { handle: session.handle })}</p>
			<menu><a href="/{session.handle}" data-primary>{t('company.title')}</a></menu>
		{:else}
			<SignIn />
		{/if}
	</div>
</jl-signin>

<style>
	/* In the middle of the screen, both ways. */
	:global(main:has(> jl-signin)) {
		display: flex;
		flex-direction: column;
	}
	jl-signin {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		padding-block: var(--space-l);
	}
	div {
		width: min(100%, 24rem);
	}
	h1 {
		margin-top: 0;
		text-align: center;
	}
</style>
