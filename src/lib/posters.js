import { applyFallbackArtwork, applyMovieArtwork } from '$lib/data/catalog';
import { posterVersion } from '$lib/poster-state';

const requestedTitles = new Set();
let seedLoaded = false;

/** @param {string} title */
function normalizeTitle(title) {
	return title
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, ' ')
		.trim();
}

/**
 * @param {{ title: string }[]} movies
 */
export async function hydrateMoviePosters(movies) {
	const titles = [...new Set(movies.map((movie) => movie?.title?.trim()).filter(Boolean))];
	const missingTitles = titles.filter((title) => !requestedTitles.has(normalizeTitle(title)));

	if (!missingTitles.length) return;

	for (const title of missingTitles) {
		requestedTitles.add(normalizeTitle(title));
	}

	const params = new URLSearchParams();
	for (const title of missingTitles) {
		params.append('title', title);
	}

	try {
		const response = await fetch(`/api/movies?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`Poster request failed (${response.status})`);
		}

		const payload = await response.json();
		applyMovieArtwork(Array.isArray(payload) ? payload : []);
		applyFallbackArtwork();
		posterVersion.update((value) => value + 1);
	} catch (error) {
		console.error('Unable to hydrate movie posters', error);
		for (const title of missingTitles) {
			requestedTitles.delete(normalizeTitle(title));
		}
		applyFallbackArtwork();
	}
}

export async function seedPosterLibrary() {
	if (seedLoaded) return;
	seedLoaded = true;

	try {
		const response = await fetch('/api/movies');
		if (!response.ok) {
			throw new Error(`Seed poster request failed (${response.status})`);
		}

		const payload = await response.json();
		applyMovieArtwork(Array.isArray(payload) ? payload : []);
		applyFallbackArtwork();
		posterVersion.update((value) => value + 1);
	} catch (error) {
		console.error('Unable to seed poster library', error);
		seedLoaded = false;
	}
}
