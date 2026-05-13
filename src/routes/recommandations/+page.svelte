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
		return recommendationMovies.filter((movie) =>
			['Le Prestige', 'Drive'].includes(movie.title)
		);
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
	}
</style>
