import { json } from '@sveltejs/kit';
import { TVDB_API_KEY } from '$env/static/private';
import { heroImage, top100Movies } from '$lib/data/catalog';

const TVDB_BASE_URL = 'https://api4.thetvdb.com/v4';
const TOKEN_TTL_MS = 28 * 24 * 60 * 60 * 1000;
const DEFAULT_TITLES = [
	'Les Évadés',
	'Le Parrain',
	'Fight Club',
	'Forrest Gump',
	'Se7en',
	'Heat',
	'Interstellar',
	'The Prestige',
	'La Haine',
	'The Truman Show',
	'Apocalypse Now',
	'The Social Network',
	'The Grand Budapest Hotel',
	'Le Voyage de Chihiro'
];
/** @type {Record<string, string[]>} */
const TITLE_ALIASES = {
	'Les Évadés': ['The Shawshank Redemption'],
	'Le Parrain': ['The Godfather'],
	'Le Parrain, 2e partie': ['The Godfather Part II', 'The Godfather: Part II'],
	'Le Parrain, 3e partie': ['The Godfather Part III', 'The Godfather: Part III'],
	'12 Hommes en colère': ['12 Angry Men'],
	'La Liste de Schindler': ["Schindler's List"],
	'Les Affranchis': ['Goodfellas'],
	'Le Silence des agneaux': ['The Silence of the Lambs'],
	'Se7en': ['Seven'],
	'Le Voyage de Chihiro': ['Spirited Away', 'Sen to Chihiro no kamikakushi'],
	'La Ligne verte': ['The Green Mile'],
	'La vie est belle': ['La vita è bella', 'La vita e bella', 'Life Is Beautiful'],
	'Sept vies': ['Seven Pounds'],
	'La Cité de Dieu': ['City of God', 'Cidade de Deus'],
	'À la recherche du bonheur': ['The Pursuit of Happyness'],
	'Anatomie d’une chute': ['Anatomy of a Fall'],
	'Vol au-dessus d’un nid de coucou': ["One Flew Over the Cuckoo's Nest"],
	'Les Infiltrés': ['The Departed'],
	'Le Grand Bleu': ['The Big Blue', 'Le Grand Bleu'],
	'Will Hunting': ['Good Will Hunting'],
	'Le Bon, la Brute et le Truand': ['The Good, the Bad and the Ugly'],
	'Au revoir là-haut': ['See You Up There', 'Au revoir là-haut'],
	'Il faut sauver le soldat Ryan': ['Saving Private Ryan'],
	'Le Fabuleux Destin d’Amélie Poulain': ['Amelie', 'Amélie'],
	'Your Name': ['Your Name.', 'Kimi no Na wa.'],
	'Seul contre tous': ['Concussion'],
	'Monuments Men': ['The Monuments Men'],
	'Le Come Back': ['Music and Lyrics'],
	'Insaisissables': ['Now You See Me'],
	'Insaisissables 2': ['Now You See Me 2'],
	'La Môme': ['La Vie en Rose', 'La Mome'],
	'Le Cercle des poètes disparus': ['Dead Poets Society'],
	'V pour Vendetta': ['V for Vendetta'],
	'Retour vers le futur': ['Back to the Future'],
	'Je suis une légende': ['I Am Legend'],
	'La Chèvre': ['La Chevre'],
	'Le Dîner de cons': ['The Dinner Game', 'Le Diner de cons'],
	'O’Brother': ['O Brother, Where Art Thou?'],
	'Ocean’s Eleven': ["Ocean's Eleven"],
	'Ocean’s Twelve': ["Ocean's Twelve"],
	'Ocean’s Thirteen': ["Ocean's Thirteen"],
	'Le Mans 66': ["Ford v Ferrari", "Le Mans '66"],
	'Le Pianiste': ['The Pianist'],
	'La Haine': ['La haine'],
	'Il était une fois dans l’Ouest': ['Once Upon a Time in the West'],
	'Bruce tout-puissant': ['Bruce Almighty'],
	'Shining': ['The Shining']
};
/** @type {Record<string, string | number>} */
const TITLE_OVERRIDES = {
	'La vie est belle': 604,
	Se7en: 268,
	'La Cité de Dieu': 1733,
	'Vol au-dessus d’un nid de coucou': 785,
	'Your Name': 197
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
 * @typedef {{
 *   id: number,
 *   title: string,
 *   overview: string,
 *   poster: string | null,
 *   backdrop: string | null,
 *   clearlogo: string | null,
 *   year: number | null,
 *   duration: string | null,
 *   genres: string[],
 *   director: string | null,
 *   cast: string[],
 *   castMembers: { name: string, role: string, image: string }[]
 * } | null} MovieRecord
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

/** @param {number | null | undefined} runtime */
function formatRuntime(runtime) {
	if (!runtime || !Number.isFinite(runtime)) return null;
	const hours = Math.floor(runtime / 60);
	const minutes = runtime % 60;
	return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

/** @param {string | null | undefined} genre */
function translateGenre(genre) {
	/** @type {Record<string, string>} */
	const dictionary = {
		Action: 'Action',
		Adventure: 'Aventure',
		Animation: 'Animation',
		Comedy: 'Comedie',
		Crime: 'Crime',
		Drama: 'Drame',
		Family: 'Famille',
		Fantasy: 'Fantastique',
		History: 'Historique',
		Horror: 'Horreur',
		Music: 'Musique',
		Mystery: 'Mystere',
		Romance: 'Romance',
		'Sci-Fi': 'Science-fiction',
		'Science Fiction': 'Science-fiction',
		Thriller: 'Thriller',
		War: 'Guerre',
		Western: 'Western'
	};

	return dictionary[genre ?? ''] ?? genre ?? 'Drame';
}

/**
 * @param {{ type?: number, image?: string | null, width?: number, height?: number, language?: string | null }[]} artworks
 * @param {number} type
 */
function pickArtwork(artworks, type) {
	const candidates = artworks
		.filter((artwork) => artwork?.type === type)
		.map((artwork) => ({
			image: sanitizePoster(artwork.image ?? null),
			language: artwork.language ?? null
		}))
		.filter((artwork) => Boolean(artwork.image));

	if (!candidates.length) return null;
	if (type === 14) {
		return (
			candidates.find((artwork) => artwork.language === 'fra')?.image ??
			candidates.find((artwork) => artwork.language === 'eng')?.image ??
			candidates[0]?.image ??
			null
		);
	}

	return candidates[0]?.image ?? null;
}

/**
 * @param {any[]} characters
 * @param {number} type
 * @param {string} peopleType
 */
function pickPeople(characters, type, peopleType) {
	return (characters ?? [])
		.filter((character) => character?.type === type || character?.peopleType === peopleType)
		.sort((left, right) => (left?.sort ?? 999) - (right?.sort ?? 999));
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

		const moviePayload = await tvdbFetch(fetch, `/movies/${movieId}/extended`);
		const movie = moviePayload?.data;
		const artworks = movie?.artworks ?? [];
		const characters = movie?.characters ?? [];
		const castMembers = pickPeople(characters, 3, 'Actor')
			.slice(0, 6)
			.map((member) => ({
				name: member?.personName ?? member?.name ?? 'Acteur',
				role: member?.name ?? 'Distribution',
				image: sanitizePoster(member?.personImgURL ?? member?.image ?? null) ?? heroImage
			}));
		const directors = pickPeople(characters, 1, 'Director');
		const record = movie
			? {
					id: movie.id,
					title: sourceTitle,
					overview: movie.overview ?? bestMatch?.overview ?? '',
					poster:
						pickArtwork(artworks, 14) ??
						sanitizePoster(movie.image ?? bestMatch?.image_url ?? null),
					backdrop: pickArtwork(artworks, 15),
					clearlogo: pickArtwork(artworks, 25),
					year: Number.parseInt(movie.year ?? '', 10) || null,
					duration: formatRuntime(movie.runtime),
					genres: (movie.genres ?? [])
						.map((/** @type {{ name?: string }} */ genre) => translateGenre(genre?.name))
						.filter(Boolean),
					director: directors.at(-1)?.personName ?? null,
					cast: castMembers.slice(0, 3).map((member) => member.name),
					castMembers
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

/**
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<R>} mapper
 */
async function mapWithLimit(items, limit, mapper) {
	/** @type {R[]} */
	const results = [];
	let currentIndex = 0;

	async function worker() {
		while (currentIndex < items.length) {
			const index = currentIndex;
			currentIndex += 1;
			results[index] = await mapper(items[index]);
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return results;
}

export async function GET({ fetch, url }) {
	if (!TVDB_API_KEY) {
		return json({ error: 'TVDB_API_KEY is missing.' }, { status: 500 });
	}

	try {
		const titles = pickTitles(url);
		const movies = (await mapWithLimit(titles, 4, (title) => fetchMovieByTitle(fetch, title))).filter(
			Boolean
		);

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
