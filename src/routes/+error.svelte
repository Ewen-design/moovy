<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { heroImage, supplementalMovies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';
	import { handleImageError, imageSource } from '$lib/image-fallback';

	const f1Movie = supplementalMovies.find((movie) => movie.title === 'F1') ?? null;

	const backgroundImage = $derived.by(() => {
		$posterVersion;
		return imageSource(f1Movie?.backdrop ?? f1Movie?.image ?? heroImage, heroImage);
	});

	onMount(() => {
		if (!browser || !f1Movie) return;
		hydrateMoviePosters([f1Movie]);
	});
</script>

<svelte:head>
	<title>Erreur {page.status} | Moovy</title>
</svelte:head>

<section class="error-page">
	<img
		class="error-bg"
		src={backgroundImage}
		alt=""
		fetchpriority="high"
		decoding="async"
		referrerpolicy="no-referrer"
		onerror={(event) => handleImageError(event, heroImage)}
	/>
	<div class="error-overlay"></div>

	<div class="error-copy">
		<h1>Erreur {page.status}</h1>
		<a href={resolve('/')}>Revenir à l'accueil</a>
	</div>
</section>

<style>
	.error-page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 100svh;
		overflow: hidden;
		background: var(--page-bg);
	}

	.error-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center center;
		display: block;
	}

	.error-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			linear-gradient(
				180deg,
				rgba(11, 13, 17, 0.62) 0%,
				rgba(11, 13, 17, 0.5) 46%,
				rgba(11, 13, 17, 0.82) 100%
			),
			radial-gradient(120% 120% at 50% 40%, rgba(11, 13, 17, 0.28) 0%, rgba(11, 13, 17, 0.78) 100%);
	}

	.error-copy {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 640px;
		padding: 24px;
		text-align: center;
		color: #ffffff;
	}

	.error-copy h1 {
		margin: 0 0 1.6rem;
		font-size: clamp(2.4rem, 9vw, 6rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		overflow-wrap: anywhere;
	}

	.error-copy a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.6rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.98rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease;
	}

	.error-copy a:hover {
		background: transparent;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.14);
	}

	@media (max-width: 480px) {
		.error-copy a {
			width: min(100%, 320px);
			min-height: 48px;
		}
	}
</style>
