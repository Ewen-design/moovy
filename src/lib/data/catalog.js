export const heroImage = '/telephone2_parfum.webp';

const top100Titles = [
	'Les Évadés',
	'Le Parrain',
	'Fight Club',
	'Forrest Gump',
	'Se7en',
	'The Truman Show',
	'Pulp Fiction',
	'La vie est belle',
	'Sept vies',
	'Le Parrain, 2e partie',
	'La Ligne verte',
	'La Liste de Schindler',
	'Scarface',
	'Le Prestige',
	'Titanic',
	'Les Affranchis',
	'Whiplash',
	'Drive',
	'Intouchables',
	'Invictus',
	'La Haine',
	'Ocean’s Eleven',
	'Heat',
	'Le Mans 66',
	'Lost in Translation',
	'Ocean’s Twelve',
	'Gladiator',
	'Parasite',
	'Inception',
	'Interstellar',
	'Le Silence des agneaux',
	'La Cité de Dieu',
	'12 Hommes en colère',
	'À la recherche du bonheur',
	'Ocean’s Thirteen',
	'Le Voyage de Chihiro',
	'Apocalypse Now',
	'Le Pianiste',
	'Anatomie d’une chute',
	'Vol au-dessus d’un nid de coucou',
	'The Grand Budapest Hotel',
	'The Social Network',
	'Amadeus',
	'Her',
	'Oppenheimer',
	'Eternal Sunshine of the Spotless Mind',
	'Les Infiltrés',
	'12 Years a Slave',
	'Le Grand Bleu',
	'Will Hunting',
	'Le Bon, la Brute et le Truand',
	'Le Parrain, 3e partie',
	'Au revoir là-haut',
	'Il faut sauver le soldat Ryan',
	'Inglourious Basterds',
	'Shutter Island',
	'Joker',
	'Taxi Driver',
	'Requiem for a Dream',
	'The Usual Suspects',
	'Le Fabuleux Destin d’Amélie Poulain',
	'Your Name',
	'The Wolf of Wall Street',
	'Catch Me If You Can',
	'8 Mile',
	'Casino',
	'La Cité de la peur',
	'The Expendables',
	'Seul contre tous',
	'Eiffel',
	'Sully',
	'Monuments Men',
	'Le Come Back',
	'Insaisissables',
	'La Môme',
	'Le Cercle des poètes disparus',
	'Big Fish',
	'Rocky',
	'Once Upon a Time in Hollywood',
	'V pour Vendetta',
	'Retour vers le futur',
	'American Psycho',
	'Shining',
	'Insaisissables 2',
	'Top Gun',
	'Gran Torino',
	'Il était une fois dans l’Ouest',
	'Bruce tout-puissant',
	'Didier',
	'Rain Man',
	'Into the Wild',
	'Je suis une légende',
	'La Chèvre',
	'Le Dîner de cons',
	'Legend',
	'Les Gamins',
	'The Mask',
	'Taken',
	'O’Brother',
	'Yes Man'
];

const genreCycle = [
	['Drame', 'Crime'],
	['Crime', 'Drame'],
	['Action', 'Thriller'],
	['Drame', 'Crime'],
	['Drame', 'Judiciaire'],
	['Aventure', 'Fantastique'],
	['Crime', 'Comedie noire'],
	['Drame', 'Historique'],
	['Science-fiction', 'Thriller'],
	['Drame', 'Psychologique'],
	['Drame', 'Romance'],
	['Science-fiction', 'Action'],
	['Crime', 'Drame'],
	['Science-fiction', 'Drame'],
	['Thriller', 'Crime'],
	['Thriller', 'Mystere'],
	['Thriller', 'Drame'],
	['Drame', 'Musique'],
	['Action', 'Peplum'],
	['Animation', 'Fantastique']
];

const descriptionOpeners = [
	'Un classique tendu et elegant.',
	'Une mise en scene directe et memorielle.',
	'Une experience de cinema ample et precise.',
	'Un film qui avance avec une tension constante.',
	'Une proposition visuelle forte, pensee pour durer.'
];

