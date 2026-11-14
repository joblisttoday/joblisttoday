<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where what is written here goes: publicly, to the account signed in (its handle, in
	 * bold). The text says it in each language, the handle where the language puts it.
	 * @type {{handle: string, key?: string}}
	 */
	let { handle, key = 'post.intro' } = $props();
	const MARK = '\u0000';
	const parts = $derived(t(key, { handle: MARK }).split(MARK));
</script>

<p><small>{parts[0]}<strong>@{handle}</strong>{parts[1] || ''}</small></p>

<style>
	p {
		margin-top: 0;
	}
	strong {
		overflow-wrap: anywhere;
	}
</style>
