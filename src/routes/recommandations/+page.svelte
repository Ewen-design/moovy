<script>
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, recommendationMovies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	let heroVersion = $state(0);
	const heroMovies = $derived.by(() => {
		$posterVersion;
		return recommendationMovies.filter((movie) => ['Le Prestige', 'Drive'].includes(movie.title));
	});
	const heroSlides = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return heroMovies.map((movie, index) => ({
			title: movie.title,
			logo: movie.clearlogo,
			image: movie.backdrop ?? movie.image,
			button: 'Découvrir',
			href: '#recommandations',
			tint: index === 0 ? 'tint-silver' : 'tint-blue'
		}));
	});

	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);
	const visibleMovies = $derived.by(() => {
		$posterVersion;
		return recommendationMovies;
	});

	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(recommendationMovies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	onMount(() => {
		(async () => {
			await hydrateMoviePosters([...visibleMovies, ...heroMovies]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Recommandations</title>
</svelte:head>

<div class="recommend-page">
	<PageHero
		compact={true}
		fullBleed={true}
		overlayBottom={true}
		imageOverlay="vertical"
		slides={heroSlides}
	/>

	<section class="recommend-shell" id="recommandations">
		<div class="recommend-head">
			<h2>50 recommandations découvertes</h2>
		</div>

		<div class="film-list">
			{#each visibleMovies as film}
				<FilmRow
					{film}
					detailed={true}
					mobileCard={true}
					mobileExpanded={true}
					onSelect={openFilm}
				/>
			{/each}
		</div>
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(recommendationMovies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.recommend-page {
		display: grid;
		gap: 144px;
	}

	.recommend-shell {
		display: grid;
		gap: 42px;
	}

	.recommend-head h2 {
		margin: 0;
	}

	.recommend-head h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
	}

	.film-list {
		display: grid;
		gap: 10px;
	}

	.recommend-shell :global(.film-row h3) {
		font-weight: 600;
	}

	.recommend-shell :global(.film-row .meta),
	.recommend-shell :global(.film-row .description),
	.recommend-shell :global(.film-row .credits) {
		font-weight: 300;
	}

	.recommend-shell :global(.film-row .row-action) {
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.recommend-page {
			gap: 72px;
		}

		.recommend-shell {
			gap: 28px;
		}

		.film-list {
			gap: 8px;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded.detailed) {
			grid-template-columns: 176px minmax(0, 1fr);
			gap: 22px;
			padding: 18px 16px;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .poster-wrap img) {
			width: 176px;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .content-stack) {
			gap: 0.9rem;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .film-copy) {
			gap: 0.8rem;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded h3) {
			line-height: 1.08;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .meta),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .credits),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .description) {
			line-height: 1.52;
		}
	}

	@media (max-width: 480px) {
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded.detailed) {
			grid-template-columns: 160px minmax(0, 1fr);
			gap: 18px;
			padding: 16px 12px;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .poster-wrap img) {
			width: 160px;
		}

		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .meta),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .credits),
		.recommend-shell :global(.film-row.mobile-card.mobile-expanded .description) {
			line-height: 1.48;
		}
	}
</style>
