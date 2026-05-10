<script>
	import { fade } from 'svelte/transition';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { genreMovieCollections, getSimilarMovies } from '$lib/data/catalog';

	const genres = Object.keys(genreMovieCollections);
	const heroSlides = [
		{
			title: 'Parcourir 50 films par ambiance.',
			button: 'Changer de genre',
			href: '#genres',
			tint: 'tint-amber'
		},
		{
			title: 'Action, drame, thriller, SF, comedie.',
			button: 'Voir les listes',
			href: '#genres',
			tint: 'tint-blue'
		}
	];

	let activeGenre = $state(genres[0]);
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
	<title>Moovy | Genres</title>
</svelte:head>

<div class="genre-page">
	<PageHero compact={true} fullBleed={true} slides={heroSlides} />

	<section class="genre-shell" id="genres">
		<div class="genre-head">
			<h2>50 films par selection.</h2>
		</div>

		<div class="genre-tabs">
			{#each genres as genre}
				<button
					class:active={genre === activeGenre}
					type="button"
					onclick={() => (activeGenre = genre)}
				>
					{genre}
				</button>
			{/each}
		</div>

		{#key activeGenre}
			<div class="film-list" transition:fade={{ duration: 220 }}>
				{#each genreMovieCollections[activeGenre] as film}
					<FilmRow {film} onSelect={openFilm} />
				{/each}
			</div>
		{/key}
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm
			? getSimilarMovies(genreMovieCollections[activeGenre], selectedFilm, 6)
			: []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.genre-page {
		display: grid;
		gap: 42px;
	}

	.genre-shell {
		display: grid;
		gap: 16px;
	}

	.genre-head h2 {
		margin: 0;
	}

	.genre-head h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
	}

	.genre-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.genre-tabs button {
		padding: 0.85rem 1.15rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 10px 24px rgba(47, 107, 255, 0.18);
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease;
	}

	.genre-tabs button.active {
		background: #ffffff;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.14);
	}

	.film-list {
		display: grid;
		gap: 10px;
	}

	@media (max-width: 640px) {
		.genre-page,
		.film-list {
			gap: 8px;
		}
	}
</style>
