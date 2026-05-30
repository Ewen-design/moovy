<script>
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import PosterRail from '$lib/components/PosterRail.svelte';
	import {
		genreMovieCollections,
		getSimilarMovies,
		recommendationMovies,
		tonightMoviePool,
		top100Movies
	} from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	const catalogMovies = [
		...top100Movies,
		...recommendationMovies,
		...Object.values(genreMovieCollections).flat()
	].filter((movie, index, list) => index === list.findIndex((item) => item.title === movie.title));

	/**
	 * @param {{ title: string }[]} source
	 * @param {Set<string>} usedTitles
	 * @param {number} count
	 */
	const takeUniqueMovies = (source, usedTitles, count = 10) => {
		const items = [];

		for (const movie of source) {
			if (usedTitles.has(movie.title)) continue;
			items.push(movie);
			usedTitles.add(movie.title);
			if (items.length === count) break;
		}

		return items;
	};

	const usedDiscoveryTitles = new Set();
	const searchSections = [
		{ title: 'À redécouvrir', items: takeUniqueMovies(recommendationMovies, usedDiscoveryTitles) },
		{ title: 'Pour ce soir', items: takeUniqueMovies(tonightMoviePool, usedDiscoveryTitles) },
		{ title: 'Top 100', items: takeUniqueMovies(top100Movies, usedDiscoveryTitles) },
		{
			title: 'Films à grand spectacle',
			items: takeUniqueMovies(genreMovieCollections['Action'] ?? [], usedDiscoveryTitles)
		}
	];

	let query = $state('');
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	const visibleMovies = $derived.by(() => {
		$posterVersion;
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return [];

		return catalogMovies
			.filter(
				(movie) =>
					movie.title.toLowerCase().includes(normalizedQuery) ||
					movie.genres.some((genre) => genre.toLowerCase().includes(normalizedQuery)) ||
					String(movie.year).includes(normalizedQuery) ||
					String(movie.director ?? '').toLowerCase().includes(normalizedQuery)
			)
			.slice(0, 24);
	});

	/** @param {typeof catalogMovies[number]} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(catalogMovies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	onMount(() => {
		(async () => {
			await hydrateMoviePosters(searchSections.flatMap((section) => section.items));
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Recherche</title>
</svelte:head>

<div class="search-page">
	<section class="search-shell">
		<div class="sticky-top">
			<div class="search-head">
				<h1>Recherche</h1>
			</div>

			<label class="search-field">
				<span class="search-field-icon" aria-hidden="true"></span>
				<input bind:value={query} type="search" placeholder="Films, genres, réalisateurs..." />
			</label>
		</div>

		{#if query.trim()}
			<section class="search-results">
				<div class="results-head">
					<span>{visibleMovies.length} trouvés</span>
				</div>

				{#if visibleMovies.length}
					<div class="results-grid">
						{#each visibleMovies as movie}
							<button class="result-card" type="button" onclick={() => openFilm(movie)}>
								<img src={movie.image} alt={movie.title} loading="lazy" decoding="async" />
								<div class="result-overlay"></div>
							</button>
						{/each}
					</div>
				{:else}
					<p class="empty-state">Aucun titre ne correspond à cette recherche.</p>
				{/if}
			</section>
		{:else}
			<section class="search-discovery">
				{#each searchSections as section}
					<div class="discovery-block">
						<h2>{section.title}</h2>
						<PosterRail
							title=""
							items={section.items}
							variant="small"
							orientation="portrait"
							overlayStyle="home"
							showCardCopy={false}
							dark={true}
							enableHoverPreview={false}
							pauseOnHover={false}
							onSelect={openFilm}
						/>
					</div>
				{/each}
			</section>
		{/if}
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(catalogMovies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.search-page {
		display: grid;
		padding-top: 108px;
	}

	.search-shell {
		display: grid;
		gap: 22px;
	}

	.sticky-top {
		position: sticky;
		top: 86px;
		z-index: 12;
		display: grid;
		gap: 12px;
		padding-bottom: 2px;
		background: var(--page-bg);
	}

	.search-head {
		display: grid;
		gap: 0.45rem;
	}

	.search-head h1,
	.results-head span,
	.discovery-block h2 {
		margin: 0;
	}

	.search-head h1 {
		font-size: clamp(2.2rem, 7vw, 3.6rem);
		letter-spacing: -0.06em;
	}

	.results-head span {
		color: var(--muted-text);
		font-size: 0.98rem;
		font-weight: 300;
	}

	.search-field {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0 1rem;
		min-height: 58px;
		background: rgba(18, 21, 29, 0.92);
		backdrop-filter: blur(16px);
	}

	.search-field-icon {
		position: relative;
		width: 18px;
		height: 18px;
		flex: 0 0 auto;
	}

	.search-field-icon::before,
	.search-field-icon::after {
		content: '';
		position: absolute;
		display: block;
	}

	.search-field-icon::before {
		top: 0;
		left: 0;
		width: 11px;
		height: 11px;
		border: 1.75px solid rgba(255, 255, 255, 0.62);
		border-radius: 999px;
	}

	.search-field-icon::after {
		right: 0;
		bottom: 1px;
		width: 7px;
		height: 1.75px;
		background: rgba(255, 255, 255, 0.62);
		transform: rotate(45deg);
		transform-origin: center;
	}

	.search-field input {
		width: 100%;
		border: 0;
		background: transparent;
		color: #ffffff;
		font: inherit;
		font-size: 1rem;
		outline: none;
	}

	.search-field input::placeholder {
		color: rgba(255, 255, 255, 0.46);
	}

	.search-results,
	.search-discovery {
		display: grid;
		gap: 22px;
	}

	.search-results {
		padding-top: 44px;
	}

	.search-discovery {
		padding-top: 44px;
	}

	.results-head {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
	}

	.discovery-block h2 {
		font-size: clamp(1.6rem, 4vw, 2.2rem);
		letter-spacing: -0.05em;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.result-card {
		position: relative;
		padding: 0;
		border: 0;
		border-radius: 3px;
		background: #141820;
		color: #ffffff;
		text-align: left;
		overflow: hidden;
		cursor: pointer;
	}

	.result-card img {
		width: 100%;
		aspect-ratio: 3 / 4.2;
		display: block;
		object-fit: cover;
	}

	.result-overlay {
		display: none;
	}

	.discovery-block {
		display: grid;
		gap: 12px;
	}

	.empty-state {
		margin: 0;
		color: var(--muted-text);
	}

	@media (max-width: 900px) {
		.results-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (max-width: 720px) {
		.search-page {
			padding-top: 0;
			overflow-x: clip;
		}

		.search-shell {
			gap: 18px;
		}

		.sticky-top {
			top: -2px;
			gap: 10px;
			margin-top: -104px;
			padding-top: 104px;
			padding-bottom: 8px;
		}

		.sticky-top::before {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: -24px;
			height: 24px;
			background: var(--page-bg);
		}

		.search-discovery {
			padding-top: 84px;
		}

		.search-results {
			padding-top: 84px;
		}
	}

	@media (max-width: 520px) {
		.search-page {
			padding-top: 0;
		}

		.results-head {
			justify-content: flex-end;
		}

		.results-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 10px;
		}

		.sticky-top {
			top: -2px;
			margin-top: -96px;
			padding-top: 96px;
		}

		.search-discovery {
			padding-top: 96px;
		}

		.search-results {
			padding-top: 96px;
		}

		.search-field {
			min-height: 52px;
			padding-inline: 0.88rem;
		}
	}
</style>
