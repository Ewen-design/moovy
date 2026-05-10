<script>
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, recommendationMovies } from '$lib/data/catalog';

	const heroSlides = [
		{
			title: '50 films a proposer avec plus de contexte.',
			button: 'Voir la liste',
			href: '#recommandations',
			tint: 'tint-silver'
		},
		{
			title: 'Une selection plus commentee.',
			button: 'Explorer',
			href: '#recommandations',
			tint: 'tint-blue'
		}
	];

	/** @type {{ id: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	/** @param {{ id: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
	};

	const closeFilm = () => {
		selectedFilm = null;
	};
</script>

<svelte:head>
	<title>Moovy | Recommandations</title>
</svelte:head>

<div class="recommend-page">
	<PageHero compact={true} fullBleed={true} slides={heroSlides} />

	<section class="recommend-shell" id="recommandations">
		<div class="recommend-head">
			<h2>50 films avec un peu plus de contexte.</h2>
		</div>

		<div class="film-list">
			{#each recommendationMovies as film}
				<FilmRow {film} detailed={true} onSelect={openFilm} />
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
		gap: 42px;
	}

	.recommend-shell {
		display: grid;
		gap: 16px;
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
		.recommend-page,
		.film-list {
			gap: 8px;
		}
	}
</style>
