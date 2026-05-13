<script>
	import { onMount, tick } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, top100Movies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	const pageSize = 20;
	const pageCount = Math.ceil(top100Movies.length / pageSize);
	const pages = Array.from({ length: pageCount }, (_, index) => index);
	let heroVersion = $state(0);
	const heroMovies = $derived.by(() => {
		$posterVersion;
		return top100Movies.filter((movie) => movie.backdrop && movie.clearlogo).slice(0, 2);
	});
	const heroSlides = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return heroMovies.map((movie, index) => ({
			title: movie.title,
			logo: movie.clearlogo,
			image: movie.backdrop ?? movie.image,
			button: 'Découvrir',
			href: '#list',
			tint: index === 0 ? 'tint-blue' : 'tint-silver'
		}));
	});

	let currentPage = $state(0);
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);
	/** @type {HTMLElement | null} */
	let listSection = $state(null);

	const scrollToListTop = async () => {
		await tick();
		listSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	/** @param {number} page */
	const goToPage = (page) => {
		currentPage = page;
		scrollToListTop();
	};

	const previousPage = () => {
		currentPage = Math.max(0, currentPage - 1);
		scrollToListTop();
	};

	const nextPage = () => {
		currentPage = Math.min(pageCount - 1, currentPage + 1);
		scrollToListTop();
	};

	const visibleMovies = $derived.by(() => {
		$posterVersion;
		return top100Movies.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
	});

	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(top100Movies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	$effect(() => {
		(async () => {
			await hydrateMoviePosters([...visibleMovies, ...heroMovies]);
			heroVersion += 1;
		})();
	});

	onMount(() => {
		(async () => {
			await hydrateMoviePosters([...visibleMovies, ...heroMovies]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Top 100</title>
</svelte:head>

<div class="catalog-page">
	<PageHero
		compact={true}
		fullBleed={true}
		overlayBottom={true}
		imageOverlay="vertical"
		slides={heroSlides}
	/>

	<section class="catalog-shell" id="list" bind:this={listSection}>
		<div class="catalog-head">
			<div>
				<h2>Notre top 100</h2>
			</div>
			<span>{currentPage * 20 + 1}-{Math.min((currentPage + 1) * 20, 100)} / 100</span>
		</div>

		<nav class="pager" aria-label="Pagination du top 100">
			<button type="button" onclick={previousPage} disabled={currentPage === 0}>←</button>
			{#each pages as page}
				<button class:active={page === currentPage} type="button" onclick={() => goToPage(page)}>
					{page + 1}
				</button>
			{/each}
			<button type="button" onclick={nextPage} disabled={currentPage === pageCount - 1}>→</button>
		</nav>

		<div class="film-list">
			{#each visibleMovies as film}
				<FilmRow {film} rank={film.rank} onSelect={openFilm} />
			{/each}
		</div>

		<nav class="pager bottom" aria-label="Pagination du top 100 bas de page">
			<button type="button" onclick={previousPage} disabled={currentPage === 0}>←</button>
			{#each pages as page}
				<button class:active={page === currentPage} type="button" onclick={() => goToPage(page)}>
					{page + 1}
				</button>
			{/each}
			<button type="button" onclick={nextPage} disabled={currentPage === pageCount - 1}>→</button>
		</nav>
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(top100Movies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.catalog-page {
		display: grid;
		gap: 42px;
	}

	.catalog-shell {
		display: grid;
		gap: 16px;
	}

	.catalog-head {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		padding: 0 2px;
	}

	.catalog-head h2,
	.catalog-head span {
		margin: 0;
	}

	.catalog-head h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
	}

	.catalog-head span {
		font-size: 0.95rem;
		color: var(--muted-text);
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pager button {
		min-width: 44px;
		height: 44px;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.94rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 10px 24px rgba(47, 107, 255, 0.18);
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease,
			opacity 240ms ease;
	}

	.pager button.active {
		background: #ffffff;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.14);
	}

	:global(body.theme-dark) .pager button.active {
		background: #05070a;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
	}

	.pager button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.film-list {
		display: grid;
		gap: 10px;
	}

	.bottom {
		justify-content: flex-start;
		padding-bottom: 4px;
	}

	@media (max-width: 640px) {
		.catalog-page,
		.film-list {
			gap: 8px;
		}

		.catalog-head {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
