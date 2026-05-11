import { json } from '@sveltejs/kit';
import { TVDB_API_KEY } from '$env/static/private';
import { top100Movies } from '$lib/data/catalog';

const TVDB_BASE_URL = 'https://api4.thetvdb.com/v4';
const TOKEN_TTL_MS = 28 * 24 * 60 * 60 * 1000;
const DEFAULT_TITLES = [
	'Gladiator',
	'Toy Story',
	'Arrival',
	'Oldboy',
	'Heat',
	'Blade Runner 2049',
	'Moonlight',
	'The Prestige',
	'La Haine',
	'Django Unchained',
	'The Truman Show',
	'La La Land',
	'Interstellar',
	'The Dark Knight',
	'Casablanca',
	'Apocalypse Now',
	'The Social Network',
	'Mad Max: Fury Road',
	'The Grand Budapest Hotel',
	'Le Voyage de Chihiro'
];
/** @type {Record<string, string[]>} */
const TITLE_ALIASES = {
	'Les Evades': ['The Shawshank Redemption'],
	'Le Parrain': ['The Godfather'],
	'Le Parrain, 2e partie': ['The Godfather Part II', 'The Godfather: Part II'],
	'12 Hommes en colere': ['12 Angry Men'],
	'Le Seigneur des anneaux : Le Retour du roi': [
		'The Lord of the Rings: The Return of the King'
	],
	'La Liste de Schindler': ["Schindler's List"],
	'Les Affranchis': ['Goodfellas'],
	'Le Silence des agneaux': ['The Silence of the Lambs'],
	'Seven': ['Se7en'],
	'Le Voyage de Chihiro': ['Spirited Away', 'Sen to Chihiro no kamikakushi'],
	'La Ligne verte': ['The Green Mile'],
	'La Vie est belle': ['Life Is Beautiful', 'La vita è bella', 'La vita e bella'],
	'Le Fabuleux Destin d Amelie Poulain': ['Amelie', 'Amélie'],
	'Le Labyrinthe de Pan': ["Pan's Labyrinth", 'El laberinto del fauno'],
	'Anatomie d une chute': ['Anatomy of a Fall'],
	'Portrait de la jeune fille en feu': ['Portrait of a Lady on Fire'],
	'Le Tombeau des lucioles': ['Grave of the Fireflies', 'Hotaru no haka'],
	'City of God': ['Cidade de Deus'],
	Oldboy: ['Oldeuboi', '올드보이'],
	'La Haine': ['La haine'],
	'Memories of Murder': ['Salinui chueok'],
	'Decision to Leave': ['Heojil kyolshim'],
	'Burning': ['Beoning'],
	'The Handmaiden': ['Ah-ga-ssi'],
	'Perfect Days': ['Pāfekuto Deizu']
};
/** @type {Record<string, string | number>} */
const TITLE_OVERRIDES = {
	'Les Evades': 278,
	'Le Parrain': 421,
	'Le Parrain, 2e partie': 780,
	'12 Hommes en colere': 1243,
	'Le Seigneur des anneaux : Le Retour du roi': 1216,
	'La Liste de Schindler': 437,
	'Les Affranchis': 767,
	'Le Silence des agneaux': 247,
	'Le Voyage de Chihiro': 276,
	'La Ligne verte': 308,
	'La Vie est belle': 604,
	'Le Fabuleux Destin d Amelie Poulain': 809,
	'Le Labyrinthe de Pan': 1415,
	'Le Tombeau des lucioles': 1980,
	'City of God': 1733,
	Oldboy: 1200,
	'Anatomie d une chute': 345695
};

let authToken = '';
let authTokenExpiresAt = 0;
const movieCache = new Map();

/**
 * @typedef {{
 *   id?: string | number,
 *   tvdb_id?: string | number,
 *   name?: string,
 *   title?: string,
 *   extended_title?: string,
 *   aliases?: string[],
 *   translations?: Record<string, string>,
 *   overview?: string,
 *   image_url?: string
 * }} TvdbSearchResult
 * @typedef {{ id: number, title: string, overview: string, poster: string | null } | null} MovieRecord
 */

/** @param {string} title */
function normalizeTitle(title) {
	return title
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, ' ')
		.trim();
}

/** @param {string | null | undefined} poster */
function sanitizePoster(poster) {
	if (!poster || poster.includes('/images/missing/') || poster.endsWith('/missing/movie.jpg')) {
		return null;
	}

	return poster;
}

/** @param {string} title */
function buildSearchQueries(title) {
	return [...new Set([...(TITLE_ALIASES[title] ?? []), title])];
}

