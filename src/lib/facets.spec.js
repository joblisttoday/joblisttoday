import { describe, expect, it } from 'vitest';
import { facets, filterJobs } from './facets.js';

/** @param {Record<string, any>} j */
const job = (j) => /** @type {import('#lib/profile.js').Job} */ (/** @type {unknown} */ ({ remote: '', employment: '', locations: [], ...j }));

const jobs = [
	job({ rkey: 'a', remote: 'remote', employment: 'full-time' }),
	job({ rkey: 'b', remote: 'onsite', employment: 'full-time', locations: [{ name: 'Berlin', country: 'Germany' }] }),
	job({ rkey: 'c', remote: 'hybrid', employment: 'full-time', locations: [{ name: 'Paris', country: 'France' }, { name: 'Lyon', country: 'France' }] })
];

describe('facets', () => {
	it('offers a property only when it would leave some jobs out', () => {
		const found = facets(jobs);
		expect(found.map((f) => f.key)).toEqual(['remote', 'country', 'city']);
		expect(found[0].values).toEqual([
			{ value: 'onsite', count: 1 },
			{ value: 'hybrid', count: 1 },
			{ value: 'remote', count: 1 }
		]);
		expect(found[1].values).toEqual([
			{ value: 'France', count: 1 },
			{ value: 'Germany', count: 1 }
		]);
		expect(facets([jobs[0]])).toEqual([]);
	});

	it('matches any value within a property, every property chosen', () => {
		expect(filterJobs(jobs, {}).map((j) => j.rkey)).toEqual(['a', 'b', 'c']);
		expect(filterJobs(jobs, { remote: ['onsite', 'hybrid'] }).map((j) => j.rkey)).toEqual(['b', 'c']);
		expect(filterJobs(jobs, { remote: ['onsite', 'hybrid'], city: ['Lyon'] }).map((j) => j.rkey)).toEqual(['c']);
		expect(filterJobs(jobs, { country: [] }).map((j) => j.rkey)).toEqual(['a', 'b', 'c']);
	});
});