/**
 * @param {string} name
 * @param {number} index
 */
function actorPortrait(name, index) {
	const seed = encodeURIComponent(`${name}-${index}`);
	return `https://i.pravatar.cc/320?u=${seed}`;
}

/** @param {number} minutes */
function minutesToDuration(minutes) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

/** @param {number} index */
function formatVotes(index) {
	if (index < 12) return `${(3.2 - index * 0.11).toFixed(1).replace('.', ',')} M`;
	if (index < 40) return `${(2.1 - (index - 12) * 0.03).toFixed(1).replace('.', ',')} M`;
	return `${Math.max(0.2, 1.3 - (index - 40) * 0.01)
		.toFixed(1)
		.replace('.', ',')} M`;
}

/**
 * @param {string} title
 * @param {number} index
 */
function makeMovie(title, index) {
	const baseYear = 1954 + ((index * 5) % 69);
	const duration = 96 + ((index * 7) % 72);
	const genres = genreCycle[index % genreCycle.length];
	const opener = descriptionOpeners[index % descriptionOpeners.length];
	const cast = [
		'Jake Gyllenhaal',
		'Carey Mulligan',
		'Robert De Niro',
		'Natalie Portman',
		'Saoirse Ronan'
	].slice(0, 3);

	return {
		id: `top-${index + 1}`,
		title,
		image: /** @type {string | null} */ (null),
		backdrop: /** @type {string | null} */ (null),
		clearlogo: /** @type {string | null} */ (null),
		rank: index + 1,
		year: baseYear,
		duration: minutesToDuration(duration),
		rating: `${(9.4 - index * 0.018).toFixed(1).replace('.', ',')}`,
		votes: formatVotes(index),
		genres,
		director: [
			'Christopher Nolan',
			'Denis Villeneuve',
			'Bong Joon-ho',
			'Martin Scorsese',
			'David Fincher'
		][index % 5],
		cast,
		castMembers: cast.map((name, castIndex) => ({
			name,
			role: ['Role principal', 'Second role', 'Distribution'][castIndex],
			image: actorPortrait(name, castIndex)
		})),
		maturity: ['13+', '16+', '10+', '18+'][index % 4],
		quality: 'HD',
		description: `${opener} ${title} garde une narration lisible, une vraie tenue dramatique et un impact immediat.`,
		editorial: `${title} fait partie de ces films qu on recommande pour leur rythme, leur tenue visuelle et leur capacite a accrocher en quelques minutes.`,
		summary: `${title} suit des personnages confrontes a des choix decisiifs dans un recit tendu, clair et immediatement lisible.`
	};
}

export const top100Movies = top100Titles.slice(0, 100).map(makeMovie);

export const recommendationMovies = top100Movies.slice(18, 68).map((movie, index) => ({
	...movie,
	id: `rec-${index + 1}`,
	editorial: `${movie.title} fonctionne tres bien en recommandation grace a une promesse claire, une mise en scene forte et un ton qui reste facile a presenter sur une page editoriale.`
}));

/**
 * @param {string[]} prefixes
 * @param {string[]} suffixes
 */
function buildGenreTitles(prefixes, suffixes) {
	return prefixes.flatMap((prefix) => suffixes.map((suffix) => `${prefix} ${suffix}`));
}

/**
 * @param {string} genre
 * @param {string} title
 * @param {number} index
 */
