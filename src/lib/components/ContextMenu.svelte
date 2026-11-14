<script>
	import Icon from './Icon.svelte';
	import { share as sharePage } from '#lib/share.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What can be done with what a page shows (an organization, a job), behind one "⋯"
	 * button: links and actions, each with its icon. Closes on a choice, a tap elsewhere or
	 * Escape; sharing where the device cannot copies its link and says so in place, open.
	 * @type {{label: string, items: {label: string, icon: import('#lib/icons.js').IconName, href?: string, onclick?: () => void, share?: {title: string, url: string}, danger?: boolean}[]}}
	 */
	let { label, items } = $props();
	const id = $props.id();
	let open = $state(false);
	/** @type {HTMLElement | undefined} */
	let root = $state();
	/** The item whose link was just copied */
	let copied = $state('');
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;

	/** @param {(typeof items)[number]} item */
	async function choose(item) {
		if (!item.share) return void ((open = false), item.onclick?.());
		if ((await sharePage(item.share)) !== 'copied') return void (open = false);
		copied = item.label;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = ''), 2500);
	}

	/** A tap elsewhere closes it. @param {PointerEvent} e */
	function outside(e) {
		if (open && root && !root.contains(/** @type {Node} */ (e.target))) (open = false), (copied = '');
	}
	/** Escape closes it, back on its button. @param {KeyboardEvent} e */
	function escape(e) {
		if (!open || e.key !== 'Escape') return;
		open = false;
		copied = '';
		root?.querySelector('button')?.focus();
	}
</script>

<svelte:document onpointerdown={outside} onkeydown={escape} />

<jl-context-menu bind:this={root}>
	<button type="button" aria-label={label} title={label} aria-expanded={open} aria-controls={id} onclick={() => ((open = !open), (copied = ''))}><Icon name="more" /></button>
	{#if open}
		<ul {id}>
			{#each items as item (item.label)}
				<li>
					{#if item.href}
						<a href={item.href} onclick={() => (open = false)}><Icon name={item.icon} />{item.label}</a>
					{:else}
						<button type="button" data-danger={item.danger || undefined} onclick={() => choose(item)}>
							{#if copied === item.label}<Icon name="copied" /><span role="status">{t('menu.copied')}</span>{:else}<Icon name={item.icon} />{item.label}{/if}
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</jl-context-menu>

<style>
	jl-context-menu {
		position: relative;
		flex: none;
	}
	jl-context-menu > button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-size);
		height: var(--tap-size);
		padding: 0;
		border: var(--border);
		border-radius: var(--radius-round);
		background: var(--color-bg);
		color: var(--color-fg);
	}
	jl-context-menu > button:hover,
	jl-context-menu > button[aria-expanded='true'] {
		background: var(--color-soft);
	}
	ul {
		position: absolute;
		top: calc(100% + var(--space-xs));
		right: 0;
		z-index: 20;
		min-width: 14rem;
		margin: 0;
		padding: var(--space-xs);
		list-style: none;
		background: var(--color-bg);
		border: var(--border);
		border-radius: var(--radius-large);
		box-shadow: var(--shadow-menu);
	}
	ul a,
	ul button {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-s);
		width: 100%;
		min-height: var(--tap-size);
		padding: 0 var(--space-s);
		border: 0;
		border-radius: var(--radius);
		background: none;
		color: var(--color-fg);
		font: inherit;
		font-weight: normal;
		text-align: start;
		text-decoration: none;
		white-space: nowrap;
	}
	ul a:hover,
	ul button:hover {
		background: var(--color-soft);
	}
	[data-danger] {
		color: var(--color-error);
	}
</style>
