<script>
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, top100Movies } from '$lib/data/catalog';

	const pageSize = 20;
	const pageCount = Math.ceil(top100Movies.length / pageSize);
	const pages = Array.from({ length: pageCount }, (_, index) => index);

	const heroSlides = [
		{
			kicker: 'Top 100',
			title: 'Les 100 films a garder.',
			button: 'Commencer par le debut',
			href: '#list',
			tint: 'tint-blue'
		},
		{
			kicker: 'Classement',
			title: 'Une liste nette, 20 par 20.',
			button: 'Voir la suite',
			href: '#list',
			tint: 'tint-silver'
		}
	];

	let currentPage = $state(0);
	/** @type {{ id: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	/** @param {number} page */
	const goToPage = (page) => {
		currentPage = page;
	};

	const previousPage = () => {
		currentPage = Math.max(0, currentPage - 1);
	};

	const nextPage = () => {
		currentPage = Math.min(pageCount - 1, currentPage + 1);
	};

	const visibleMovies = () =>
		top100Movies.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

	/** @param {{ id: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
	};

	const closeFilm = () => {
		selectedFilm = null;
	};
</script>

<svelte:head>
	<title>Moovy | Top 100</title>
</svelte:head>

<div class="catalog-page">
	<PageHero compact={true} fullBleed={true} slides={heroSlides} />

	<section class="catalog-shell" id="list">
		<div class="catalog-head">
			<div>
				<p>Top 100</p>
				<h2>100 films, 20 par page.</h2>
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
			{#each visibleMovies() as film}
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
	/>
</div>

<style>
	.catalog-page {
		display: grid;
		gap: 10px;
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

	.catalog-head p,
	.catalog-head h2,
	.catalog-head span {
		margin: 0;
	}

	.catalog-head p {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #6f7683;
	}

	.catalog-head h2 {
		margin-top: 0.4rem;
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
	}

	.catalog-head span {
		font-size: 0.95rem;
		color: #6f7683;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pager button {
		min-width: 44px;
		height: 44px;
		border: 0;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.94rem;
		font-weight: 600;
		cursor: pointer;
	}

	.pager button.active {
		background: #0f4fce;
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