/** @param {URL} url */
function pickTitles(url) {
	const titles = url.searchParams.getAll('title').map((title) => title.trim()).filter(Boolean);
	if (titles.length) return [...new Set(titles)];

	const limit = Number.parseInt(url.searchParams.get('limit') ?? `${DEFAULT_TITLES.length}`, 10);
	return DEFAULT_TITLES.slice(0, Number.isFinite(limit) ? limit : DEFAULT_TITLES.length);
}

/** @param {string} title */
function canonicalTitle(title) {
	const normalized = normalizeTitle(title);
	return (
		top100Movies.find((movie) => normalizeTitle(movie.title) === normalized)?.title ??
		title
	);
}

/** @param {typeof fetch} fetch */
async function getToken(fetch) {
	if (authToken && Date.now() < authTokenExpiresAt) {
		return authToken;
	}

	const response = await fetch(`${TVDB_BASE_URL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({ apikey: TVDB_API_KEY })
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`TVDB login failed (${response.status}): ${details}`);
	}

	const payload = await response.json();
	const token = payload?.data?.token;
	if (!token) {
		throw new Error('TVDB login did not return a token.');
	}

	authToken = token;
	authTokenExpiresAt = Date.now() + TOKEN_TTL_MS;
	return authToken;
}

/**
 * @param {typeof fetch} fetch
 * @param {string} path
 */
async function tvdbFetch(fetch, path) {
	const token = await getToken(fetch);
	const response = await fetch(`${TVDB_BASE_URL}${path}`, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`TVDB request failed on ${path} (${response.status}): ${details}`);
	}

	return response.json();
}

/**
 * @param {TvdbSearchResult[]} results
 * @param {string} requestedTitle
 */
function pickBestMatch(results, requestedTitle) {
	const normalizedRequestedTitle = normalizeTitle(requestedTitle);
	/** @param {TvdbSearchResult} result */
	const getCandidateLabels = (result) => [
		result?.name,
		result?.title,
		result?.extended_title,
		...(result?.aliases ?? []),
		...Object.values(result?.translations ?? {})
	]
		.filter((value) => typeof value === 'string' && value.length > 0)
		.map((value) => normalizeTitle(/** @type {string} */ (value)));

	return (
		results.find((result) => getCandidateLabels(result).includes(normalizedRequestedTitle)) ??
		results.find((result) =>
			getCandidateLabels(result).some(
				(label) =>
					label.includes(normalizedRequestedTitle) || normalizedRequestedTitle.includes(label)
			)
		) ??
		null
	);
}

/**
 * @param {typeof fetch} fetch
 * @param {string} title
 * @returns {Promise<MovieRecord>}
 */
async function fetchMovieByTitle(fetch, title) {
	const sourceTitle = canonicalTitle(title);
	const cacheKey = normalizeTitle(sourceTitle);
	if (movieCache.has(cacheKey)) {
		return movieCache.get(cacheKey);
	}

	try {
		let bestMatch = null;
		/** @type {string | number | null} */
		let movieId = TITLE_OVERRIDES[sourceTitle] ?? null;

		if (!movieId) {
			for (const query of buildSearchQueries(sourceTitle)) {
				const params = new URLSearchParams({
					query,
					type: 'movie',
					limit: '8'
				});
				const searchPayload = await tvdbFetch(fetch, `/search?${params.toString()}`);
				bestMatch = pickBestMatch(searchPayload?.data ?? [], query);
				if (bestMatch) break;
			}

			movieId = bestMatch?.tvdb_id ?? bestMatch?.id ?? null;
		}

		if (!movieId) {
			movieCache.set(cacheKey, null);
			return null;
		}

		const moviePayload = await tvdbFetch(fetch, `/movies/${movieId}/extended?short=true`);
		const movie = moviePayload?.data;
		const record = movie
			? {
					id: movie.id,
					title: sourceTitle,
					overview: movie.overview ?? bestMatch?.overview ?? '',
					poster: sanitizePoster(movie.image ?? bestMatch?.image_url ?? null)
				}
			: null;

		movieCache.set(cacheKey, record);
		return record;
	} catch (error) {
		console.error(`TVDB lookup failed for "${title}"`, error);
		movieCache.set(cacheKey, null);
		return null;
	}
}

export async function GET({ fetch, url }) {
	if (!TVDB_API_KEY) {
		return json({ error: 'TVDB_API_KEY is missing.' }, { status: 500 });
	}

	try {
		const titles = pickTitles(url);
		const movies = (
			await Promise.all(titles.map((title) => fetchMovieByTitle(fetch, title)))
		).filter(Boolean);

		return json(movies);
	} catch (error) {
		console.error('Unable to fetch movies from TVDB', error);
		return json(
			{
				error: 'Unable to fetch movies from TVDB.'
			},
			{ status: 502 }
		);
	}
}
