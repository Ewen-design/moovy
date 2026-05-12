import { applyFallbackArtwork, applyMovieArtwork } from '$lib/data/catalog';
import { genreMovieCollections, recommendationMovies, top100Movies } from '$lib/data/catalog';

const searchableMovies = [
	...top100Movies,
	...recommendationMovies,
	...Object.values(genreMovieCollections).flat()
].filter((movie, index, list) => index === list.findIndex((item) => item.title === movie.title));

/** @param {import('./$types').LayoutServerLoadEvent} event */
export async function load(event) {
	const params = new URLSearchParams();

	for (const movie of searchableMovies) {
		params.append('title', movie.title);
	}

	try {
		const response = await event.fetch(`/api/movies?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`Poster preload failed (${response.status})`);
		}

		const posters = await response.json();
		const entries = Array.isArray(posters) ? posters : [];

		applyMovieArtwork(entries);
		applyFallbackArtwork();

		return { posters: entries };
	} catch (error) {
		console.error('Unable to preload movie posters on layout', error);
		applyFallbackArtwork();
		return { posters: [] };
	}
}
