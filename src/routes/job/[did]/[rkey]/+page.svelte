<script>
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import ContextMenu from '#lib/components/ContextMenu.svelte';
	import OrgPill from '#lib/components/OrgPill.svelte';
	import PlacesMap from '#lib/components/PlacesMap.svelte';
	import { locationPoints } from '#lib/places.js';
	import { ago } from '#lib/i18n/dates.js';
	import { loadJob } from '#lib/profile.js';
	import { daysLeft } from '#lib/records.js';
	import { deleteRecord, session } from '#lib/session.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job offer's page (/job/{did}/{rkey}, the address its record keeps), read from its
	 * organization's own account: what, where, how to apply; a "⋯" menu shares it, and, for
	 * its own account, changes or deletes it.
	 */
	const did = $derived(page.params.did || '');
	const rkey = $derived(page.params.rkey || '');
	/** undefined while read; null: not there; 'unreachable' */
	let job = $state(/** @type {Awaited<ReturnType<typeof loadJob>> | 'unreachable' | undefined} */ (undefined));
	$effect(() => {
		const asked = `${did}/${rkey}`;
		job = undefined;
		loadJob(did, rkey).then(
			(j) => asked === `${did}/${rkey}` && (job = j),
			() => asked === `${did}/${rkey}` && (job = 'unreachable')
		);
	});
	const found = $derived(typeof job === 'object' && job ? job : null);
	const own = $derived(Boolean(found) && session.did === did);
	const facts = $derived(
		found ? [found.place, found.remote && t(`job.remote.${found.remote}`), found.employment && t(`job.employment.${found.employment}`)].filter(Boolean) : []
	);
	const when = $derived(
		found
			? [found.createdAt && t('job.posted', { ago: ago(Date.parse(found.createdAt), i18n.locale) }), found.live && t('job.left', { count: daysLeft(found.expiresAt) })].filter(Boolean)
			: []
	);

	const actions = $derived([
		{ label: t('menu.share'), icon: /** @type {const} */ ('share'), share: { title: found?.title || '', url: location.href } },
		...(own
			? [
					{ label: t('profile.edit'), icon: /** @type {const} */ ('edit'), href: `${page.url.pathname}/edit` },
					{ label: t('job.delete'), icon: /** @type {const} */ ('delete'), onclick: remove, danger: true }
				]
			: [])
	]);

	async function remove() {
		if (!found || !confirm(t('job.delete.confirm'))) return;
		await deleteRecord(config.collections.job, rkey);
		await goto(`/${found.company}`);
	}
</script>

<svelte:head><title>{found?.title || t('notFound.title')} · {config.name}</title></svelte:head>

{#if job === undefined}
	<Loading />
{:else if job === 'unreachable'}
	<p role="alert">{t('profile.unreachable')}</p>
{:else if !found}
	<h1>{t('notFound.title')}</h1>
	<p>{t('job.notFound')}</p>
{:else}
	<jl-wide>
		<div>
			<header>
				<OrgPill domain={found.company} name={found.name} avatar={found.avatar} />
				<ContextMenu label={t('menu.more')} items={actions} />
			</header>
			<h1>{found.title}</h1>
			{#if facts.length}<p>{facts.join(' · ')}</p>{/if}
			<p><small>{when.join(' · ')}</small></p>
			{#if !found.live}<p role="status">{t('job.closed')}</p>{/if}
			{#if found.live && (found.apply || found.bluesky)}
				<menu>
					{#if found.apply}<a href={found.apply} target="_blank" rel="noopener noreferrer" data-primary>{t('job.apply')}</a>{/if}
					<!-- Bluesky has no address that opens a message: its profile does, with its Message button. -->
					{#if found.bluesky}<a href={config.links.bluesky.replace('{did}', found.did)} target="_blank" rel="noopener noreferrer" data-primary={found.apply ? undefined : ''}>{t('job.apply.bluesky')}</a>{/if}
				</menu>
			{/if}
			{#if found.description}<p data-text>{found.description}</p>{/if}
		</div>
		<aside>{#if found.remote !== 'remote'}<PlacesMap points={locationPoints(found.locations)} />{/if}</aside>
	</jl-wide>
{/if}

<style>
	menu + [data-text] {
		margin-top: var(--space-l);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-m);
		margin-top: var(--space-m);
	}
	header + h1 {
		margin-top: var(--space-m);
	}
</style>
