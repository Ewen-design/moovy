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

const recommendationTitles = [
	'Les Évadés',
	'Le Parrain',
	'Fight Club',
	'Forrest Gump',
	'Pulp Fiction',
	'Insaisissables',
	'La vie est belle',
	'Sept vies',
	'Le Prestige',
	'Drive',
	'Invictus',
	'Ocean’s Eleven',
	'Le Mans 66',
	'Lost in Translation',
	'À la recherche du bonheur',
	'Vol au-dessus d’un nid de coucou',
	'Les Infiltrés',
	'Shutter Island',
	'Sully',
	'Le Come Back',
	'Bruce tout-puissant',
	'Rain Man',
	'Into the Wild',
	'Legend',
	'Les Gamins',
	'O’Brother',
	'Good Morning, Vietnam',
	'Il était temps',
	'Little Miss Sunshine',
	'OSS 117 : Le Caire, nid d’espions',
	'The Blues Brothers',
	'Papy fait de la résistance',
	'Les Choristes',
	'Johnny English',
	'Evan tout-puissant',
	'Coach Carter',
	'Fighter',
	'La vie rêvée de Walter Mitty',
	'Le Murder Club du jeudi',
	'Le Nouveau Stagiaire',
	'Rasta Rockett',
	'Un fauteuil pour deux',
	'Le Prénom',
	'Big Fish',
	'Once Upon a Time in Hollywood',
	'The Grand Budapest Hotel',
	'Gran Torino',
	'Le Cercle des poètes disparus',
	'Moonlight',
	'Spotlight'
];

