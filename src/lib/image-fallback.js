export const DEFAULT_IMAGE_FALLBACK = '/telephone2_parfum.webp';
export const PERSON_IMAGE_FALLBACK = '/photo.webp';

/** @param {string | null | undefined} src */
export function imageSource(src, fallback = DEFAULT_IMAGE_FALLBACK) {
	const value = String(src ?? '').trim();
	if (!value || value === 'null' || value === 'undefined') return fallback;
	if (value.includes('/images/missing/') || value.endsWith('/missing/movie.jpg')) return fallback;
	return value;
}

/** @param {Event} event */
export function handleImageError(event, fallback = DEFAULT_IMAGE_FALLBACK) {
	const image = event.currentTarget;
	if (!(image instanceof HTMLImageElement)) return;
	if (image.dataset.fallbackApplied === 'true') return;

	image.dataset.fallbackApplied = 'true';
	image.src = fallback;
}

/** @param {Event} event */
export function hideBrokenImage(event) {
	const image = event.currentTarget;
	if (!(image instanceof HTMLImageElement)) return;
	image.hidden = true;
}
