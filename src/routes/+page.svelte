<script>
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import PosterRail from '$lib/components/PosterRail.svelte';
	import { getSimilarMovies, recommendationMovies, top100Movies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	let heroVersion = $state(0);
	const heroShowcaseMovies = [top100Movies[18], top100Movies[13], top100Movies[66]];
	const featureShowcaseMovies = [top100Movies[2], top100Movies[17], top100Movies[63], top100Movies[54]];
	const heroSlides = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return [
			{
				kicker: 'Moovy',
				title: heroShowcaseMovies[0].title,
				image: heroShowcaseMovies[0].backdrop ?? heroShowcaseMovies[0].image,
				href: '/recommandations',
				tint: 'tint-blue'
			},
			{
				kicker: 'Moovy',
				title: heroShowcaseMovies[1].title,
				image: heroShowcaseMovies[1].backdrop ?? heroShowcaseMovies[1].image,
				href: '/recommandations',
				tint: 'tint-silver'
			},
			{
				kicker: 'Moovy',
				title: heroShowcaseMovies[2].title,
				image: heroShowcaseMovies[2].backdrop ?? heroShowcaseMovies[2].image,
				href: '/top-100',
				tint: 'tint-amber'
			}
		];
	});

	const featureBlocks = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return [
			{
				title: 'Top 100',
				button: 'Ouvrir',
				href: '/top-100',
				image: featureShowcaseMovies[0].backdrop ?? featureShowcaseMovies[0].image
			},
			{
				title: 'Recommandations',
				button: 'Voir',
				href: '/recommandations',
				image: featureShowcaseMovies[1].backdrop ?? featureShowcaseMovies[1].image
			},
			{
				title: 'Pour ce soir',
				button: 'Choisir',
				href: '/ce-soir',
				image: featureShowcaseMovies[2].backdrop ?? featureShowcaseMovies[2].image
			},
			{
				title: 'Par genre',
				button: 'Parcourir',
				href: '/genres',
				image: featureShowcaseMovies[3].backdrop ?? featureShowcaseMovies[3].image
			}
		];
	});

	const heroRailItems = $derived.by(() => {
		$posterVersion;
		return recommendationMovies.slice(0, 10).map((film) => ({
			...film,
			tag: film.genres[0]
		}));
	});

	const bottomRailItems = $derived.by(() => {
		$posterVersion;
		return recommendationMovies.slice(10, 18).map((film) => ({
			...film,
			tag: film.genres[0]
		}));
	});

	const bottomMiniRailItems = $derived.by(() => {
		$posterVersion;
		return recommendationMovies.slice(18, 28).map((film) => ({
			...film,
			tag: film.genres[0]
		}));
	});

	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);
	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies([...recommendationMovies, ...top100Movies], film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	const similarMovies = $derived(
		selectedFilm
			? getSimilarMovies([...recommendationMovies, ...top100Movies], selectedFilm, 6)
			: []
	);

	onMount(() => {
		(async () => {
			await hydrateMoviePosters([
				...heroRailItems,
				...bottomRailItems,
				...bottomMiniRailItems,
				...heroShowcaseMovies,
				...featureShowcaseMovies
			]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Accueil</title>
	<meta
		name="description"
		content="Moovy rassemble top films, recommandations et genres dans une home cinema immersive."
	/>
</svelte:head>

<div class="home">
	<section class="hero-shell">
		<PageHero
			compact={true}
			slides={heroSlides}
			fullBleed={true}
			overlayBottom={true}
			overlayTone="light"
			imageOverlay="bottom-only"
			hideCopy={true}
		/>

		<div class="hero-rail">
			<PosterRail
				title="Immanquables"
				items={heroRailItems}
				variant="small"
				orientation="portrait"
				overlayStyle="home"
				dark={true}
				onSelect={openFilm}
			/>
		</div>
	</section>

	<section class="feature-grid" aria-label="Entrees de navigation">
		{#each featureBlocks as block}
			<a class="feature-block" href={block.href}>
				<img src={block.image ?? '/telephone2_parfum.webp'} alt={block.title} loading="lazy" decoding="async" />
				<div class="feature-overlay"></div>
				<div class="feature-copy">
					<h2>{block.title}</h2>
					<span>{block.button}</span>
				</div>
			</a>
		{/each}
	</section>

	<section class="bottom-slider">
		<PosterRail
			title="Recommandations"
			items={bottomRailItems}
			variant="large"
			orientation="portrait"
			density="expanded"
			overlayStyle="home"
			onSelect={openFilm}
		/>
		<PosterRail
			title="A voir aussi"
			items={bottomMiniRailItems}
			variant="medium"
			orientation="portrait"
			overlayStyle="home"
			onSelect={openFilm}
		/>
	</section>

	<FilmDetailSheet film={selectedFilm} {similarMovies} onClose={closeFilm} onSelect={openFilm} />
</div>

<style>
	.home {
		display: grid;
		gap: 10px;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
	}

	.hero-shell {
		position: relative;
	}

	.hero-rail {
		position: absolute;
		left: 40px;
		right: 40px;
		bottom: 18px;
		z-index: 4;
	}

	.hero-rail :global(h3) {
		color: #ffffff;
		font-size: 1rem;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		padding: 0 10px;
	}

	.feature-block {
		position: relative;
		height: 450px;
		overflow: hidden;
		text-decoration: none;
		background: var(--surface-card);
	}

	.feature-block img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.feature-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(8, 8, 10, 0.02) 0%, rgba(8, 8, 10, 0.22) 36%, rgba(8, 8, 10, 0.82) 100%),
			linear-gradient(90deg, rgba(8, 8, 10, 0.42) 0%, rgba(8, 8, 10, 0.14) 100%);
	}

	.feature-copy {
		position: absolute;
		left: 24px;
		right: 24px;
		bottom: 24px;
		z-index: 1;
		color: #ffffff;
	}

	.feature-copy h2 {
		margin: 0;
		max-width: none;
		white-space: nowrap;
		font-size: clamp(2.3rem, 4vw, 4.2rem);
		line-height: 0.94;
		letter-spacing: -0.06em;
	}

	.feature-copy span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 1rem;
		padding: 0.9rem 1.3rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.98rem;
		font-weight: 600;
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease;
	}

	.bottom-slider {
		display: grid;
		gap: 12px;
		padding: 0 10px 10px;
	}

	@media (max-width: 900px) {
		.hero-rail {
			left: 18px;
			right: 18px;
			bottom: 14px;
		}

		.feature-grid {
			grid-template-columns: 1fr;
			padding: 0 8px;
		}

		.feature-block {
			height: 360px;
		}

		.bottom-slider {
			padding: 0 8px 8px;
		}
	}

	@media (max-width: 640px) {
		.bottom-slider {
			gap: 8px;
		}
	}
</style>
