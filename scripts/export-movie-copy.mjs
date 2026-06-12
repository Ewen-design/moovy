const key = process.env.TVDB_API_KEY;

if (!key) {
	console.error('Missing TVDB_API_KEY');
	process.exit(1);
}

const { top100Movies, recommendationMovies, supplementalMovies, genreMovieCollections } =
	await import('../src/lib/data/catalog.js');

const TITLE_ALIASES = {
	'Les Évadés': ['The Shawshank Redemption'],
	'Le Parrain': ['The Godfather'],
	'Le Parrain, 2e partie': ['The Godfather Part II', 'The Godfather: Part II'],
	'Le Parrain, 3e partie': ['The Godfather Part III', 'The Godfather: Part III'],
	'12 Hommes en colère': ['12 Angry Men'],
	'La Liste de Schindler': ["Schindler's List"],
	'Les Affranchis': ['Goodfellas'],
	'Le Silence des agneaux': ['The Silence of the Lambs'],
	Se7en: ['Seven'],
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
	Insaisissables: ['Now You See Me'],
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
	'Le Mans 66': ['Ford v Ferrari', "Le Mans '66"],
	'Le Pianiste': ['The Pianist'],
	'La Haine': ['La haine'],
	'Il était une fois dans l’Ouest': ['Once Upon a Time in the West'],
	'Bruce tout-puissant': ['Bruce Almighty'],
	Shining: ['The Shining']
};

const TITLE_OVERRIDES = {
	'La vie est belle': 604,
	Se7en: 268,
	'La Cité de Dieu': 1733,
	'Vol au-dessus d’un nid de coucou': 785,
	'Your Name': 197
};

function normalize(value) {
	return value
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, ' ')
		.trim();
}

function labels(result) {
	return [
		result?.name,
		result?.title,
		result?.extended_title,
		...(result?.aliases ?? []),
		...Object.values(result?.translations ?? {})
	]
		.filter((value) => typeof value === 'string' && value)
		.map((value) => normalize(value));
}

function pickBestMatch(results, requestedTitle) {
	const normalizedRequestedTitle = normalize(requestedTitle);

	return (
		results.find((result) => labels(result).includes(normalizedRequestedTitle)) ??
		results.find((result) =>
			labels(result).some(
				(label) =>
					label.includes(normalizedRequestedTitle) || normalizedRequestedTitle.includes(label)
			)
		) ??
		null
	);
}

function pickShortCopy(title, genres) {
	const joinedGenres = (genres ?? []).slice(0, 3).join(' · ');
	return joinedGenres ? `${joinedGenres} · ${title}` : title;
}

async function login() {
	const response = await fetch('https://api4.thetvdb.com/v4/login', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json'
		},
		body: JSON.stringify({ apikey: key })
	});

	return (await response.json()).data.token;
}

const token = await login();
const titles = [
	...new Set(
		[
			...top100Movies,
			...recommendationMovies,
			...supplementalMovies,
			...Object.values(genreMovieCollections).flat()
		].map((movie) => movie.title)
	)
];

const movieCopy = {};
const missing = [];

for (const title of titles) {
	let bestMatch;
	let movieId = TITLE_OVERRIDES[title] ?? null;

	if (!movieId) {
		for (const query of [...(TITLE_ALIASES[title] ?? []), title]) {
			const params = new URLSearchParams({
				query,
				type: 'movie',
				limit: '8'
			});
			const response = await fetch(`https://api4.thetvdb.com/v4/search?${params.toString()}`, {
				headers: {
					accept: 'application/json',
					authorization: `Bearer ${token}`
				}
			});
			const payload = await response.json();
			bestMatch = pickBestMatch(payload?.data ?? [], query);
			if (bestMatch) {
				movieId = bestMatch?.tvdb_id ?? bestMatch?.id ?? null;
				break;
			}
		}
	}

	if (!movieId) {
		missing.push({ title, reason: 'no-match' });
		continue;
	}

	const movieResponse = await fetch(
		`https://api4.thetvdb.com/v4/movies/${movieId}/extended?meta=translations&short=true`,
		{
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${token}`
			}
		}
	);
	const moviePayload = await movieResponse.json();
	const movie = moviePayload?.data;
	const overviewTranslations = movie?.translations?.overviewTranslations ?? [];
	const frenchOverview = overviewTranslations
		.find((entry) => entry?.language === 'fra')
		?.overview?.trim();
	const englishOverview =
		overviewTranslations.find((entry) => entry?.language === 'eng')?.overview?.trim() ??
		movie?.overview?.trim() ??
		'';

	if (!frenchOverview && !englishOverview) {
		missing.push({ title, reason: 'no-overview', movieId });
		continue;
	}

	movieCopy[title] = {
		summary: frenchOverview || englishOverview,
		description: pickShortCopy(title, movie?.genres?.map((genre) => genre?.name).filter(Boolean)),
		editorial: pickShortCopy(title, movie?.genres?.map((genre) => genre?.name).filter(Boolean)),
		sourceLanguage: frenchOverview ? 'fra' : 'fallback'
	};
}

console.log(
	JSON.stringify(
		{
			total: titles.length,
			resolved: Object.keys(movieCopy).length,
			missing,
			movieCopy
		},
		null,
		2
	)
);
