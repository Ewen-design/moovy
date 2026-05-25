<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import PosterRail from '$lib/components/PosterRail.svelte';
	import { applyFallbackArtwork, applyMovieArtwork } from '$lib/data/catalog';
	import {
		genreMovieCollections,
		getSimilarMovies,
		recommendationMovies,
		supplementalMovies,
		top100Movies
	} from '$lib/data/catalog';
	import favicon from '$lib/assets/favicon.svg';
	import { hydrateMoviePosters, seedPosterLibrary } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';
	import { fade } from 'svelte/transition';

	let { children, data } = $props();
	const siteUrl = 'https://moovy.agence3terres.fr';
	const shareImage = `${siteUrl}/moovy-showcase.svg`;

	const navItems = [
		{ href: '/', label: 'Accueil' },
		{ href: '/ce-soir', label: 'Pour ce soir' },
		{ href: '/top-100', label: 'Top 100' },
		{ href: '/recommandations', label: 'Recommandations' },
		{ href: '/genres', label: 'Par genres' }
	];
	const mobileMenuItems = navItems.filter((item) => item.href !== '/');
	const mobileBottomNavItems = [
		{ href: '/', label: 'Accueil', icon: 'home' },
		{ href: '/recherche', label: 'Recherche', icon: 'search' }
	];
	const isTonightPage = $derived(page.url.pathname === '/ce-soir');
	const mobileBreakpoint = '(max-width: 720px)';
	const preloaderLetters = ['M', 'O', 'O', 'V', 'Y'];
	let scrolled = $state(false);
	let searchQuery = $state('');
	let searchOpen = $state(false);
	let mobileMenuOpen = $state(false);
	let mobileMenuClosing = $state(false);
	let isMobileViewport = $state(false);
	let theme = $state('light');
	let showPreloader = $state(true);
	let preloaderReady = $state(false);
	let preloaderLeaving = $state(false);
	/** @type {HTMLElement | null} */
	let headerElement = $state(null);
	/** @type {HTMLDivElement | null} */
	let searchBox = $state(null);
	/** @type {HTMLInputElement | null} */
	let searchInput = $state(null);
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);
	let mobileMenuCloseTimer;

	const searchableMovies = [
		...top100Movies,
		...recommendationMovies,
		...supplementalMovies,
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

	const mobileMenuRailItems = $derived.by(() => {
		$posterVersion;
		return recommendationMovies
			.filter((movie) => movie.clearlogo && (movie.backdrop || movie.image))
			.slice(0, 8)
			.map((movie) => ({
				...movie,
				image: movie.backdrop ?? movie.image
			}));
	});

	/** @param {{ id: string, title: string, genres: string[] }} film */
	const openFilm = (film) => {
		selectedFilm = film;
		searchQuery = '';
		searchOpen = false;
		hydrateMoviePosters([film, ...getSimilarMovies(searchableMovies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	/** @param {'light' | 'dark'} nextTheme */
	const applyTheme = (nextTheme, persist = true) => {
		const resolvedTheme = isMobileViewport ? 'dark' : nextTheme;
		theme = resolvedTheme;
		if (!browser) return;
		document.body.classList.toggle('theme-dark', resolvedTheme === 'dark');
		if (persist && !isMobileViewport) {
			localStorage.setItem('moovy-theme', resolvedTheme);
		}
	};

	const syncViewportTheme = () => {
		if (!browser) return;
		const savedTheme = localStorage.getItem('moovy-theme');
		const nextTheme =
			savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : getDefaultTheme();
		applyTheme(nextTheme, false);
	};

	const setMobileViewport = (matches) => {
		isMobileViewport = matches;
		if (matches) {
			searchOpen = false;
			searchQuery = '';
		}
		syncViewportTheme();
	};

	const toggleTheme = () => {
		if (isMobileViewport) return;
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	};

	const finalizeMobileMenuClose = () => {
		mobileMenuOpen = false;
		mobileMenuClosing = false;
		if (!browser || !mobileMenuCloseTimer) return;
		window.clearTimeout(mobileMenuCloseTimer);
		mobileMenuCloseTimer = null;
	};

	const requestCloseMobileMenu = () => {
		if (!mobileMenuOpen || mobileMenuClosing) return;
		mobileMenuClosing = true;
		if (browser) {
			if (mobileMenuCloseTimer) window.clearTimeout(mobileMenuCloseTimer);
			mobileMenuCloseTimer = window.setTimeout(() => {
				finalizeMobileMenuClose();
			}, 1040);
		}
	};

	const closeMobileMenu = () => {
		requestCloseMobileMenu();
	};

	const toggleMobileMenu = () => {
		if (mobileMenuOpen) {
			requestCloseMobileMenu();
			return;
		}

		if (browser && mobileMenuCloseTimer) {
			window.clearTimeout(mobileMenuCloseTimer);
			mobileMenuCloseTimer = null;
		}
		mobileMenuClosing = false;
		mobileMenuOpen = true;
	};

	const getDefaultTheme = () => 'dark';

	const toggleSearch = async () => {
		searchOpen = !searchOpen;
		if (searchOpen) mobileMenuOpen = false;
		if (!searchOpen) {
			searchQuery = '';
			return;
		}
		await tick();
		searchInput?.focus();
	};

	$effect(() => {
		const posters = data?.posters ?? [];
		if (!posters.length) return;
		applyMovieArtwork(posters);
		applyFallbackArtwork();
		posterVersion.update((value) => value + 1);
	});

	$effect(() => {
		const nextPathname = page.url.pathname;
		finalizeMobileMenuClose();
		searchOpen = false;
		searchQuery = '';
	});

	$effect(() => {
		if (!browser) return;
		document.body.classList.toggle('menu-open', mobileMenuOpen || mobileMenuClosing);

		return () => {
			document.body.classList.remove('menu-open');
		};
	});

	onMount(() => {
		seedPosterLibrary();
		const mediaQuery = window.matchMedia(mobileBreakpoint);
		setMobileViewport(mediaQuery.matches);
		/** @type {ReturnType<typeof window.setTimeout> | undefined} */
		let leaveTimer;
		/** @type {ReturnType<typeof window.setTimeout> | undefined} */
		let hideTimer;
		/** @type {ReturnType<typeof window.requestAnimationFrame> | undefined} */
		let preloaderFrame;
		let preloaderStarted = false;
		let disposed = false;

		const startPreloader = () => {
			if (disposed || preloaderStarted) return;
			preloaderStarted = true;
			preloaderFrame = window.requestAnimationFrame(() => {
				preloaderReady = true;
				leaveTimer = window.setTimeout(() => {
					preloaderLeaving = true;
				}, 1120);
				hideTimer = window.setTimeout(() => {
					showPreloader = false;
				}, 1460);
			});
		};

		Promise.race([
			document.fonts?.load('800 72px "Panchang Preloader"') ?? Promise.resolve(),
			new Promise((resolve) => window.setTimeout(resolve, 420))
		])
			.catch(() => undefined)
			.then(startPreloader);

		/** @param {PointerEvent} event */
		const handlePointerDown = (event) => {
			const target = /** @type {Node} */ (event.target);

			if (searchOpen && searchBox && !searchBox.contains(target)) {
				searchOpen = false;
				searchQuery = '';
			}

			if (mobileMenuOpen && headerElement && !headerElement.contains(target)) {
				requestCloseMobileMenu();
			}
		};

		/** @param {KeyboardEvent} event */
		const handleKeydown = (event) => {
			if (event.key !== 'Escape') return;
			searchOpen = false;
			searchQuery = '';
			requestCloseMobileMenu();
		};

		/** @param {MediaQueryListEvent} event */
		const handleViewportChange = (event) => {
			setMobileViewport(event.matches);
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown);
		mediaQuery.addEventListener('change', handleViewportChange);

		return () => {
			disposed = true;
			if (preloaderFrame) window.cancelAnimationFrame(preloaderFrame);
			if (leaveTimer) window.clearTimeout(leaveTimer);
			if (hideTimer) window.clearTimeout(hideTimer);
			if (mobileMenuCloseTimer) window.clearTimeout(mobileMenuCloseTimer);
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown);
			mediaQuery.removeEventListener('change', handleViewportChange);
		};
	});
</script>

<svelte:head>
	<title>Moovy</title>
	<meta
		name="description"
		content="Moovy propose une home cinema moderne avec selections, top films, genres et recommandations."
	/>
	<link rel="canonical" href={`${siteUrl}${page.url.pathname}`} />
	<meta property="og:site_name" content="Moovy" />
	<meta property="og:title" content="Moovy" />
	<meta
		property="og:description"
		content="Moovy propose une home cinema moderne avec selections, top films, genres et recommandations."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${siteUrl}${page.url.pathname}`} />
	<meta property="og:image" content={shareImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Moovy" />
	<meta
		name="twitter:description"
		content="Moovy propose une home cinema moderne avec selections, top films, genres et recommandations."
	/>
	<meta name="twitter:image" content={shareImage} />
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onscroll={() => (scrolled = window.scrollY > 28)} />

{#if showPreloader}
	<div
		class:leaving={preloaderLeaving}
		class:ready={preloaderReady}
		class="preloader"
		aria-hidden="true"
	>
		<div class="preloader-mark">
			<div class="preloader-word">
				{#each preloaderLetters as letter, index}
					<span class="preloader-letter" style={`--letter-delay:${index * 70}ms;`}>
						<span>{letter}</span>
					</span>
				{/each}
			</div>
		</div>
	</div>
{/if}

<div class:tonight-page={isTonightPage} class="app-shell">
	<header
		bind:this={headerElement}
		class:menu-open={mobileMenuOpen}
		class:scrolled
		class="site-header"
	>
		<div class="header-left">
			<a class="brand" href="/">MOOVY</a>

			<nav class="site-nav" aria-label="Navigation principale">
				{#each navItems as item}
					<a class:active={page.url.pathname === item.href} href={item.href}>{item.label}</a>
				{/each}
			</nav>
		</div>

		<div class="header-right">
			<div class:open={searchOpen} class="search-box" bind:this={searchBox}>
				<button
					class="search-toggle"
					type="button"
					aria-label={searchOpen ? 'Fermer la recherche' : 'Ouvrir la recherche'}
					onclick={toggleSearch}
				>
					<span class="search-icon" aria-hidden="true"></span>
				</button>
				<input
					bind:this={searchInput}
					bind:value={searchQuery}
					type="search"
					placeholder="Recherche un film..."
				/>

				{#if searchOpen && filteredMovies.length}
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

			{#if !isMobileViewport}
				<button
					class="theme-toggle"
					type="button"
					aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode nuit'}
					onclick={toggleTheme}
				>
					<span
						class:moon={theme !== 'dark'}
						class:sun={theme === 'dark'}
						class="theme-icon"
						aria-hidden="true"
					>
						{theme === 'dark' ? '☀' : '☾'}
					</span>
				</button>
			{/if}

			<button
				class="menu-toggle"
				type="button"
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-nav"
				aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
				onclick={toggleMobileMenu}
			>
				<span class:open={mobileMenuOpen} class="menu-toggle-bars" aria-hidden="true"></span>
			</button>
		</div>

		<div
			class:active={mobileMenuOpen || mobileMenuClosing}
			class:open={mobileMenuOpen && !mobileMenuClosing}
			class:closing={mobileMenuClosing}
			class="mobile-nav-panel"
			id="mobile-nav"
		>
			<div class="mobile-nav-inner">
				<nav class="mobile-nav" aria-label="Navigation mobile">
					{#each mobileMenuItems as item, index}
						<a
							class:active={page.url.pathname === item.href}
							href={item.href}
							onclick={closeMobileMenu}
							style={`--nav-index:${index};--nav-out-index:${mobileMenuItems.length - index - 1};`}
						>
							<span class="mobile-nav-copy">
								<strong>{item.label}</strong>
								<small>
									{item.href === '/ce-soir'
										? 'Selection par humeur'
										: item.href === '/top-100'
											? 'Classement complet'
											: item.href === '/recommandations'
												? 'Nos suggestions'
												: 'Explorer par genres'}
								</small>
							</span>
						</a>
					{/each}
				</nav>
				<div class="mobile-menu-rail">
					<PosterRail
						title=""
						items={mobileMenuRailItems}
						variant="small"
						orientation="landscape"
						overlayStyle="home"
						showCardCopy={false}
						showClearlogoOverlay={true}
						dark={true}
						enableHoverPreview={false}
						pauseOnHover={false}
						onSelect={openFilm}
					/>
				</div>
			</div>
		</div>
	</header>

	<main class:tonight-page={isTonightPage} class="site-main">
		{#key page.url.pathname}
			<div transition:fade={{ duration: 220 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	{#if !isTonightPage}
		<nav class="mobile-bottom-nav" aria-label="Navigation mobile principale">
			{#each mobileBottomNavItems as item}
				<a
					class:active={page.url.pathname === item.href}
					href={item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
				>
					{#if item.icon === 'home'}
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M4 11.6 12 5l8 6.6V20a1 1 0 0 1-1 1h-5.2v-6.2h-3.6V21H5a1 1 0 0 1-1-1z"
							></path>
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="11" cy="11" r="6.2"></circle>
							<path d="M20 20 16.3 16.3"></path>
						</svg>
					{/if}
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<footer class="site-footer">
			<p>Moovy</p>
			<div class="footer-meta">
				<a href="/mentions-legales">Mentions legales</a>
				<span>2026</span>
				<a href="https://agence3terres.fr" target="_blank" rel="noreferrer">
					Developpe par Agence 3 Terres
				</a>
			</div>
		</footer>
	{/if}

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(searchableMovies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	@font-face {
		font-family: 'Panchang';
		src: url('/fonts/Panchang-Variable.woff2') format('woff2');
		font-weight: 200 800;
		font-style: normal;
		font-display: swap;
	}

	:global(body) {
		margin: 0;
		font-family: 'Panchang', 'Helvetica Neue', Arial, sans-serif;
		font-weight: 450;
		--accent-blue: #2f6bff;
		--page-bg: #f5f5f7;
		--page-text: #111111;
		--muted-text: #6f7683;
		--muted-text-strong: #75757c;
		--muted-text-soft: #8f8f94;
		--surface-card: #fbfbfc;
		--surface-card-strong: #ffffff;
		--rank-number: var(--page-bg);
		--rank-number-stroke: var(--accent-blue);
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

	:global(
		html,
		body,
		button,
		input,
		textarea,
		select,
		option,
		a,
		p,
		span,
		small,
		strong,
		em,
		li,
		label,
		h1,
		h2,
		h3,
		h4,
		h5,
		h6
	) {
		font-family: 'Panchang', 'Helvetica Neue', Arial, sans-serif;
	}

	:global(p),
	:global(small),
	:global(label),
	:global(input),
	:global(textarea),
	:global(select),
	:global(li) {
		font-weight: 380;
	}

	:global(body.menu-open) {
		overflow: hidden;
	}

	:global(body.theme-dark) {
		--page-bg: #0b0d11;
		--page-text: #f2f5fb;
		--muted-text: #97a2b7;
		--muted-text-strong: #a5afc2;
		--muted-text-soft: #8993a6;
		--surface-card: #141820;
		--surface-card-strong: #181d26;
		--rank-number: #000000;
		--rank-number-stroke: var(--accent-blue);
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
		letter-spacing: normal !important;
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

	.app-shell.tonight-page {
		padding: 0;
	}

	.preloader {
		position: fixed;
		inset: 0;
		z-index: 500;
		display: grid;
		place-items: center;
		min-height: 100svh;
		background: #0b0d11;
		opacity: 1;
		contain: layout paint style;
		pointer-events: auto;
		transform: translateZ(0);
		animation: preloader-fallback-out 260ms ease 2.1s forwards;
		transition:
			opacity 300ms cubic-bezier(0.22, 1, 0.36, 1),
			visibility 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.preloader.leaving {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.preloader-mark {
		display: grid;
		place-items: center;
		width: min(82vw, 31rem);
		height: clamp(3.25rem, 12vw, 6.4rem);
		overflow: visible;
		transform: translateZ(0);
	}

	.preloader-word {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--accent-blue);
		font-family: 'Panchang Preloader', 'Panchang', 'Helvetica Neue', Arial, sans-serif;
		font-size: clamp(2.65rem, 10vw, 5.65rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0 !important;
		font-synthesis: none;
		text-rendering: geometricPrecision;
		white-space: nowrap;
		backface-visibility: hidden;
		opacity: 0;
		will-change: opacity;
	}

	.preloader.ready .preloader-word {
		animation: preloader-word-in 180ms ease forwards;
	}

	.preloader-letter {
		display: inline-block;
		overflow: hidden;
		padding-block: 0.08em;
		line-height: 1;
	}

	.preloader-letter span {
		display: inline-block;
		line-height: 1;
		transform: translate3d(0, 112%, 0);
		backface-visibility: hidden;
		will-change: transform;
	}

	.preloader.ready .preloader-letter span {
		animation: preloader-letter-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--letter-delay);
	}

	@keyframes preloader-word-in {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	@keyframes preloader-letter-in {
		100% {
			transform: translate3d(0, 0, 0);
		}
	}

	@keyframes preloader-fallback-out {
		100% {
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.preloader,
		.preloader-word,
		.preloader-letter span {
			animation: none;
			transition: none;
		}

		.preloader-word,
		.preloader-letter span {
			opacity: 1;
			transform: none;
		}
	}

	.site-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 220;
		isolation: isolate;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
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
		z-index: 3;
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
		z-index: 3;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.header-right {
		gap: 0.45rem;
		margin-left: auto;
	}

	.site-nav a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.9rem;
		font-size: 0.76rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.54);
		transition: color 220ms ease;
	}

	.site-nav a.active {
		color: #ffffff;
	}

	.theme-toggle {
		position: relative;
		z-index: 3;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: #ffffff;
		font: inherit;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			border-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	.menu-toggle {
		display: none;
		position: relative;
		z-index: 3;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border: 0;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
	}

	.menu-toggle-bars,
	.menu-toggle-bars::before,
	.menu-toggle-bars::after {
		display: block;
		width: 22px;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		transition:
			transform 240ms ease,
			opacity 240ms ease,
			background-color 240ms ease;
	}

	.menu-toggle-bars {
		position: relative;
	}

	.menu-toggle-bars::before,
	.menu-toggle-bars::after {
		content: '';
		position: absolute;
		left: 0;
	}

	.menu-toggle-bars::before {
		top: -7px;
	}

	.menu-toggle-bars::after {
		top: 7px;
	}

	.menu-toggle-bars.open {
		background: transparent;
	}

	.menu-toggle-bars.open::before {
		transform: translateY(7px) rotate(45deg);
	}

	.menu-toggle-bars.open::after {
		transform: translateY(-7px) rotate(-45deg);
	}

	.theme-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		font-size: 1.4rem;
		line-height: 1;
		transform: translateY(-4px);
	}

	.theme-icon.sun {
		font-size: 1.36rem;
	}

	.theme-icon.moon {
		font-size: 1.36rem;
		transform: translateY(-4px) translateX(0.5px);
	}

	.search-box {
		position: relative;
		width: 56px;
		height: 56px;
		margin-top: 4px;
		transition: width 340ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.search-box.open {
		width: min(320px, 34vw);
	}

	.search-toggle {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--search-text);
		font: inherit;
		cursor: pointer;
	}

	.search-icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 23px;
		height: 23px;
		transform: translateY(-5px);
	}

	.search-icon::before,
	.search-icon::after {
		content: '';
		position: absolute;
		display: block;
	}

	.search-icon::before {
		top: 2px;
		left: 2px;
		width: 13px;
		height: 13px;
		border: 1.75px solid currentColor;
		border-radius: 999px;
	}

	.search-icon::after {
		right: 3px;
		bottom: 4px;
		width: 8px;
		height: 1.75px;
		background: currentColor;
		border-radius: 999px;
		transform: rotate(45deg);
		transform-origin: center;
	}

	.search-box input {
		width: 100%;
		height: 42px;
		padding: 0 14px 0 52px;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--search-text);
		font: inherit;
		font-size: 0.84rem;
		outline: none;
		opacity: 0;
		pointer-events: none;
		transition: opacity 180ms ease;
	}

	.search-box.open input {
		opacity: 1;
		pointer-events: auto;
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

	.mobile-nav-panel {
		position: fixed;
		inset: 0;
		z-index: 1;
		display: block;
		padding: 0;
		background: rgba(0, 0, 0, 0.985);
		opacity: 0;
		pointer-events: none;
		clip-path: inset(0 0 100% 0);
		transition:
			clip-path 700ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 260ms ease;
	}

	.mobile-nav-panel.active {
		opacity: 1;
		pointer-events: auto;
	}

	.mobile-nav-panel.open {
		clip-path: inset(0 0 0 0);
	}

	.mobile-nav-panel.closing {
		clip-path: inset(0 0 100% 0);
		pointer-events: none;
		transition:
			clip-path 620ms cubic-bezier(0.22, 1, 0.36, 1) 380ms,
			opacity 260ms ease;
	}

	.mobile-nav-inner {
		position: absolute;
		top: 72px;
		left: 0;
		right: 0;
		bottom: 0;
		display: grid;
		place-items: center;
		padding: 24px;
	}

	.mobile-nav {
		display: grid;
		align-self: center;
		align-content: center;
		justify-items: center;
		gap: 1.7rem;
		width: min(100%, 420px);
		padding: 0;
		margin: 0 auto;
		transform: translateY(-112px);
	}

	.mobile-nav a {
		display: grid;
		justify-items: center;
		gap: 0.32rem;
		width: 100%;
		padding: 0;
		color: #ffffff;
		text-decoration: none;
		text-align: center;
		transform: translateY(72%) rotateX(-72deg);
		transform-origin: center bottom;
		opacity: 0;
		transition:
			transform 540ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 320ms ease,
			color 220ms ease;
		transition-delay: calc(760ms + (var(--nav-index, 0) * 92ms));
		will-change: transform, opacity;
	}

	.mobile-nav-panel.open .mobile-nav a {
		transform: translateY(0) rotateX(0deg);
		opacity: 1;
	}

	.mobile-nav-panel.closing .mobile-nav a {
		transform: translateY(72%) rotateX(-72deg);
		opacity: 0;
		transition-delay: calc(var(--nav-out-index, 0) * 58ms);
	}

	.mobile-nav a:hover,
	.mobile-nav a.active {
		color: #ffffff;
	}

	.mobile-nav-copy {
		display: grid;
		gap: 0.22rem;
		min-width: 0;
		justify-items: center;
	}

	.mobile-nav-copy strong,
	.mobile-nav-copy small {
		display: block;
	}

	.mobile-nav-copy strong {
		font-size: clamp(1.16rem, 4.2vw, 1.68rem);
		font-weight: 700;
		line-height: 0.98;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.mobile-nav-copy small {
		color: rgba(255, 255, 255, 0.42);
		font-size: 0.76rem;
		line-height: 1.35;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.mobile-menu-rail {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(82px + env(safe-area-inset-bottom));
		padding: 0 16px;
	}

	.mobile-menu-rail :global(.poster-rail) {
		gap: 0;
	}

	.mobile-menu-rail :global(.rail-viewport) {
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
	}

	.mobile-menu-rail :global(.rail-viewport::-webkit-scrollbar) {
		display: none;
	}

	.mobile-menu-rail :global(.rail-track) {
		padding-right: 12px;
	}

	.site-main {
		margin-top: 0;
	}

	.site-main.tonight-page {
		padding-bottom: 0;
	}

	.mobile-bottom-nav {
		display: none;
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

	.footer-meta a:last-child {
		margin-left: auto;
	}

	.footer-meta a {
		color: inherit;
		text-decoration: none;
	}

	:global(.page-hero .hero-copy a:hover),
	:global(.film-row:hover .row-action),
	:global(.feature-block:hover .feature-copy span) {
		background: transparent;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.14);
	}

	:global(body.theme-dark .page-hero .hero-copy a:hover),
	:global(body.theme-dark .film-row:hover .row-action),
	:global(body.theme-dark .feature-block:hover .feature-copy span) {
		background: transparent;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
	}

	@media (max-width: 720px) {
		:global(body) {
			--page-bg: #0b0d11;
			--page-text: #f2f5fb;
			--muted-text: #97a2b7;
			--muted-text-strong: #a5afc2;
			--muted-text-soft: #8993a6;
			--surface-card: #141820;
			--surface-card-strong: #181d26;
			--rank-number: #000000;
			--rank-number-stroke: var(--accent-blue);
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
			background: var(--page-bg);
			color: var(--page-text);
		}

		.app-shell {
			padding: 8px;
		}

		.site-header {
			padding: 10px 12px 14px;
			align-items: flex-start;
		}

		.site-header.scrolled {
			padding: 10px 12px 12px;
		}

		.site-header::before {
			background: linear-gradient(
				180deg,
				rgba(6, 8, 12, 0.98) 0%,
				rgba(6, 8, 12, 0.92) 18%,
				rgba(6, 8, 12, 0.78) 38%,
				rgba(6, 8, 12, 0.5) 62%,
				rgba(6, 8, 12, 0.18) 82%,
				rgba(6, 8, 12, 0) 100%
			);
			opacity: 1;
		}

		.site-header::after,
		.site-header.scrolled::after {
			opacity: 0;
		}

		.site-header.scrolled::before {
			opacity: 1;
		}

		.header-left {
			width: 100%;
			justify-content: space-between;
			gap: 0.75rem;
		}

		.site-nav {
			display: none;
		}

		.header-right {
			position: absolute;
			top: 10px;
			right: 8px;
		}

		.search-box {
			display: none;
		}

		.brand {
			font-size: 1.72rem;
			transform: translateY(5px);
		}

		.menu-toggle,
		.mobile-nav-panel {
			display: flex;
		}

		.mobile-nav-panel {
			padding-top: 0;
		}

		.theme-toggle,
		.menu-toggle {
			width: 48px;
			height: 48px;
		}

		.theme-icon {
			transform: none;
			font-size: 1.2rem;
		}

		.site-main {
			padding-bottom: calc(62px + env(safe-area-inset-bottom));
		}

		.site-footer {
			padding-bottom: calc(8px + env(safe-area-inset-bottom));
		}

		.mobile-bottom-nav {
			position: fixed;
			left: 8px;
			right: 8px;
			bottom: 8px;
			z-index: 230;
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			padding: 4px 8px calc(4px + env(safe-area-inset-bottom));
			background: var(--page-bg);
			backdrop-filter: blur(18px);
			box-shadow: 0 36px 104px rgba(0, 0, 0, 0.76);
		}

		.mobile-bottom-nav a {
			display: grid;
			justify-items: center;
			gap: 0.18rem;
			padding: 0.42rem 0.3rem 0.08rem;
			color: rgba(255, 255, 255, 0.56);
			text-decoration: none;
			font-size: 0.8rem;
			font-weight: 500;
		}

		.mobile-bottom-nav a.active {
			color: #ffffff;
		}

		.mobile-bottom-nav svg {
			width: 26px;
			height: 26px;
			fill: none;
			stroke: currentColor;
			stroke-width: 1.9;
			stroke-linecap: round;
			stroke-linejoin: round;
		}

		.mobile-bottom-nav a:first-child svg {
			fill: currentColor;
			stroke: none;
		}
	}

	@media (max-width: 720px) and (pointer: coarse) {
		.preloader-mark {
			width: min(84vw, 22rem);
			height: clamp(3rem, 15vw, 5.4rem);
		}

		.preloader-word {
			font-size: clamp(2.65rem, 13vw, 4.85rem);
		}

		.mobile-nav-inner {
			top: 76px;
		}
	}

	@media (max-width: 480px) {
		.site-header,
		.site-header.scrolled {
			padding-inline: 10px;
		}

		.mobile-nav-inner {
			top: 58px;
		}

		.mobile-menu-rail {
			bottom: calc(74px + env(safe-area-inset-bottom));
			padding: 0 10px;
		}

		.brand {
			font-size: 1.88rem;
			transform: translateY(7px);
		}

		.mobile-bottom-nav {
			left: 0;
			right: 0;
			bottom: 0;
			padding-inline: 6px;
		}

		.site-footer {
			padding-top: 18px;
		}

		.footer-meta {
			gap: 0.45rem 0.9rem;
		}

		.footer-meta a:last-child {
			margin-left: 0;
		}
	}
</style>
