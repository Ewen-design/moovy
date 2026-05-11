const key = process.env.TVDB_API_KEY;

if (!key) {
	console.error('Missing TVDB_API_KEY');
	process.exit(1);
}

const { top100Movies } = await import('../src/lib/data/catalog.js');

const aliases = {
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
	Seven: ['Se7en'],
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
	'Perfect Days': ['Pafekuto Deizu', 'Pāfekuto Deizu']
};

const overrides = {
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

function pick(results, requested) {
	const normalized = normalize(requested);
	return (
		results.find((result) => labels(result).includes(normalized)) ??
		results.find((result) =>
			labels(result).some((label) => label.includes(normalized) || normalized.includes(label))
		) ??
		null
	);
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
const bad = [];

for (const movie of top100Movies) {
	let found = null;
	let movieId = overrides[movie.title] ?? null;

	if (!movieId) {
		for (const query of [...(aliases[movie.title] ?? []), movie.title]) {
			const response = await fetch(
				`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(query)}&type=movie&limit=8`,
				{
					headers: {
						accept: 'application/json',
						authorization: `Bearer ${token}`
					}
				}
			);
			const payload = await response.json();
			found = pick(payload.data ?? [], query);
			if (found) {
				movieId = found.tvdb_id ?? found.id;
				break;
			}
		}
	}

	if (!movieId) {
		bad.push({ title: movie.title, status: 'no-match' });
		continue;
	}

	const response = await fetch(`https://api4.thetvdb.com/v4/movies/${movieId}/extended?short=true`, {
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${token}`
		}
	});
	const payload = await response.json();
	const name = payload?.data?.name ?? found?.name ?? null;
	const acceptable = [movie.title, ...(aliases[movie.title] ?? [])].map(normalize);

	if (!name || !acceptable.includes(normalize(name))) {
		bad.push({ title: movie.title, matched: name, year: payload?.data?.year ?? found?.year ?? null, id: movieId });
	}
}

console.log(JSON.stringify(bad, null, 2));