const supplementalMovieSpecs = [
	{ title: '2001 : l’Odyssée de l’espace', year: 1968, duration: 149, genres: ['Science-fiction', 'Drame'] },
	{ title: 'Matrix', year: 1999, duration: 136, genres: ['Science-fiction', 'Action'] },
	{ title: 'Orange mécanique', year: 1971, duration: 136, genres: ['Science-fiction', 'Crime'] },
	{ title: 'Unstoppable', year: 2010, duration: 98, genres: ['Action', 'Thriller'] },
	{ title: 'Alliés', year: 2016, duration: 124, genres: ['Drame', 'Romance'] },
	{ title: 'Jason Bourne', year: 2016, duration: 123, genres: ['Action', 'Thriller'] },
	{ title: 'Good Morning, Vietnam', year: 1987, duration: 121, genres: ['Comedie', 'Drame'] },
	{ title: 'Tu ne tueras point', year: 2016, duration: 139, genres: ['Drame', 'Historique'] },
	{ title: 'F1', year: 2025, duration: 150, genres: ['Action', 'Drame'] },
	{ title: 'Seul sur Mars', year: 2015, duration: 144, genres: ['Science-fiction', 'Aventure'] },
	{ title: 'The Dark Knight', year: 2008, duration: 152, genres: ['Action', 'Crime'] },
	{ title: 'Blade Runner 2049', year: 2017, duration: 164, genres: ['Science-fiction', 'Drame'] },
	{ title: 'No Country for Old Men', year: 2007, duration: 122, genres: ['Thriller', 'Crime'] },
	{ title: 'Memento', year: 2000, duration: 113, genres: ['Thriller', 'Mystere'] },
	{ title: 'Léon', year: 1994, duration: 110, genres: ['Action', 'Drame'] },
	{ title: 'Django Unchained', year: 2012, duration: 165, genres: ['Drame', 'Action'] },
	{ title: 'John Wick', year: 2014, duration: 101, genres: ['Action', 'Thriller'] },
	{ title: 'Fury', year: 2014, duration: 135, genres: ['Action', 'Drame'] },
	{ title: 'Jurassic Park', year: 1993, duration: 127, genres: ['Aventure', 'Science-fiction'] },
	{ title: '300', year: 2006, duration: 117, genres: ['Action', 'Historique'] },
	{ title: 'Logan', year: 2017, duration: 137, genres: ['Action', 'Drame'] },
	{ title: 'Die Hard', year: 1988, duration: 132, genres: ['Action', 'Thriller'] },
	{ title: 'Skyfall', year: 2012, duration: 143, genres: ['Action', 'Thriller'] },
	{ title: 'Training Day', year: 2001, duration: 122, genres: ['Thriller', 'Crime'] },
	{ title: 'Edge of Tomorrow', year: 2014, duration: 113, genres: ['Science-fiction', 'Action'] },
	{ title: 'Avatar', year: 2009, duration: 162, genres: ['Science-fiction', 'Aventure'] },
	{ title: 'Alien', year: 1979, duration: 117, genres: ['Science-fiction', 'Thriller'] },
	{ title: 'La La Land', year: 2016, duration: 128, genres: ['Romance', 'Drame'] },
	{ title: 'Casablanca', year: 1942, duration: 102, genres: ['Romance', 'Drame'] },
	{ title: 'Il était temps', year: 2013, duration: 123, genres: ['Romance', 'Comedie'] },
	{ title: 'Pretty Woman', year: 1990, duration: 119, genres: ['Romance', 'Comedie'] },
	{ title: 'Notting Hill', year: 1999, duration: 124, genres: ['Romance', 'Comedie'] },
	{ title: 'Love Actually', year: 2003, duration: 135, genres: ['Romance', 'Comedie'] },
	{ title: 'The Holiday', year: 2006, duration: 136, genres: ['Romance', 'Comedie'] },
	{ title: 'The Curious Case of Benjamin Button', year: 2008, duration: 166, genres: ['Drame', 'Romance'] },
	{ title: 'Dumb and Dumber', year: 1994, duration: 107, genres: ['Comedie'] },
	{ title: 'Little Miss Sunshine', year: 2006, duration: 101, genres: ['Comedie', 'Drame'] },
	{ title: 'Les Visiteurs', year: 1993, duration: 107, genres: ['Comedie', 'Fantastique'] },
	{ title: 'OSS 117 : Le Caire, nid d’espions', year: 2006, duration: 99, genres: ['Comedie'] },
	{ title: 'OSS 117 : Rio ne répond plus', year: 2009, duration: 100, genres: ['Comedie'] },
	{ title: 'Le Sens de la fête', year: 2017, duration: 117, genres: ['Comedie'] },
	{ title: 'Bienvenue chez les Ch’tis', year: 2008, duration: 106, genres: ['Comedie'] },
	{ title: 'Les Bronzés font du ski', year: 1979, duration: 89, genres: ['Comedie'] },
	{ title: 'The Blues Brothers', year: 1980, duration: 133, genres: ['Comedie', 'Action'] },
	{ title: 'Le Prénom', year: 2012, duration: 109, genres: ['Comedie'] },
	{ title: 'Ace Ventura', year: 1994, duration: 86, genres: ['Comedie'] },
	{ title: 'Ready Player One', year: 2018, duration: 140, genres: ['Science-fiction', 'Action'] },
	{ title: 'Gravity', year: 2013, duration: 91, genres: ['Science-fiction', 'Thriller'] },
	{ title: 'Pacific Rim', year: 2013, duration: 131, genres: ['Science-fiction', 'Action'] },
	{ title: 'La Grande Vadrouille', year: 1966, duration: 132, genres: ['Comedie'] },
	{ title: 'Fantômas', year: 1964, duration: 104, genres: ['Comedie', 'Crime'] },
	{ title: 'Le Gendarme de Saint-Tropez', year: 1964, duration: 102, genres: ['Comedie'] },
	{ title: 'Les Aventures de Rabbi Jacob', year: 1973, duration: 100, genres: ['Comedie'] },
	{ title: 'L’Aile ou la Cuisse', year: 1976, duration: 104, genres: ['Comedie'] },
	{ title: 'La Soupe aux choux', year: 1981, duration: 98, genres: ['Comedie', 'Science-fiction'] },
	{ title: 'Les Tontons flingueurs', year: 1963, duration: 105, genres: ['Comedie', 'Crime'] },
	{ title: 'Papy fait de la résistance', year: 1983, duration: 102, genres: ['Comedie'] },
	{ title: 'Les Sous-doués', year: 1980, duration: 92, genres: ['Comedie'] },
	{ title: 'Le Père Noël est une ordure', year: 1982, duration: 88, genres: ['Comedie'] },
	{ title: 'La Vérité si je mens !', year: 1997, duration: 100, genres: ['Comedie'] },
	{ title: 'Les Choristes', year: 2004, duration: 97, genres: ['Drame'] },
	{ title: 'La Tour Montparnasse infernale', year: 2001, duration: 92, genres: ['Comedie'] },
	{ title: 'Qu’est-ce qu’on a fait au Bon Dieu ?', year: 2014, duration: 97, genres: ['Comedie'] },
	{ title: 'Johnny English', year: 2003, duration: 88, genres: ['Comedie', 'Action'] },
	{ title: 'Bridget Jones’s Diary', year: 2001, duration: 97, genres: ['Romance', 'Comedie'] },
	{ title: 'American Gangster', year: 2007, duration: 157, genres: ['Crime', 'Drame'] },
	{ title: 'Bad Boys', year: 1995, duration: 119, genres: ['Action', 'Comedie'] },
	{ title: 'Evan tout-puissant', year: 2007, duration: 96, genres: ['Comedie'] },
	{ title: 'Casino Royale', year: 2006, duration: 144, genres: ['Action', 'Thriller'] },
	{ title: 'Coach Carter', year: 2005, duration: 136, genres: ['Drame'] },
	{ title: 'Fighter', year: 2010, duration: 116, genres: ['Drame'] },
	{ title: 'Kingsman', year: 2014, duration: 129, genres: ['Action', 'Comedie'] },
	{ title: 'La vie rêvée de Walter Mitty', year: 2013, duration: 114, genres: ['Comedie', 'Aventure'] },
	{ title: 'L’avare', year: 1980, duration: 125, genres: ['Comedie'] },
	{ title: 'Le Murder Club du jeudi', year: 2025, duration: 118, genres: ['Comedie', 'Crime'] },
	{ title: 'Le Nouveau Stagiaire', year: 2015, duration: 121, genres: ['Comedie'] },
	{ title: 'Marty Supreme', year: 2025, duration: 130, genres: ['Drame', 'Comedie'] },
	{ title: 'Rasta Rockett', year: 1993, duration: 98, genres: ['Comedie'] },
	{ title: 'Un fauteuil pour deux', year: 1983, duration: 116, genres: ['Comedie'] },
	{ title: 'Moonlight', year: 2016, duration: 111, genres: ['Drame'] },
	{ title: 'Spotlight', year: 2015, duration: 129, genres: ['Drame', 'Historique'] }
];

