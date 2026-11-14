import config from '#lib/data/config.json';

/**
 * Filters made from the jobs themselves: for each property (how, what kind, which country,
 * which city), the values its jobs have, each with how many. A property is offered only when
 * choosing by it would leave some jobs out. Within one property any chosen value matches;
 * across properties, all must.
 * @typedef {'remote' | 'employment' | 'country' | 'city'} FacetKey
 * @typedef {{value: string, count: number}} FacetValue
 * @typedef {{key: FacetKey, values: FacetValue[]}} Facet
 * @typedef {Partial<Record<FacetKey, string[]>>} Chosen
 */

/** @type {FacetKey[]} */
export const FACET_KEYS = ['remote', 'employment', 'country', 'city'];

/**
 * A job's values for one property.
 * @param {import('#lib/profile.js').Job} job
 * @param {FacetKey} key
 * @returns {string[]}
 */
export function jobValues(job, key) {
	if (key === 'remote' || key === 'employment') return job[key] ? [job[key]] : [];
	const field = key === 'country' ? 'country' : 'name';
	return [...new Set(job.locations.map((l) => (l[field] || '').trim()).filter(Boolean))];
}

/** The order a property's values are shown in: the known ones as in config, places by name. */
const ORDER = /** @type {Record<string, string[]>} */ ({ remote: config.jobPost.remote, employment: config.jobPost.employment });

/**
 * @param {import('#lib/profile.js').Job[]} jobs
 * @returns {Facet[]}
 */
export function facets(jobs) {
	return FACET_KEYS.flatMap((key) => {
		/** @type {Map<string, number>} */
		const counts = new Map();
		for (const job of jobs) for (const v of jobValues(job, key)) counts.set(v, (counts.get(v) || 0) + 1);
		const known = ORDER[key];
		const values = [...counts]
			.map(([value, count]) => ({ value, count }))
			.sort((a, b) => (known ? known.indexOf(a.value) - known.indexOf(b.value) : a.value.localeCompare(b.value)));
		// Worth offering only when a value would leave some jobs out.
		return values.some((v) => v.count < jobs.length) ? [{ key, values }] : [];
	});
}

/**
 * @param {import('#lib/profile.js').Job[]} jobs
 * @param {Chosen} chosen
 */
export function filterJobs(jobs, chosen) {
	const active = FACET_KEYS.filter((k) => chosen[k]?.length);
	return jobs.filter((job) => active.every((k) => jobValues(job, k).some((v) => chosen[k]?.includes(v))));
}
