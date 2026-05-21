<script>
	import { fade } from 'svelte/transition';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { genreMovieCollections, getSimilarMovies, top100Movies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	const genres = Object.keys(genreMovieCollections);

	let activeGenre = $state(genres[0]);
	let heroVersion = $state(0);
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);
	const heroMovies = $derived.by(() => {
		$posterVersion;
		if (activeGenre === 'Action') {
			const f1Movie = genreMovieCollections['Action']?.find((movie) => movie.title === 'F1');
			const legendMovie = top100Movies.find((movie) => movie.title === 'Je suis une légende');
			if (f1Movie && legendMovie) return [f1Movie, legendMovie];
		}
		if (activeGenre === 'Comedie') {
			const kingsmanMovie = genreMovieCollections['Comedie']?.find((movie) => movie.title === 'Kingsman');
			const trumanShowMovie = genreMovieCollections['Comedie']?.find((movie) => movie.title === 'The Truman Show');
			if (kingsmanMovie && trumanShowMovie) return [kingsmanMovie, trumanShowMovie];
		}
		if (activeGenre === 'Science-fiction') {
			const customSciFiHero = top100Movies.filter((movie) =>
				['Interstellar'].includes(movie.title)
			);
			const avatarMovie = genreMovieCollections['Science-fiction']?.find((movie) => movie.title === 'Avatar');
			if (customSciFiHero.length === 1 && avatarMovie) return [avatarMovie, customSciFiHero[0]];
		}
		if (activeGenre === 'Romance') {
			const ilEtaitTempsMovie = genreMovieCollections['Romance']?.find((movie) => movie.title === 'Il était temps');
			const titanicMovie = top100Movies.find((movie) => movie.title === 'Titanic');
			if (ilEtaitTempsMovie && titanicMovie) return [ilEtaitTempsMovie, titanicMovie];
		}
		const matches = top100Movies.filter(
			(movie) => movie.genres.includes(activeGenre) && movie.backdrop && movie.clearlogo
		);
		return matches.length ? matches.slice(0, 2) : top100Movies.filter((movie) => movie.backdrop && movie.clearlogo).slice(0, 2);
	});
	const heroSlides = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return heroMovies.map((movie, index) => ({
			title: movie.title,
			logo: movie.clearlogo,
			image: movie.backdrop ?? movie.image,
			button: 'Découvrir',
			href: '#genres',
			tint: index === 0 ? 'tint-amber' : 'tint-blue'
		}));
	});

	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(genreMovieCollections[activeGenre], film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	const activeMovies = $derived.by(() => {
		$posterVersion;
		return genreMovieCollections[activeGenre];
	});

	$effect(() => {
		(async () => {
			await hydrateMoviePosters([...activeMovies, ...heroMovies]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Genres</title>
</svelte:head>

<div class="genre-page">
	<PageHero
		compact={true}
		fullBleed={true}
		overlayBottom={true}
		imageOverlay="vertical"
		slides={heroSlides}
	/>

	<section class="genre-shell" id="genres">
		<div class="genre-head">
			<h2>Par genres</h2>
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
				{#each activeMovies as film}
					<FilmRow {film} mobileCard={true} onSelect={openFilm} />
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
		gap: 144px;
	}

	.genre-shell {
		display: grid;
		gap: 42px;
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
		font-weight: 500;
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

	:global(body.theme-dark) .genre-tabs button.active {
		background: #05070a;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
	}

	.film-list {
		display: grid;
		gap: 10px;
	}

	.genre-shell :global(.film-row h3) {
		font-weight: 560;
	}

	.genre-shell :global(.film-row .meta),
	.genre-shell :global(.film-row .description),
	.genre-shell :global(.film-row .credits) {
		font-weight: 380;
	}

	.genre-shell :global(.film-row .row-action) {
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.genre-page {
			gap: 72px;
		}

		.genre-shell {
			gap: 28px;
		}

		.genre-tabs {
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-bottom: 6px;
			scrollbar-width: none;
		}

		.genre-tabs::-webkit-scrollbar {
			display: none;
		}

		.genre-tabs button {
			flex: 0 0 auto;
			padding: 0.78rem 1rem;
			white-space: nowrap;
		}

		.film-list {
			gap: 8px;
		}
	}
</style>
