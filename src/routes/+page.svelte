<script>
	import config from '#lib/data/config.json';
	import Loading from '#lib/components/Loading.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import OrgPill from '#lib/components/OrgPill.svelte';
	import SettingsLinks from '#lib/components/SettingsLinks.svelte';
	import StoryPicture from '#lib/components/StoryPicture.svelte';
	import { loadProfile } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * joblist, in a line. Then, signed out, what it
	 * does in brief, with its picture (more on /about), and for an organization, to sign in;
	 * signed in, its own in brief: its pill (its page), its open jobs, to post one. joblist's
	 * mark last.
	 */
	const mine = $derived(session.handle ? loadProfile(session.handle).catch(() => null) : null);
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<hgroup>
		<h1>{config.name}</h1>
		<p>{t('home.lead')}</p>
	</hgroup>

	<jl-home-body>
		{#if session.handle}
			{@const domain = session.handle}
			<section aria-labelledby="home-org" data-mine>
				<h2 id="home-org">{t('company.title')}</h2>
				{#await mine}
					<OrgPill {domain} />
					<Loading />
				{:then profile}
					{@const open = profile ? profile.jobs.filter((j) => j.live).length : 0}
					<OrgPill {domain} name={profile?.company?.name} avatar={profile?.avatar} />
					<SettingsLinks
						items={[
							{ href: `/${domain}#profile-jobs`, icon: 'jobs', label: t('profile.jobs'), value: String(open) },
							{ href: `/${domain}/post`, icon: 'post', label: t('profile.post') },
							{ href: `/${domain}/edit`, icon: 'edit', label: t('profile.edit') }
						]}
					/>
				{/await}
			</section>
		{:else if session.ready}
			<section aria-labelledby="home-what" data-what>
				<div>
					<h2 id="home-what">{t('home.what.title')}</h2>
					<p>{t('home.summary')}</p>
					<p><a href="/about">{t('home.more')}</a></p>
				</div>
				<StoryPicture step={4} />
			</section>
			<section aria-labelledby="home-org" data-center>
				<h2 id="home-org">{t('home.org')}</h2>
				<p>{t('home.org.text')}</p>
				<menu><a href="/signin" data-primary>{t('signin.title')}</a></menu>
			</section>
			<a href="/" data-logo aria-label={t('nav.home')}><Logo /></a>
		{/if}
	</jl-home-body>
</jl-home>

<style>
	/* Its title and line on top; below, the rest in the middle of the room left. */
	:global(main:has(> jl-home)) {
		display: flex;
		flex-direction: column;
	}
	jl-home,
	jl-home-body {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	jl-home-body {
		justify-content: center;
		padding-block: var(--space-l);
	}
	/* Signed in: its own, right under the title, as wide as reading. */
	jl-home-body:has(> [data-mine]) {
		justify-content: flex-start;
	}
	[data-mine] {
		display: grid;
		gap: var(--space-m);
		width: 100%;
		max-width: var(--reading-width);
		margin-inline: auto;
	}
	[data-mine] h2 {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-strong);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	[data-mine] > :global(a) {
		justify-self: start;
	}
	[data-mine] :global(menu) {
		margin: 0;
	}
	hgroup,
	[data-center] {
		text-align: center;
	}
	[data-center] {
		width: 100%;
		max-width: var(--reading-width);
		margin-inline: auto;
	}
	hgroup p {
		margin-top: 0;
	}
	p {
		margin-inline: auto;
	}
	[data-center] menu {
		justify-content: center;
	}
	/* What it does: its text beside its picture when there is room. */
	[data-what] {
		display: grid;
		gap: var(--space-m) var(--space-xl);
		align-items: center;
		width: 100%;
		max-width: 60rem;
		margin: 0 auto var(--space-l);
	}
	[data-what] h2 {
		margin-top: 0;
	}
	@media (min-width: 40rem) {
		[data-what] {
			grid-template-columns: 2fr 3fr;
		}
	}
	/* joblist's mark, last. */
	[data-logo] {
		display: flex;
		align-self: center;
		margin-top: var(--space-l);
		padding: var(--space-xs);
		--logo-size: 2.5rem;
		color: var(--color-fg);
	}
</style>
