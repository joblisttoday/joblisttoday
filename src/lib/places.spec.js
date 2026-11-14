import { describe, expect, it } from 'vitest';
import { locationLabel, locationPoints, placeLine, samePlace, toFoundPlace, toLocation, toLocations, uniquePlaces } from './places.js';

describe('places', () => {
	it('keeps only what a place may say, coordinates only on the Earth', () => {
		expect(toLocation({ name: ' Berlin ', country: 'Germany', countryCode: 'de', latitude: '52.52', longitude: 13.405, extra: 1 })).toEqual({
			name: 'Berlin',
			country: 'Germany',
			countryCode: 'DE',
			latitude: '52.52',
			longitude: '13.405'
		});
		expect(toLocation({ name: 'Nowhere', latitude: '200', longitude: '0' })).toEqual({ name: 'Nowhere' });
		expect(toLocation({ name: '' })).toBeNull();
		expect(toLocations([{ name: 'A' }, null, 'x', { name: 'B' }])).toEqual([{ name: 'A' }, { name: 'B' }]);
	});

	it('names a place in one line, and knows the same one', () => {
		expect(locationLabel({ name: 'Paris', country: 'France' })).toBe('Paris, France');
		expect(samePlace({ name: 'Paris', country: 'France' }, { name: 'paris', country: 'france', latitude: '1' })).toBe(true);
		expect(samePlace({}, {})).toBe(false);
	});

	it('puts on a map only the places that say where they are', () => {
		expect(locationPoints([{ name: 'A', latitude: '1', longitude: '2' }, { name: 'B' }])).toEqual([{ lat: 1, lon: 2, label: 'A' }]);
	});

	it('reads what OpenStreetMap found, each name once', () => {
		const berlin = { properties: { name: 'Berlin', state: 'Berlin', country: 'Germany', countrycode: 'DE' }, geometry: { coordinates: [13.4049539, 52.5170365] } };
		const found = toFoundPlace(berlin);
		expect(found).toEqual({ label: 'Berlin, Germany', location: { name: 'Berlin', country: 'Germany', countryCode: 'DE', latitude: '52.51704', longitude: '13.40495' } });
		expect(uniquePlaces([found, toFoundPlace(berlin), null])).toHaveLength(1);
	});

	it('reads an address or a named place: its address, its city as its name, its country', () => {
		const at = (/** @type {Record<string, any>} */ properties) => toFoundPlace({ properties, geometry: { coordinates: [2.29, 48.86] } });
		const office = at({ type: 'house', name: 'Soho House Berlin', housenumber: '1', street: 'Torstraße', postcode: '10119', city: 'Berlin', country: 'Deutschland', countrycode: 'DE' });
		expect(office).toEqual({
			label: 'Soho House Berlin, Torstraße 1, 10119, Berlin, Deutschland',
			location: { address: 'Soho House Berlin, Torstraße 1, 10119', name: 'Berlin', country: 'Deutschland', countryCode: 'DE', latitude: '48.86', longitude: '2.29' }
		});
		expect(at({ type: 'house', housenumber: '5', street: 'Avenue Anatole France', postcode: '75007', city: 'Paris', country: 'France', countrycode: 'FR' })?.location.address).toBe('5 Avenue Anatole France, 75007');
		expect(at({ type: 'street', name: 'Torstraße', city: 'Berlin', countrycode: 'DE' })?.location).toMatchObject({ address: 'Torstraße', name: 'Berlin' });
		expect(placeLine(/** @type {any} */ (office).location)).toBe('Soho House Berlin, Torstraße 1, 10119, Berlin, Deutschland');
		// Two offices in one city are two places.
		expect(samePlace({ address: 'Torstraße 1', name: 'Berlin' }, { address: 'Torstraße 2', name: 'Berlin' })).toBe(false);
	});
});