function makeSupplementalMovie(spec, index) {
	const cast = ['Emma Stone', 'Ryan Gosling', 'Denzel Washington', 'Marion Cotillard', 'Matt Damon'];
	return {
		id: `extra-${index + 1}`,
		title: spec.title,
		image: /** @type {string | null} */ (null),
		backdrop: /** @type {string | null} */ (null),
		clearlogo: /** @type {string | null} */ (null),
		rank: /** @type {number | undefined} */ (undefined),
		year: spec.year,
		duration: minutesToDuration(spec.duration),
		rating: `${(8.6 - (index % 12) * 0.09).toFixed(1).replace('.', ',')}`,
		votes: index < 24 ? `${(2.4 - index * 0.05).toFixed(1).replace('.', ',')} M` : `${Math.max(120, 920 - index * 9)} k`,
		genres: spec.genres,
		director: ['Ridley Scott', 'Christopher Nolan', 'Steven Spielberg', 'Nancy Meyers', 'Tony Scott'][index % 5],
		cast: cast.slice(0, 3),
		castMembers: cast.slice(0, 3).map((name, castIndex) => ({
			name,
			role: ['Role principal', 'Second role', 'Distribution'][castIndex],
			image: actorPortrait(name, castIndex)
		})),
		maturity: ['10+', '13+', '16+'][index % 3],
		quality: 'HD',
		description: `${spec.title} propose une experience ${spec.genres.join(', ').toLowerCase()} immediate, avec une lecture simple et un vrai potentiel de recommandation.`,
		editorial: `${spec.title} enrichit le catalogue avec un ton clair, identifiable et facile a activer selon un besoin de selection.`,
		summary: `${spec.title} reste une option solide pour completer les selections editoriales avec un profil net et memorisable.`
	};
}

