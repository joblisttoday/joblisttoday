import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Places, as records keep them (today.joblist.company#location): a name, an address, a
 * country, and where it is (decimal degrees, as strings). Found by name as someone types
 * (Photon, an OpenStreetMap search made for it).
 * @typedef {{name?: string, address?: string, country?: string, countryCode?: string, latitude?: string, longitude?: string}} Location
 * @typedef {{label: string, location: Location}} FoundPlace
 *   label: the name with what tells it from others of the same name.
 */

/** Coordinates as records keep them: decimal degrees in a string, to about a metre. @param {number} value */
const degrees = (value) => String(Math.round(value * 1e5) / 1e5);

/** A text field of a place, as the lexicon allows it. @param {unknown} value @param {number} max */
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * A place as written by anyone, made safe to show and to write back: only its known
 * fields, each as long as the lexicon allows, coordinates only when they are numbers on the
 * Earth. Null when nothing is left.
 * @param {unknown} value
 * @returns {Location | null}
 */
export function toLocation(value) {
	if (!value || typeof value !== 'object') return null;
	const v = /** @type {Record<string, unknown>} */ (value);
	/** @type {Location} */
	const place = {};
	const name = text(v.name, 100);
	const address = text(v.address, 200);
	const country = text(v.country, 100);
	const code = text(v.countryCode, 2).toUpperCase();
	if (name) place.name = name;
	if (address) place.address = address;
	if (country) place.country = country;
	if (/^[A-Z]{2}$/.test(code)) place.countryCode = code;
	const lat = Number(v.latitude);
	const lon = Number(v.longitude);
	if (v.latitude !== '' && v.longitude !== '' && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
		place.latitude = degrees(lat);
		place.longitude = degrees(lon);
	}
	return place.name || place.address || place.country || place.latitude ? place : null;
}

/** Places as written by anyone, the safe ones (toLocation), at most `max`. @param {unknown} list @param {number} [max] */
export const toLocations = (list, max = 50) => (Array.isArray(list) ? list.map(toLocation).filter((l) => l !== null).slice(0, max) : []);

/** A place in short, its city and country: "Berlin, Germany". @param {Location} location */
export const locationLabel = (location) => [location.name || location.address, location.country].filter(Boolean).join(', ');

/** A place in full, its address first: "Torstraße 1, Berlin, Germany". @param {Location} location */
export const placeLine = (location) => [location.address, location.name, location.country].filter(Boolean).join(', ');

/** Whether two places are the same (by address, name and country). @param {Location} a @param {Location} b */
export function samePlace(a, b) {
	const key = (/** @type {Location} */ l) => placeLine(l).trim().toLowerCase();
	return key(a) !== '' && key(a) === key(b);
}

/**
 * The places that say where they are, as numbers, for a map.
 * @param {Location[]} locations
 * @returns {{lat: number, lon: number, label: string}[]}
 */
export const locationPoints = (locations) =>
	locations.filter((l) => l.latitude && l.longitude).map((l) => ({ lat: Number(l.latitude), lon: Number(l.longitude), label: placeLine(l) }));

/** Where the house number goes before its street ("10 Downing Street"); elsewhere after ("Torstraße 1"). */
const NUMBER_FIRST = new Set(['AU', 'CA', 'FR', 'GB', 'IE', 'IL', 'IN', 'LU', 'MY', 'NZ', 'PH', 'SG', 'US', 'ZA']);

/**
 * A place Photon found (a GeoJSON feature), as records keep it: a city, region or country by
 * its name; an address, a street or a named place (an office, a building) with its address,
 * its city as its name, and its country; each with where it is.
 * @param {any} feature
 * @returns {FoundPlace | null}
 */
export function toFoundPlace(feature) {
	const p = feature?.properties || {};
	const [lon, lat] = feature?.geometry?.coordinates || [];
	if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
	const code = /^[A-Za-z]{2}$/.test(p.countrycode || '') ? String(p.countrycode).toUpperCase() : '';
	/** @type {Location} */
	const location = {};
	let label;
	if (p.type === 'house' || p.type === 'street' || p.type === 'other' || p.housenumber) {
		const street = p.type === 'street' ? p.name : p.street;
		const number = p.housenumber ? String(p.housenumber) : '';
		const line = street ? (number ? (NUMBER_FIRST.has(code) ? `${number} ${street}` : `${street} ${number}`) : String(street)) : number;
		const named = p.type === 'other' || (p.type === 'house' && p.name) ? p.name : '';
		const address = [named, line, p.postcode].filter(Boolean).join(', ');
		const city = p.city || p.locality || p.district || p.county || '';
		if (!address) return null;
		location.address = String(address);
		if (city) location.name = String(city);
		label = [address, city, p.country].filter(Boolean).join(', ');
	} else {
		if (!p.name) return null;
		const region = p.state && p.state !== p.name ? p.state : '';
		location.name = String(p.name);
		label = [p.name, region, p.country].filter(Boolean).join(', ');
	}
	if (p.country) location.country = String(p.country);
	if (code) location.countryCode = code;
	location.latitude = degrees(lat);
	location.longitude = degrees(lon);
	return { label, location };
}

/**
 * Found places, each name once: a city and its district often share it; the first, the
 * closest match, is kept.
 * @param {(FoundPlace | null)[]} found
 * @returns {FoundPlace[]}
 */
export function uniquePlaces(found) {
	const seen = new Set();
	return /** @type {FoundPlace[]} */ (found.filter((place) => place && !seen.has(place.label) && seen.add(place.label)));
}

/**
 * Places whose name or address starts as typed (cities, addresses, named places), in the
 * reader's language (OpenStreetMap, through Photon).
 * @param {string} query
 * @param {string} lang
 * @param {AbortSignal} [signal]
 * @returns {Promise<FoundPlace[]>}
 */
export async function searchPlaces(query, lang, signal) {
	const url = new URL(config.services.placeSearch);
	url.searchParams.set('q', query);
	url.searchParams.set('limit', String(config.placeSearch.limit));
	if (config.placeSearch.languages.includes(lang)) url.searchParams.set('lang', lang);
	for (const layer of config.placeSearch.layers) url.searchParams.append('layer', layer);
	const res = await fetch(url, { signal });
	if (!res.ok) return [];
	const { features = [] } = await res.json();
	return uniquePlaces(features.map(toFoundPlace));
}

/**
 * What is at a point (the nearest address or place), as records keep it; null when nothing
 * is known there.
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @param {AbortSignal} [signal]
 * @returns {Promise<FoundPlace | null>}
 */
export async function placeAt(lat, lon, lang, signal) {
	const url = new URL(config.services.placeAt);
	url.searchParams.set('lat', String(lat));
	url.searchParams.set('lon', String(lon));
	if (config.placeSearch.languages.includes(lang)) url.searchParams.set('lang', lang);
	const res = await fetch(url, { signal });
	if (!res.ok) return null;
	const { features = [] } = await res.json();
	return toFoundPlace(features[0]);
}
