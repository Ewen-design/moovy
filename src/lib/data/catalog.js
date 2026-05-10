export const heroImage = '/telephone2_parfum.webp';

const top100Titles = [
	'Les Evades',
	'Le Parrain',
	'The Dark Knight',
	'Le Parrain, 2e partie',
	'12 Hommes en colere',
	'Le Seigneur des anneaux : Le Retour du roi',
	'Pulp Fiction',
	'La Liste de Schindler',
	'Inception',
	'Fight Club',
	'Forrest Gump',
	'Matrix',
	'Les Affranchis',
	'Interstellar',
	'Le Silence des agneaux',
	'Seven',
	'Parasite',
	'Whiplash',
	'Gladiator',
	'Le Voyage de Chihiro',
	'La Ligne verte',
	'Le Prestige',
	'Memento',
	'Apocalypse Now',
	'Casablanca',
	'City of God',
	'Django Unchained',
	'Oldboy',
	'Toy Story',
	'La Vie est belle',
	'Heat',
	'Reservoir Dogs',
	'La Haine',
	'In the Mood for Love',
	'Moonlight',
	'Blade Runner 2049',
	'Prisoners',
	'Arrival',
	'No Country for Old Men',
	'Mad Max: Fury Road',
	'The Social Network',
	'Her',
	'Children of Men',
	'The Grand Budapest Hotel',
	'Drive',
	'The Truman Show',
	'There Will Be Blood',
	'Le Tombeau des lucioles',
	'The Departed',
	'The Pianist',
	'Le Fabuleux Destin d Amelie Poulain',
	'Le Labyrinthe de Pan',
	'Spotlight',
	'The Banshees of Inisherin',
	'Anatomie d une chute',
	'Portrait de la jeune fille en feu',
	'The Holdovers',
	'Everything Everywhere All at Once',
	'The Zone of Interest',
	'The Fabelmans',
	'Aftersun',
	'Past Lives',
	'The Batman',
	'Dune',
	'La La Land',
	'Oppenheimer',
	'Poor Things',
	'The Florida Project',
	'Sound of Metal',
	'The Lighthouse',
	'Memories of Murder',
	'Decision to Leave',
	'Incendies',
	'Enemy',
	'Sicario',
	'Roma',
	'Marriage Story',
	'Birdman',
	'Inside Llewyn Davis',
	'Phantom Thread',
	'The Master',
	'Black Swan',
	'Lost in Translation',
	'Eternal Sunshine of the Spotless Mind',
	'Gone Girl',
	'Zodiac',
	'Shutter Island',
	'The Revenant',
	'The Iron Claw',
	'Perfect Days',
	'The Killer',
	'La Chimera',
	'A Monster Calls',
	'Minari',
	'The Worst Person in the World',
	'Portrait of a Lady on Fire',
	'The Tree of Life',
	'Burning',
	'The Handmaiden',
	'All of Us Strangers',
	'Challengers'
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
			image: heroImage
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
			image: heroImage
		})),
		maturity: ['13+', '16+', '10+'][index % 3],
		quality: 'HD'
	};
}

const genreTitleSets = {
	Action: buildGenreTitles(
		[
			'Mission',
			'Impact',
			'Fuite',
			'Derniere',
			'Zone',
			'Charge',
			'Replique',
			'Assaut',
			'Rupture',
			'Traque'
		],
		['Finale', 'Noire', 'Directe', 'Totale', 'Terminale']
	),
	Drame: buildGenreTitles(
		[
			'Saison',
			'Memoire',
			'Silence',
			'Distance',
			'Promesse',
			'Hiver',
			'Maison',
			'Visage',
			'Passage',
			'Absence'
		],
		['Lente', 'Brulee', 'Fragile', 'Claire', 'Interieure']
	),
	Thriller: buildGenreTitles(
		['Nuit', 'Signal', 'Doute', 'Trace', 'Faille', 'Enigme', 'Ligne', 'Ombre', 'Alerte', 'Chambre'],
		['Froide', 'Cassee', 'Invisible', 'Sombre', 'Interdite']
	),
	'Science-fiction': buildGenreTitles(
		[
			'Orbital',
			'Echo',
			'Planete',
			'Sillage',
			'Hyperion',
			'Colonie',
			'Vector',
			'Prisme',
			'Satellite',
			'Nebula'
		],
		['Zero', 'Quantique', 'Bleu', 'Prime', 'Infini']
	),
	Comedie: buildGenreTitles(
		[
			'Weekend',
			'Quiproquo',
			'Vacances',
			'Bistro',
			'Bande',
			'Retour',
			'Bazar',
			'Souper',
			'Detour',
			'Pari'
		],
		['Parfait', 'Rate', 'Express', 'Impro', 'Surprise']
	)
};

export const genreMovieCollections = Object.fromEntries(
	Object.entries(genreTitleSets).map(([genre, titles]) => [
		genre,
		titles.slice(0, 50).map((title, index) => makeGenreMovie(genre, title, index))
	])
);

/**
 * @param {{id: string, genres: string[], rank?: number}[]} movies
 * @param {{id: string, genres: string[]}} film
 * @param {number} count
 */
export function getSimilarMovies(movies, film, count = 6) {
	const source = movies.filter((item) => item.id !== film.id);
	const sameGenre = source.filter((item) =>
		item.genres.some((genre) => film.genres.includes(genre))
	);
	return [...sameGenre, ...source].slice(0, count);
}