export const supplementalMovies = supplementalMovieSpecs.map(makeSupplementalMovie);
export const tonightMoviePool = [...top100Movies, ...supplementalMovies];

const recommendationSourceMovies = [...top100Movies, ...supplementalMovies].filter(
	(movie, index, list) => index === list.findIndex((item) => item.title === movie.title)
);

export const recommendationMovies = recommendationTitles
	.map((title) => recommendationSourceMovies.find((movie) => movie.title === title))
	.filter(Boolean)
	.map((movie, index) => ({
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

const genreSourceMovies = [...top100Movies, ...recommendationMovies, ...supplementalMovies].filter(
	(movie, index, list) => index === list.findIndex((item) => item.title === movie.title)
);

const genreCurations = {
	Action: {
		include: [
			'The Dark Knight',
			'John Wick',
			'Fury',
			'Skyfall',
			'Casino Royale',
			'Kingsman',
			'Die Hard',
			'Jason Bourne',
			'Edge of Tomorrow',
			'Logan',
			'300',
			'Bad Boys',
			'Pacific Rim',
			'Unstoppable',
			'Avatar',
			'F1'
		],
		exclude: ['The Wolf of Wall Street', 'Amadeus', 'Intouchables', 'La Liste de Schindler']
	},
	Drame: {
		include: [
			'No Country for Old Men',
			'The Curious Case of Benjamin Button',
			'American Gangster',
			'Fighter',
			'Casablanca',
			'La La Land',
			'Léon',
			'Fury',
			'Good Morning, Vietnam',
			'Pretty Woman',
			'Notting Hill',
			'Love Actually',
			'The Holiday',
			'Le Nouveau Stagiaire',
			'Will Hunting',
			'Rain Man'
		],
		exclude: [
			'Ocean’s Eleven',
			'Le Mans 66',
			'Lost in Translation',
			'The Social Network',
			'Your Name',
			'Le Fabuleux Destin d’Amélie Poulain',
			'The Expendables',
			'Le Come Back',
			'Insaisissables',
			'Retour vers le futur',
			'Insaisissables 2',
			'Bruce tout-puissant',
			'Alliés',
			'Tu ne tueras point',
			'Django Unchained',
			'Les Choristes',
			'Coach Carter',
			'La La Land',
			'The Holiday',
			'Notting Hill',
			'Love Actually',
			'Pretty Woman',
			'Le Nouveau Stagiaire',
			'Top Gun',
			'The Mask',
			'Le Dîner de cons',
			'La Chèvre',
			'Blade Runner 2049',
			'F1',
			'2001 : l’Odyssée de l’espace'
		]
	},
	Thriller: {
		include: [
			'No Country for Old Men',
			'Memento',
			'Training Day',
			'Casino Royale',
			'Skyfall',
			'Jason Bourne',
			'Unstoppable',
			'Die Hard',
			'Alien',
			'Gravity',
			'John Wick',
			'Blade Runner 2049',
			'Orange mécanique'
		],
		exclude: [
			'Parasite',
			'Joker',
			'Taxi Driver',
			'Requiem for a Dream',
			'The Usual Suspects',
			'Taken',
			'American Psycho',
			'Shutter Island',
			'Heat',
			'Le Silence des agneaux',
			'Se7en',
			'Die Hard',
			'Skyfall',
			'John Wick',
			'Blade Runner 2049',
			'Titanic',
			'Amadeus',
			'Le Voyage de Chihiro',
			'Le Grand Bleu',
			'Seul contre tous',
			'La Môme',
			'Le Cercle des poètes disparus',
			'Big Fish',
			'Didier',
			'Les Gamins',
			'The Mask'
		]
	},
	'Science-fiction': {
		include: [
			'2001 : l’Odyssée de l’espace',
			'Matrix',
			'Orange mécanique',
			'Seul sur Mars',
			'Blade Runner 2049',
			'Jurassic Park',
			'Edge of Tomorrow',
			'Avatar',
			'Alien',
			'Ready Player One',
			'Gravity',
			'Pacific Rim',
			'La Soupe aux choux'
		],
		exclude: [
			'Le Dîner de cons',
			'Sept vies',
			'La Liste de Schindler',
			'Le Prestige',
			'La Cité de Dieu',
			'À la recherche du bonheur',
			'Le Grand Bleu',
			'Le Parrain, 3e partie',
			'Il faut sauver le soldat Ryan',
			'Insaisissables',
			'Monuments Men',
			'Seul contre tous',
			'Didier'
		]
	},
	Comedie: {
		include: [
			'Dumb and Dumber',
			'Little Miss Sunshine',
			'Les Visiteurs',
			'OSS 117 : Le Caire, nid d’espions',
			'OSS 117 : Rio ne répond plus',
			'Le Sens de la fête',
			'Bienvenue chez les Ch’tis',
			'Les Bronzés font du ski',
			'The Blues Brothers',
			'Le Prénom',
			'Ace Ventura',
			'La Grande Vadrouille',
			'Fantômas',
			'Le Gendarme de Saint-Tropez',
			'Les Aventures de Rabbi Jacob',
			'L’Aile ou la Cuisse',
			'Les Tontons flingueurs',
			'Papy fait de la résistance',
			'Les Sous-doués',
			'Le Père Noël est une ordure',
			'La Vérité si je mens !',
			'La Tour Montparnasse infernale',
			'Qu’est-ce qu’on a fait au Bon Dieu ?',
			'Johnny English',
			'Bridget Jones’s Diary',
			'Evan tout-puissant',
			'Le Nouveau Stagiaire',
			'Rasta Rockett',
			'Un fauteuil pour deux',
			'The Truman Show',
			'Kingsman'
		],
		exclude: ['Marty Supreme', 'L’avare']
	},
	Romance: {
		include: [
			'Il était temps',
			'Pretty Woman',
			'Notting Hill',
			'Love Actually',
			'The Holiday',
			'La La Land',
			'Casablanca',
			'The Curious Case of Benjamin Button',
			'Bridget Jones’s Diary',
			'Alliés'
		],
		exclude: [
			'Alliés',
			'La Ligne verte',
			'Le Silence des agneaux',
			'Le Bon, la Brute et le Truand',
			'Sully'
		]
	}
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
	['Action', 'Drame', 'Thriller', 'Science-fiction', 'Comedie', 'Romance'].map((genre) => {
		const curation = genreCurations[genre] ?? { include: [], exclude: [] };
		const excludedTitles = new Set(curation.exclude);
		const source = genreSourceMovies.filter(
			(movie) => movie.genres.includes(genre) && !excludedTitles.has(movie.title)
		);
		const preferredTitles = new Set(curation.include);
		const preferred = genreSourceMovies.filter(
			(movie) => preferredTitles.has(movie.title) && !excludedTitles.has(movie.title)
		);
		const fallback = source.filter((movie) => !preferredTitles.has(movie.title));
		const pool = [...preferred, ...fallback].filter(
			(movie, index, list) => index === list.findIndex((item) => item.title === movie.title)
		);
		return [
			genre,
			pool.slice(0, 50).map((movie, index) => cloneMovieForGenre(genre, movie, index))
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

const allMovieCollections = [
	top100Movies,
	recommendationMovies,
	supplementalMovies,
	tonightMoviePool,
	...Object.values(genreMovieCollections)
];

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
