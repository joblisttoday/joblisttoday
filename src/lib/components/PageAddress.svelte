<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where an organization's page is: joblist's address, then its handle. Its own domain, or
	 * the handle its host gives it (a Bluesky one): every atproto handle is a domain name.
	 */
	const host = 'joblist.today/';
	const examples = [
		{ handle: 'example.org', label: 'address.own' },
		{ handle: 'example.bsky.social', label: 'address.host' }
	];
</script>

<figure aria-label={t('address.label')}>
	<ul>
		{#each examples as e (e.handle)}
			<li>
				<code><Icon name="link" /><span>{host}<strong>{e.handle}</strong></span></code>
				<small>{t(e.label)}</small>
			</li>
		{/each}
	</ul>
	<figcaption><small>{t('address.note')}</small></figcaption>
</figure>

<style>
	figure {
		margin: var(--space-m) 0;
		padding: var(--space-s) var(--space-m);
		border: var(--border);
		border-radius: var(--radius-large);
		background: var(--color-soft);
	}
	ul {
		display: grid;
		gap: var(--space-s);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		gap: 2px;
	}
	code {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
		padding: var(--space-xs) var(--space-s);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-bg);
		font-family: inherit;
		font-size: var(--font-size-small);
		overflow-wrap: anywhere;
	}
	code :global(svg) {
		flex: none;
		color: var(--color-muted);
	}
	span {
		color: var(--color-muted);
	}
	strong {
		color: var(--color-fg);
	}
	li small {
		padding-inline: var(--space-s);
		color: var(--color-muted);
	}
	figcaption {
		margin-top: var(--space-s);
	}
</style>
