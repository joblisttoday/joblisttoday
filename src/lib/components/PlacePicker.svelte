<script>
	import { untrack } from 'svelte';
	import { mountPicker } from '#lib/map/maplibre.js';
	import { placeAt } from '#lib/places.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where a place is, chosen on a map: a tap or a drag of its pin sets its point; what is
	 * there (its address, city, country) fills the fields still empty.
	 * @type {{location: import('#lib/places.js').Location}}
	 */
	let { location = $bindable() } = $props();
	/** @type {ReturnType<typeof mountPicker> | undefined} */
	let picker;
	let said = $state('');
	/** @type {AbortController | undefined} */
	let asking;

	/** @param {number} lat @param {number} lon */
	async function pick(lat, lon) {
		location.latitude = String(Math.round(lat * 1e5) / 1e5);
		location.longitude = String(Math.round(lon * 1e5) / 1e5);
		said = t('form.location.picked');
		asking?.abort();
		asking = new AbortController();
		const found = await placeAt(lat, lon, i18n.locale, asking.signal).catch(() => null);
		if (!found) return;
		const filled = /** @type {const} */ (['address', 'name', 'country', 'countryCode']).filter((k) => !location[k] && found.location[k]);
		for (const k of filled) location[k] = found.location[k];
		if (filled.length) said = t('form.location.filled', { place: found.label });
	}

	/** @param {HTMLElement} node */
	function mount(node) {
		picker = untrack(() => mountPicker(node, { lat: Number(location.latitude) || undefined, lon: Number(location.longitude) || undefined }, pick));
		return () => picker?.destroy();
	}

	// A point typed by hand moves the pin.
	$effect(() => {
		const lat = Number(location.latitude);
		const lon = Number(location.longitude);
		if (location.latitude && location.longitude) picker?.move(lat, lon);
	});
</script>

<p><small>{t('form.location.pick')}</small></p>
<figure {@attach mount} aria-label={t('form.location.pickMap')}></figure>
<p role="status"><small>{said}</small></p>

<style>
	figure {
		position: relative;
		height: 14rem;
		margin: var(--space-xs) 0 0;
		overflow: hidden;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	p {
		margin: var(--space-s) 0 0;
		color: var(--color-muted);
	}
</style>
