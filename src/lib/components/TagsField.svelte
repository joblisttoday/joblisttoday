<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Tags, one by one: each a chip to remove; a box adds one on Enter or a comma (several
	 * pasted at once, with commas); Backspace in the empty box takes the last one back. The
	 * form keeps them as one line, with commas.
	 * @type {{value: string, max?: number, maxLength?: number}}
	 */
	let { value = $bindable(''), max = 20, maxLength = 64 } = $props();
	const id = $props.id();
	let draft = $state('');
	let said = $state('');
	const tags = $derived([...new Set(value.split(',').map((w) => w.trim()).filter(Boolean))]);
	const full = $derived(tags.length >= max);

	/** @param {string[]} next */
	const keep = (next) => (value = next.join(', '));

	/** Adds what is typed (or pasted): each part between commas, once. */
	function add() {
		const fresh = draft
			.split(',')
			.map((w) => w.trim().slice(0, maxLength))
			.filter((w) => w && !tags.some((x) => x.toLowerCase() === w.toLowerCase()));
		draft = '';
		if (!fresh.length) return;
		keep([...tags, ...fresh].slice(0, max));
		said = t('form.tags.added', { name: fresh.join(', ') });
	}
	/** @param {string} tag */
	function remove(tag) {
		keep(tags.filter((x) => x !== tag));
		said = t('form.tags.removed', { name: tag });
	}
	/** @param {KeyboardEvent} e */
	function key(e) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			add();
		} else if (e.key === 'Backspace' && !draft && tags.length) {
			e.preventDefault();
			draft = tags[tags.length - 1];
			keep(tags.slice(0, -1));
		}
	}
</script>

<fieldset>
	<legend>{t('company.tags')}</legend>
	{#if tags.length}
		<ul aria-label={t('company.tags')}>
			{#each tags as tag (tag)}
				<li>
					<span>{tag}</span>
					<button type="button" aria-label={t('form.tags.remove', { name: tag })} title={t('form.tags.remove', { name: tag })} onclick={() => remove(tag)}><Icon name="close" /></button>
				</li>
			{/each}
		</ul>
	{/if}
	<label for={id}>{t('form.tags.add')} <small>{t('form.tags.help', { count: tags.length, max })}</small></label>
	<div data-add>
		<input {id} bind:value={draft} onkeydown={key} onblur={add} disabled={full} maxlength={maxLength * 4} placeholder={t('form.tags.placeholder')} autocomplete="off" enterkeyhint="done" />
		<button type="button" onclick={add} disabled={full || !draft.trim()}>{t('form.tags.addOne')}</button>
	</div>
	<p role="status" data-hidden>{said}</p>
</fieldset>

<style>
	fieldset {
		display: grid;
		gap: var(--space-s);
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--space-s);
		font-weight: var(--font-weight-strong);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: inline-flex;
		align-items: center;
		padding-inline-start: var(--space-s);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	li button {
		min-height: var(--tap-size);
		min-width: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	li button:hover {
		color: var(--color-fg);
	}
	label {
		font-weight: normal;
	}
	[data-add] {
		display: flex;
		gap: var(--space-s);
	}
	[data-add] input {
		flex: 1;
	}
	[data-hidden] {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