function makeGenreMovie(genre, title, index) {
	const cast = ['Adele Exarchopoulos', 'Tahar Rahim', 'Noemie Merlant'];

	return {
		id: `${genre}-${index + 1}`,
		title,
		image: /** @type {string | null} */ (null),
		backdrop: /** @type {string | null} */ (null),
		clearlogo: /** @type {string | null} */ (null),
		year: 1982 + ((index * 3) % 43),
		duration: minutesToDuration(92 + ((index * 5) % 64)),
		rating: `${(8.9 - index * 0.016).toFixed(1).replace('.', ',')}`,
		votes:
			index < 15
				? `${(1.8 - index * 0.05).toFixed(1).replace('.', ',')} M`
				: `${980 - index * 11} k`,
		genres: [genre],
		description: `${title} condense les codes du ${genre.toLowerCase()} avec une approche nette et rapide a scanner.`,
		editorial: `${title} pousse une ambiance ${genre.toLowerCase()} tres directe, avec un vrai sens du rythme et une entree facile sur la page.`,
		summary: `${title} suit un parcours tendu et lisible, ideal pour une selection rapide par genre.`,
		director: ['Julia Ducournau', 'Celine Sciamma', 'Cedric Klapisch'][index % 3],
		cast,
		castMembers: cast.map((name, castIndex) => ({
			name,
			role: ['Role principal', 'Second role', 'Distribution'][castIndex],
			image: actorPortrait(name, castIndex)
		})),
		maturity: ['13+', '16+', '10+'][index % 3],
		quality: 'HD'
	};
}

const genreSourceMovies = [...top100Movies, ...recommendationMovies].filter(
	(movie, index, list) => index === list.findIndex((item) => item.title === movie.title)
);

const genreMembership = {
	Action: new Set([
		'Gladiator',
		'Ocean’s Eleven',
		'Ocean’s Twelve',
		'Ocean’s Thirteen',
		'Le Mans 66',
		'Inception',
		'Inglourious Basterds',
		'The Expendables',
		'Insaisissables',
		'Top Gun',
		'Taken'
	]),
	Drame: new Set([
		'Forrest Gump',
		'Parasite',
		'Whiplash',
		'La vie est belle',
		'Sept vies',
		'Intouchables',
		'Invictus',
		'À la recherche du bonheur',
		'Will Hunting',
		'12 Years a Slave',
		'Rain Man'
	]),
	Thriller: new Set([
		'Se7en',
		'Le Silence des agneaux',
		'Heat',
		'Parasite',
		'Shutter Island',
		'Joker',
		'Taxi Driver',
		'Requiem for a Dream',
		'The Usual Suspects',
		'American Psycho',
		'Taken'
	]),
	'Science-fiction': new Set([
		'Inception',
		'Interstellar',
		'The Truman Show',
		'Her',
		'Retour vers le futur',
		'Je suis une légende',
		'V pour Vendetta',
		'Your Name'
	]),
	Comedie: new Set([
		'The Grand Budapest Hotel',
		'The Truman Show',
		'Lost in Translation',
		'La Cité de la peur',
		'Le Dîner de cons',
		'Bruce tout-puissant',
		'Didier',
		'The Mask',
		'O’Brother',
		'Yes Man',
		'Le Come Back'
	])
};

/**
 * @param {string} genre
 * @param {typeof top100Movies[number]} movie
 * @param {number} index
 */
function cloneMovieForGenre(genre, movie, index) {
	return {
		...movie,
		id: `${genre}-${index + 1}`,
		genres: [genre],
		image: movie.image ?? null,
		backdrop: movie.backdrop ?? null,
		clearlogo: movie.clearlogo ?? null
	};
}

export const genreMovieCollections = Object.fromEntries(
	Object.entries(genreMembership).map(([genre, titles]) => {
		const source = genreSourceMovies.filter((movie) => titles.has(movie.title));
		const pool = source.length ? source : genreSourceMovies;
		return [
			genre,
			Array.from({ length: 50 }, (_, index) => cloneMovieForGenre(genre, pool[index % pool.length], index))
		];
	})
);

/**
 * @param {{id: string, title: string, genres: string[], rank?: number}[]} movies
 * @param {{id: string, title: string, genres: string[]}} film
 * @param {number} count
 */
export function getSimilarMovies(movies, film, count = 6) {
	const source = movies.filter((item) => item.id !== film.id);
	const sameGenre = source.filter((item) =>
		item.genres.some((genre) => film.genres.includes(genre))
	);
	return [...sameGenre, ...source].slice(0, count);
}

/** @param {string} title */
function normalizeMovieTitle(title) {
	return title
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, ' ')
		.trim();
}

const allMovieCollections = [top100Movies, recommendationMovies, ...Object.values(genreMovieCollections)];

