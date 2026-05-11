<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import {
		genreMovieCollections,
		getSimilarMovies,
		recommendationMovies,
		top100Movies
	} from '$lib/data/catalog';
	import favicon from '$lib/assets/favicon.svg';
	import { hydrateMoviePosters, seedPosterLibrary } from '$lib/posters';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Accueil' },
		{ href: '/top-100', label: 'Top 100' },
		{ href: '/recommandations', label: 'Recommandations' },
		{ href: '/genres', label: 'Par genres' }
	];
	let scrolled = $state(false);
	let searchQuery = $state('');
	let theme = $state('light');
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	const searchableMovies = [
		...top100Movies,
		...recommendationMovies,
		...Object.values(genreMovieCollections).flat()
	].filter((movie, index, list) => index === list.findIndex((item) => item.title === movie.title));

	const filteredMovies = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return [];
		return searchableMovies
			.filter(
				(movie) =>
					movie.title.toLowerCase().includes(query) ||
					movie.genres.some((genre) => genre.toLowerCase().includes(query))
			)
			.slice(0, 8);
	});

	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		searchQuery = '';
		hydrateMoviePosters([film, ...getSimilarMovies(searchableMovies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	/** @param {'light' | 'dark'} nextTheme */
	const applyTheme = (nextTheme) => {
		theme = nextTheme;
		if (!browser) return;
		document.body.classList.toggle('theme-dark', nextTheme === 'dark');
		localStorage.setItem('moovy-theme', nextTheme);
	};

	const toggleTheme = () => {
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	};

	$effect(() => {
		if (!browser) return;
		const savedTheme = localStorage.getItem('moovy-theme');
		applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
	});

	onMount(() => {
		seedPosterLibrary();
	});
</script>

<svelte:head>
	<title>Moovy</title>
	<meta
		name="description"
		content="Moovy propose une home cinema moderne avec selections, top films, genres et recommandations."
	/>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onscroll={() => (scrolled = window.scrollY > 28)} />

<div class="app-shell">
	<header class:scrolled class="site-header">
		<div class="header-left">
			<a class="brand" href="/">MOOVY</a>

			<nav class="site-nav" aria-label="Navigation principale">
				{#each navItems as item}
					<a class:active={page.url.pathname === item.href} href={item.href}>{item.label}</a>
				{/each}
			</nav>
		</div>

		<div class="header-right">
			<button
				class="theme-toggle"
				type="button"
				aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode nuit'}
				onclick={toggleTheme}
			>
				<span class="theme-icon" aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
			</button>
			<div class="search-box">
				<input bind:value={searchQuery} type="search" placeholder="Recherche un film..." />

				{#if filteredMovies.length}
					<div class="search-results">
						{#each filteredMovies as movie}
							<button type="button" onclick={() => openFilm(movie)}>
								<strong>{movie.title}</strong>
								<span>{movie.year} · {movie.genres.join(', ')}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="site-main">
		{#key page.url.pathname}
			<div transition:fade={{ duration: 220 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<footer class="site-footer">
		<p>Moovy</p>
		<div class="footer-meta">
			<span>Mentions legales</span>
			<span>Confidentialite</span>
			<span>Cookies</span>
			<span>© 2026</span>
		</div>
	</footer>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(searchableMovies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: Inter, 'Helvetica Neue', Arial, sans-serif;
		--accent-blue: #2f6bff;
		--page-bg: #f5f5f7;
		--page-text: #111111;
		--muted-text: #6f7683;
		--muted-text-strong: #75757c;
		--muted-text-soft: #8f8f94;
		--surface-card: #fbfbfc;
		--surface-card-strong: #ffffff;
		--surface-elevated: #ffffff;
		--surface-subtle: #eef3ff;
		--surface-subtle-hover: #dde8ff;
		--surface-inverse: #181818;
		--sheet-surface: var(--page-bg);
		--sheet-block: var(--surface-card);
		--sheet-block-hover: #f1f4fa;
		--sheet-gradient-end: #f5f5f7;
		--sheet-shadow: 0 24px 72px rgba(18, 24, 35, 0.12);
		--border-soft: rgba(18, 24, 35, 0.1);
		--shadow-soft: 0 24px 72px rgba(18, 24, 35, 0.12);
		--search-border: rgba(255, 255, 255, 0.16);
		--search-bg: rgba(255, 255, 255, 0.08);
		--search-text: #ffffff;
		--search-placeholder: rgba(255, 255, 255, 0.62);
		--search-results-bg: rgba(255, 255, 255, 0.98);
		--search-results-text: #111111;
		--search-results-muted: #5f6675;
		--theme-duration: 560ms;
		--theme-ease: cubic-bezier(0.22, 1, 0.36, 1);
		background: var(--page-bg);
		color: var(--page-text);
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	:global(body.theme-dark) {
		--page-bg: #0b0d11;
		--page-text: #f2f5fb;
		--muted-text: #97a2b7;
		--muted-text-strong: #a5afc2;
		--muted-text-soft: #8993a6;
		--surface-card: #141820;
		--surface-card-strong: #181d26;
		--surface-elevated: #181818;
		--surface-subtle: #232323;
		--surface-subtle-hover: #353535;
		--surface-inverse: #181818;
		--sheet-surface: #181818;
		--sheet-block: #232323;
		--sheet-block-hover: #353535;
		--sheet-gradient-end: #181818;
		--sheet-shadow: 0 30px 120px rgba(0, 0, 0, 0.45);
		--border-soft: rgba(255, 255, 255, 0.08);
		--shadow-soft: 0 26px 86px rgba(0, 0, 0, 0.42);
		--search-border: rgba(255, 255, 255, 0.14);
		--search-bg: rgba(255, 255, 255, 0.08);
		--search-text: #ffffff;
		--search-placeholder: rgba(255, 255, 255, 0.56);
		--search-results-bg: rgba(15, 17, 22, 0.98);
		--search-results-text: #f2f5fb;
		--search-results-muted: #9aa4b8;
	}

	:global(html) {
		scroll-behavior: smooth;
		overscroll-behavior: none;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(a) {
		color: inherit;
	}

	:global(
		.app-shell,
		.site-footer,
		.search-box input,
		.search-results,
		.search-results button,
		.feature-block,
		.genre-tabs button,
		.pager button
	) {
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			border-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease),
			box-shadow var(--theme-duration) var(--theme-ease);
	}

	:global(body) {
		overscroll-behavior-y: none;
	}

	.app-shell {
		padding: 10px;
	}

	.site-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 28px 18px;
		background: transparent;
		color: #ffffff;
		transition: padding 260ms ease;
	}

	.site-header::before,
	.site-header::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition: opacity 320ms ease;
	}

	.site-header::before {
		background: linear-gradient(
			180deg,
			rgba(8, 8, 8, 0.94) 0%,
			rgba(8, 8, 8, 0.78) 18%,
			rgba(8, 8, 8, 0.48) 46%,
			rgba(8, 8, 8, 0.16) 74%,
			rgba(0, 0, 0, 0) 100%
		);
		opacity: 1;
	}

	.site-header::after {
		background: rgba(10, 10, 10, 0.96);
		opacity: 0;
	}

	.site-header.scrolled {
		padding: 12px 28px;
	}

	.site-header.scrolled::before {
		opacity: 0;
	}

	.site-header.scrolled::after {
		opacity: 1;
	}

	.brand {
		position: relative;
		z-index: 1;
		color: var(--accent-blue);
		font-size: 1.7rem;
		font-weight: 800;
		letter-spacing: -0.06em;
		text-decoration: none;
	}

	.header-left,
	.header-right,
	.site-nav {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.header-right {
		gap: 0.85rem;
	}

	.site-nav a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.9rem;
		font-size: 0.96rem;
		font-weight: 600;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.88);
		transition: color 220ms ease;
	}

	.site-nav a.active {
		color: #ffffff;
	}

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		color: #ffffff;
		font: inherit;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.theme-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 1.05rem;
		line-height: 1;
		transform: translateY(-0.5px);
	}

	.search-box {
		position: relative;
		width: min(320px, 34vw);
	}

	.search-box input {
		width: 100%;
		height: 42px;
		padding: 0 14px;
		border: 1px solid var(--search-border);
		background: var(--search-bg);
		color: var(--search-text);
		font: inherit;
		outline: none;
	}

	.search-box input::placeholder {
		color: var(--search-placeholder);
	}

	.search-results {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		display: grid;
		gap: 2px;
		padding: 6px;
		background: var(--search-results-bg);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
	}

	.search-results button {
		display: grid;
		gap: 0.2rem;
		padding: 11px 12px;
		border: 0;
		background: transparent;
		color: var(--search-results-text);
		text-align: left;
		cursor: pointer;
	}

	.search-results strong,
	.search-results span {
		margin: 0;
	}

	.search-results strong {
		font-size: 0.95rem;
		font-weight: 700;
	}

	.search-results span {
		font-size: 0.82rem;
		color: var(--search-results-muted);
	}

	.site-main {
		margin-top: 0;
	}

	.site-footer {
		padding: 26px 2px 8px;
	}

	.site-footer p {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--muted-text-strong);
	}

	.footer-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1.1rem;
		margin-top: 0.5rem;
		font-size: 0.78rem;
		color: var(--muted-text-soft);
	}

	@media (max-width: 720px) {
		.app-shell {
			padding: 8px;
		}

		.site-header {
			padding: 12px 16px 16px;
		}

		.site-header.scrolled {
			padding: 11px 16px;
		}

		.site-nav {
			gap: 0.95rem;
			overflow: auto;
		}

		.header-right {
			display: flex;
		}

		.search-box {
			display: none;
		}
	}
</style>