/** @param {string} value */
function hashValue(value) {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}
	return hash;
}

/**
 * @param {string} title
 * @param {number | null | undefined} year
 * @param {string[] | null | undefined} genres
 * @param {string | null | undefined} director
 * @param {string | null | undefined} duration
 */
function buildFrenchMovieCopy(title, year, genres, director, duration) {
	const genreLabel = genres?.filter(Boolean).slice(0, 2).join(', ') || 'drame';
	const yearLabel = year ? `sorti en ${year}` : 'du cinema';
	const directorLabel = director ? ` mis en scene par ${director}` : '';
	const durationLabel = duration ? ` sur ${duration}` : '';

	return {
		summary: `${title} est un film ${genreLabel.toLowerCase()} ${yearLabel}${directorLabel}, construit autour d une narration forte et d un vrai souffle de mise en scene.`,
		description: `${title} propose une experience ${genreLabel.toLowerCase()} marquante${durationLabel}, avec des personnages memorables et une ambiance immediatement lisible.`,
		editorial: `${title} s impose comme une recommandation solide pour son ton, son rythme et la precision de son univers cinematographique.`
	};
}

/**
 * @typedef {{
 *   id: number,
 *   title: string,
 *   overview: string,
 *   poster: string | null,
 *   backdrop?: string | null,
 *   clearlogo?: string | null,
 *   year?: number | null,
 *   duration?: string | null,
 *   genres?: string[] | null,
 *   director?: string | null,
 *   cast?: string[] | null,
 *   castMembers?: { name: string, role: string, image: string }[] | null
 * }} PosterEntry
 */

/**
 * @param {PosterEntry[]} entries
 */
export function applyMovieArtwork(entries) {
	/** @type {Map<string, PosterEntry>} */
	const byTitle = new Map(
		entries
			.map((entry) => /** @type {[string, PosterEntry]} */ ([normalizeMovieTitle(entry.title), entry]))
			.filter(([, entry]) => Boolean(entry?.poster))
	);

	for (const collection of allMovieCollections) {
		for (const movie of collection) {
			const match = byTitle.get(normalizeMovieTitle(movie.title));
			if (!match?.poster) continue;
			movie.image = match.poster;
			movie.backdrop = match.backdrop ?? null;
			movie.clearlogo = match.clearlogo ?? null;
			movie.year = match.year ?? movie.year;
			movie.duration = match.duration ?? movie.duration;
			movie.genres = match.genres?.length ? match.genres : movie.genres;
			movie.director = match.director ?? movie.director;
			movie.cast = match.cast?.length ? match.cast : movie.cast;
			movie.castMembers = match.castMembers?.length ? match.castMembers : movie.castMembers;
			const frenchCopy = buildFrenchMovieCopy(
				movie.title,
				match.year ?? movie.year,
				match.genres?.length ? match.genres : movie.genres,
				match.director ?? movie.director,
				match.duration ?? movie.duration
			);
			movie.summary = frenchCopy.summary;
			movie.description = frenchCopy.description;
			movie.editorial = frenchCopy.editorial;
		}
	}
}

export function applyFallbackArtwork() {
	/** @type {Map<string, string[]>} */
	const postersByGenre = new Map();
	/** @type {string[]} */
	const globalPosters = [];

	for (const collection of allMovieCollections) {
		for (const movie of collection) {
			if (!movie.image) continue;

			globalPosters.push(movie.image);
			for (const genre of movie.genres) {
				const posters = postersByGenre.get(genre) ?? [];
				posters.push(movie.image);
				postersByGenre.set(genre, posters);
			}
		}
	}

	if (!globalPosters.length) return;

	for (const collection of allMovieCollections) {
		for (const movie of collection) {
			if (movie.image) continue;

			const genrePool = movie.genres.flatMap((genre) => postersByGenre.get(genre) ?? []);
			const pool = genrePool.length ? genrePool : globalPosters;
			movie.image = pool[hashValue(`${movie.title}-${movie.genres.join('-')}`) % pool.length] ?? null;
		}
	}
}
