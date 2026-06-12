<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import { getSimilarMovies, heroImage, tonightMoviePool } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';
	import { posterVersion } from '$lib/poster-state';

	const questions = [
		{
			id: 'duration',
			label: 'Durée',
			question: 'Tu veux un film de quelle durée ?',
			options: [
				{ value: 'short', label: 'Court', maxDuration: 109 },
				{ value: 'medium', label: 'Moyen', minDuration: 110, maxDuration: 140 },
				{ value: 'long', label: 'Long', minDuration: 141 }
			]
		},
		{
			id: 'era',
			label: 'Période',
			question: 'Tu préfères quelle période ?',
			options: [
				{ value: 'classic', label: 'Classique', maxYear: 1989 },
				{ value: 'nineties-2000s', label: 'Années 90-2000', minYear: 1990, maxYear: 2009 },
				{ value: 'recent', label: 'Récent', minYear: 2010 }
			]
		},
		{
			id: 'genre',
			label: 'Genre',
			question: 'Quels genres te tentent ?',
			options: [
				{ value: 'drama', label: 'Drame', genres: ['Drame'] },
				{
					value: 'action',
					label: 'Action',
					genres: ['Action', 'Aventure', 'Thriller', 'Crime', 'Psychologique']
				},
				{ value: 'scifi', label: 'Science-fiction', genres: ['Science-fiction'] },
				{ value: 'romance', label: 'Romance', genres: ['Romance'] },
				{ value: 'comedy', label: 'Comédie', genres: ['Comedie'] }
			]
		},
		{
			id: 'mood',
			label: 'Ambiance',
			question: 'Quelle ambiance tu cherches ?',
			options: [
				{ value: 'dark', label: 'Sombre', genres: ['Thriller', 'Crime', 'Psychologique'] },
				{ value: 'emotional', label: 'Émotive', genres: ['Drame', 'Romance'] },
				{
					value: 'spectacular',
					label: 'Spectaculaire',
					genres: ['Action', 'Aventure', 'Science-fiction']
				},
				{ value: 'light', label: 'Légère', genres: ['Comedie', 'Romance'] },
				{
					value: 'thoughtful',
					label: 'Qui fait réfléchir',
					genres: ['Science-fiction', 'Drame', 'Mystere']
				}
			]
		}
	];

	const criterionPriority = ['genre', 'duration', 'era', 'mood'];
	const fallbackPriority = ['genre', 'era', 'duration', 'mood'];
	const scrollThreshold = 30;
	const scrollCooldownMs = 520;

	/** @type {Record<string, { value: string, label: string, genres?: string[], maxDuration?: number, minDuration?: number, minYear?: number, maxYear?: number, minVotes?: number, maxVotes?: number }[]>} */
	let answers = $state({});
	/** @type {'quiz' | 'results'} */
	let stage = $state('quiz');
	let activeQuestionIndex = $state(0);
	let activeResultIndex = $state(0);
	let criteriaOpen = $state(false);
	let lastScrollAt = $state(0);
	/** @type {typeof tonightMoviePool[number] | null} */
	let selectedFilm = $state(null);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

	/** @param {string} duration */
	function durationToMinutes(duration) {
		const match = /(\d+)h\s*(\d+)m/.exec(duration ?? '');
		if (!match) return 0;
		return Number(match[1]) * 60 + Number(match[2]);
	}

	/** @param {string} votes */
	function votesToNumber(votes) {
		const normalized = String(votes).replace(',', '.').trim();
		if (normalized.endsWith('M')) return Number.parseFloat(normalized) * 1_000_000;
		if (normalized.endsWith('k')) return Number.parseFloat(normalized) * 1_000;
		return Number.parseFloat(normalized) || 0;
	}

	/**
	 * @param {typeof tonightMoviePool[number]} movie
	 * @param {{ genres?: string[], maxDuration?: number, minDuration?: number, minYear?: number, maxYear?: number, minVotes?: number, maxVotes?: number }} option
	 */
	function scoreOption(movie, option) {
		let score = 0;
		const minutes = durationToMinutes(movie.duration);
		const votes = votesToNumber(movie.votes);

		if (option.genres?.some((genre) => movie.genres.includes(genre))) score += 3;
		if (option.maxDuration && minutes <= option.maxDuration) score += 3;
		if (option.minDuration && minutes >= option.minDuration) score += 3;
		if (option.minYear && movie.year >= option.minYear) score += 3;
		if (option.maxYear && movie.year <= option.maxYear) score += 3;
		if (option.minVotes && votes >= option.minVotes * 1_000_000) score += 2;
		if (option.maxVotes && votes <= option.maxVotes * 1_000_000) score += 2;

		return score;
	}

	/**
	 * @param {typeof tonightMoviePool[number]} movie
	 * @param {string} questionId
	 */
	function matchQuestion(movie, questionId) {
		const selectedOptions = answers[questionId] ?? [];
		if (!selectedOptions.length) return false;
		return selectedOptions.some((option) => scoreOption(movie, option) > 0);
	}

	/** @param {typeof tonightMoviePool[number]} movie */
	function scoreMovie(movie) {
		const matches = Object.fromEntries(
			criterionPriority.map((questionId) => [questionId, matchQuestion(movie, questionId)])
		);

		let score = 0;
		let matchedQuestions = 0;

		for (const questionId of criterionPriority) {
			const selectedOptions = answers[questionId] ?? [];
			if (!selectedOptions.length) continue;

			const bestQuestionScore = Math.max(
				...selectedOptions.map((option) => scoreOption(movie, option))
			);
			score += bestQuestionScore;
			if (bestQuestionScore > 0) matchedQuestions += 1;
		}

		return {
			score,
			matchedQuestions,
			matches,
			rank: movie.rank ?? Number.MAX_SAFE_INTEGER
		};
	}

	const answeredQuestions = $derived(
		questions.filter((question) => (answers[question.id] ?? []).length > 0).length
	);
	const canValidateCriteria = $derived(answeredQuestions > 0);

	const suggestedMovies = $derived.by(() => {
		$posterVersion;
		if (!answeredQuestions) return [];

		const activeCriteria = criterionPriority.filter(
			(questionId) => (answers[questionId] ?? []).length > 0
		);
		const rankedMovies = tonightMoviePool
			.map((movie) => ({ movie, data: scoreMovie(movie) }))
			.sort((left, right) => {
				for (const questionId of criterionPriority) {
					if (left.data.matches[questionId] !== right.data.matches[questionId]) {
						return Number(right.data.matches[questionId]) - Number(left.data.matches[questionId]);
					}
				}
				if (right.data.score !== left.data.score) return right.data.score - left.data.score;
				if (Boolean(left.movie.rank) !== Boolean(right.movie.rank)) {
					return Number(Boolean(right.movie.rank)) - Number(Boolean(left.movie.rank));
				}
				return left.data.rank - right.data.rank;
			});

		const strictMatches = rankedMovies.filter(({ data }) =>
			activeCriteria.every((questionId) => data.matches[questionId])
		);

		if (strictMatches.length >= 3) {
			return strictMatches.slice(0, 10).map(({ movie }) => movie);
		}

		const fallbackCriteria = fallbackPriority.filter(
			(questionId) => (answers[questionId] ?? []).length > 0
		);
		const fallbackRankedMovies = rankedMovies
			.filter(({ data }) => fallbackCriteria.some((questionId) => data.matches[questionId]))
			.sort((left, right) => {
				for (const questionId of fallbackPriority) {
					if (!fallbackCriteria.includes(questionId)) continue;
					if (left.data.matches[questionId] !== right.data.matches[questionId]) {
						return Number(right.data.matches[questionId]) - Number(left.data.matches[questionId]);
					}
				}
				if (right.data.score !== left.data.score) return right.data.score - left.data.score;
				if (Boolean(left.movie.rank) !== Boolean(right.movie.rank)) {
					return Number(Boolean(right.movie.rank)) - Number(Boolean(left.movie.rank));
				}
				return left.data.rank - right.data.rank;
			});

		return (fallbackRankedMovies.length ? fallbackRankedMovies : rankedMovies)
			.slice(0, 10)
			.map(({ movie }) => movie);
	});

	/**
	 * @param {string} questionId
	 * @param {{ value: string, label: string, genres?: string[], maxDuration?: number, minDuration?: number, minYear?: number, maxYear?: number, minVotes?: number, maxVotes?: number }} option
	 */
	function toggleOption(questionId, option) {
		const currentOptions = answers[questionId] ?? [];
		const hasOption = currentOptions.some((entry) => entry.value === option.value);
		const nextOptions = hasOption
			? currentOptions.filter((entry) => entry.value !== option.value)
			: [...currentOptions, option];

		answers = {
			...answers,
			[questionId]: nextOptions
		};
	}

	function goToResults() {
		if (!canValidateCriteria || !suggestedMovies.length) return;
		stage = 'results';
		activeResultIndex = Math.min(activeResultIndex, suggestedMovies.length - 1);
	}

	/** @param {1 | -1} direction */
	function move(direction) {
		if (criteriaOpen || selectedFilm) return;

		if (stage === 'quiz') {
			activeQuestionIndex = Math.max(
				0,
				Math.min(questions.length - 1, activeQuestionIndex + direction)
			);
			return;
		}

		if (!suggestedMovies.length) return;

		activeResultIndex = Math.max(
			0,
			Math.min(suggestedMovies.length - 1, activeResultIndex + direction)
		);
	}

	/** @param {WheelEvent} event */
	function handleWheel(event) {
		if (criteriaOpen || selectedFilm) return;
		const dominantDelta =
			Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
		if (Math.abs(dominantDelta) < scrollThreshold) return;

		const now = Date.now();
		if (now - lastScrollAt < scrollCooldownMs) return;
		lastScrollAt = now;
		move(dominantDelta > 0 ? 1 : -1);
	}

	/** @param {KeyboardEvent} event */
	function handleKeydown(event) {
		if (criteriaOpen && event.key === 'Escape') {
			criteriaOpen = false;
			return;
		}
		if (selectedFilm) return;

		if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
			event.preventDefault();
			move(1);
		}

		if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
			event.preventDefault();
			move(-1);
		}
	}

	/** @param {TouchEvent} event */
	function handleTouchStart(event) {
		const touch = event.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
	}

	/** @param {TouchEvent} event */
	function handleTouchEnd(event) {
		if (selectedFilm) return;
		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - touchStartX;
		const deltaY = touch.clientY - touchStartY;
		const dominantDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
		if (Math.abs(dominantDelta) < 46) return;
		move(dominantDelta < 0 ? 1 : -1);
	}

	/** @param {typeof tonightMoviePool[number]} film */
	function openFilm(film) {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(tonightMoviePool, film, 6)]);
	}

	function closeFilm() {
		selectedFilm = null;
	}

	$effect(() => {
		if (activeResultIndex > suggestedMovies.length - 1) {
			activeResultIndex = Math.max(0, suggestedMovies.length - 1);
		}
	});

	onMount(() => {
		(async () => {
			await hydrateMoviePosters(tonightMoviePool);
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Pour ce soir</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div
	class:results-mode={stage === 'results'}
	class="tonight-experience"
	role="application"
	aria-label="Parcours de selection de film"
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	{#if stage === 'quiz'}
		<section class="quiz-stage" transition:fade={{ duration: 420 }}>
			<div class="quiz-header">
				<h1>Trouve ton film</h1>
			</div>

			<nav class="question-stepper" aria-label="Questions">
				{#each questions, index (index)}
					<button
						class:active={index === activeQuestionIndex}
						type="button"
						aria-label={`Aller à la question ${index + 1}`}
						onclick={() => (activeQuestionIndex = index)}
					>
						{index + 1}
					</button>
				{/each}
			</nav>

			<div class="question-rail">
				{#each questions as question, index (question.id)}
					<section
						class:active={activeQuestionIndex === index}
						class="question-slide"
						aria-hidden={activeQuestionIndex !== index}
					>
						<div class="question-card">
							<h2>{question.question}</h2>
							<div class="question-options">
								{#each question.options as option (option.value)}
									<button
										class:active={(answers[question.id] ?? []).some(
											(entry) => entry.value === option.value
										)}
										type="button"
										onclick={() => toggleOption(question.id, option)}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</div>
					</section>
				{/each}
			</div>

			<div class="stage-nav quiz-nav">
				<button
					class="nav-arrow up"
					type="button"
					aria-label="Question précédente"
					disabled={activeQuestionIndex === 0}
					onclick={() => move(-1)}
				>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				<button
					class="nav-arrow down"
					type="button"
					aria-label="Question suivante"
					disabled={activeQuestionIndex === questions.length - 1}
					onclick={() => move(1)}
				>
					<span class="chevron" aria-hidden="true"></span>
				</button>
			</div>

			<button
				class="validate-button"
				type="button"
				disabled={!canValidateCriteria}
				onclick={goToResults}
			>
				Valider mes critères
			</button>
		</section>
	{:else}
		<section class="results-stage" transition:fade={{ duration: 420 }}>
			<button class="criteria-toggle" type="button" onclick={() => (criteriaOpen = true)}>
				Changer les critères
			</button>
			<div
				class="result-rail"
				style={`transform: translate3d(-${activeResultIndex * 100}%, 0, 0);`}
			>
				{#each suggestedMovies as film, index (film.title)}
					<article class="film-slide" aria-hidden={activeResultIndex !== index}>
						<div class="film-background">
							<img src={film.backdrop ?? film.image ?? heroImage} alt={film.title} loading="lazy" />
						</div>
						<div class="film-overlay"></div>
						<div class="film-grid">
							<div class="film-copy">
								{#if film.clearlogo}
									<img class="film-logo" src={film.clearlogo} alt={film.title} loading="lazy" />
								{:else}
									<h2>{film.title}</h2>
								{/if}
								<div class="film-meta">
									<span>{film.year}</span>
									<span>{film.duration}</span>
									<span>{film.genres.slice(0, 3).join(' · ')}</span>
								</div>
								<p class="film-summary">{film.summary ?? film.editorial ?? film.description}</p>
								<div class="film-credits">
									<p><span>Réalisé par</span> {film.director}</p>
									<p><span>Avec</span> {film.cast.slice(0, 3).join(', ')}</p>
								</div>
								<div class="film-actions">
									<button class="primary-button" type="button" onclick={() => openFilm(film)}
										>Voir</button
									>
								</div>
							</div>

							<div class="film-poster-wrap">
								<img
									class="film-poster"
									src={film.image ?? heroImage}
									alt={film.title}
									loading="lazy"
								/>
							</div>
						</div>
					</article>
				{/each}
			</div>
			<div class="stage-nav results-nav">
				<button
					class="nav-arrow left"
					type="button"
					aria-label="Film précédent"
					disabled={activeResultIndex === 0}
					onclick={() => move(-1)}
				>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				<button
					class="nav-arrow right"
					type="button"
					aria-label="Film suivant"
					disabled={activeResultIndex === suggestedMovies.length - 1}
					onclick={() => move(1)}
				>
					<span class="chevron" aria-hidden="true"></span>
				</button>
			</div>

			<div class="stage-dots" aria-hidden="true">
				{#each suggestedMovies, index (index)}
					<span class:active={index === activeResultIndex}></span>
				{/each}
			</div>
		</section>
	{/if}

	{#if criteriaOpen}
		<div
			class="criteria-layer"
			role="presentation"
			onclick={() => (criteriaOpen = false)}
			transition:fade={{ duration: 180 }}
		>
			<div
				class="criteria-panel"
				role="dialog"
				aria-modal="true"
				aria-label="Modifier les critères"
				tabindex="-1"
				onclick={(event) => event.stopPropagation()}
				onkeydown={(event) => event.stopPropagation()}
				transition:fly={{ y: -34, duration: 240 }}
			>
				<div class="criteria-panel-head">
					<button
						class="panel-close"
						type="button"
						aria-label="Fermer"
						onclick={() => (criteriaOpen = false)}
					>
						<span aria-hidden="true">×</span>
					</button>
				</div>

				<div class="criteria-grid">
					{#each questions as question (question.id)}
						<section class="criteria-card">
							<h3>{question.question}</h3>
							<div class="criteria-options">
								{#each question.options as option (option.value)}
									<button
										class:active={(answers[question.id] ?? []).some(
											(entry) => entry.value === option.value
										)}
										type="button"
										onclick={() => toggleOption(question.id, option)}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(tonightMoviePool, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.tonight-experience {
		position: relative;
		--stage-height: 100svh;
		width: 100%;
		margin: 0;
		height: var(--stage-height);
		background: #05070b;
		color: #f4f7ff;
		overflow: hidden;
	}

	.quiz-stage,
	.results-stage {
		position: relative;
		height: var(--stage-height);
		overflow: hidden;
	}

	.quiz-stage {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		padding: clamp(5rem, 8vw, 6.6rem) clamp(1rem, 3vw, 2.8rem) 4.4rem;
		background: #05070b;
	}

	.results-stage {
		padding: 0;
	}

	.quiz-header {
		position: relative;
		z-index: 4;
		max-width: min(38rem, 100%);
		margin-inline: auto;
		text-align: center;
	}

	.quiz-header h1,
	.question-card h2,
	.film-copy h2,
	.criteria-card h3 {
		margin: 0;
	}

	.quiz-header h1 {
		font-size: 2rem;
		line-height: 1;
		letter-spacing: 0 !important;
		white-space: nowrap;
	}

	.result-rail {
		display: flex;
		transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.question-rail {
		position: relative;
		min-height: 0;
	}

	.result-rail {
		height: var(--stage-height);
	}

	.film-slide {
		flex: 0 0 100%;
		width: 100%;
	}

	.question-slide {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		min-height: 0;
		padding: 1rem 0;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 260ms ease,
			visibility 260ms ease;
		visibility: hidden;
	}

	.question-slide.active {
		opacity: 1;
		pointer-events: auto;
		visibility: visible;
	}

	.question-stepper {
		position: absolute;
		top: 50%;
		left: clamp(1rem, 3vw, 2.6rem);
		z-index: 8;
		display: grid;
		gap: 0.85rem;
		transform: translateY(-50%);
	}

	.question-stepper button {
		width: 28px;
		height: 28px;
		padding: 0;
		border: 0;
		background: transparent;
		color: rgba(255, 255, 255, 0.32);
		font: inherit;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: color 180ms ease;
	}

	.question-stepper button.active {
		color: #ffffff;
	}

	.question-card {
		display: grid;
		gap: 1.9rem;
		width: min(100%, 1100px);
		margin-inline: auto;
		padding: 0;
		text-align: center;
		background: transparent;
		border: 0;
		box-shadow: none;
		backdrop-filter: none;
	}

	.question-card h2 {
		font-size: 1.75rem;
		line-height: 1.02;
		letter-spacing: 0 !important;
		max-width: 18ch;
		margin-inline: auto;
	}

	.question-options,
	.criteria-options {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.65rem;
	}

	.question-options button,
	.criteria-options button,
	.primary-button,
	.criteria-toggle,
	.validate-button {
		border: 1px solid transparent;
		border-radius: 999px;
		background-color: #2f6bff;
		color: #ffffff;
		font: inherit;
		cursor: pointer;
	}

	.question-options button,
	.criteria-options button {
		min-height: 40px;
		padding: 0.58rem 0.95rem;
		font-size: 0.86rem;
		transition:
			background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.primary-button:hover,
	.criteria-toggle:hover,
	.validate-button:hover {
		background-color: transparent;
		color: #2f6bff;
		border-color: #2f6bff;
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.14);
	}

	.question-options button.active,
	.criteria-options button.active {
		background-color: transparent;
		color: #2f6bff;
		border-color: #2f6bff;
		box-shadow: none;
	}

	.stage-nav {
		position: absolute;
		z-index: 5;
		display: flex;
		gap: 0.6rem;
	}

	.quiz-nav {
		top: 50%;
		right: clamp(1rem, 3vw, 2.6rem);
		bottom: auto;
		flex-direction: column;
		transform: translateY(-50%);
	}

	.results-nav {
		right: 50%;
		bottom: 0.8rem;
		transform: translateX(50%);
	}

	.nav-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 46px;
		height: 46px;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			opacity 180ms ease;
	}

	.chevron {
		display: block;
		width: 24px;
		height: 24px;
		border-top: 3px solid currentColor;
		border-right: 3px solid currentColor;
	}

	.nav-arrow.right .chevron {
		transform: rotate(45deg) translate(-2px, 2px);
	}

	.nav-arrow.left .chevron {
		transform: rotate(225deg) translate(-2px, 2px);
	}

	.nav-arrow.down .chevron {
		transform: rotate(135deg) translate(-2px, 2px);
	}

	.nav-arrow.up .chevron {
		transform: rotate(-45deg) translate(-2px, 2px);
	}

	.nav-arrow:disabled {
		color: rgba(255, 255, 255, 0.28);
		cursor: default;
	}

	.stage-dots {
		position: absolute;
		left: clamp(1.2rem, 3vw, 2.8rem);
		bottom: 1.1rem;
		z-index: 5;
		display: flex;
		gap: 0.65rem;
	}

	.stage-dots span {
		width: 38px;
		height: 3px;
		background: rgba(255, 255, 255, 0.18);
	}

	.stage-dots span.active {
		background: #2f6bff;
	}

	.criteria-toggle {
		position: absolute;
		right: 28px;
		bottom: 1rem;
		z-index: 50;
		padding: 0.82rem 1.1rem;
		font-size: 0.88rem;
		font-weight: 600;
		box-shadow: 0 20px 50px rgba(15, 39, 96, 0.35);
		transition:
			background-color 340ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 340ms cubic-bezier(0.22, 1, 0.36, 1),
			color 340ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 340ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.validate-button {
		position: absolute;
		left: 50%;
		bottom: 0.8rem;
		z-index: 6;
		min-height: 40px;
		padding: 0.62rem 1.05rem;
		font-size: 0.82rem;
		font-weight: 600;
		transform: translateX(-50%);
		transition:
			background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.validate-button:disabled {
		opacity: 0.38;
		cursor: default;
	}

	.validate-button:disabled:hover {
		background-color: #2f6bff;
		color: #ffffff;
		border-color: transparent;
		box-shadow: none;
	}

	.film-slide {
		position: relative;
		display: grid;
		align-items: stretch;
		height: var(--stage-height);
		padding: 0;
	}

	.film-background,
	.film-overlay {
		position: absolute;
		inset: 0;
	}

	.film-background img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.95);
	}

	.film-overlay {
		background:
			linear-gradient(
				90deg,
				rgba(5, 7, 11, 0.96) 0%,
				rgba(5, 7, 11, 0.86) 35%,
				rgba(5, 7, 11, 0.42) 62%,
				rgba(5, 7, 11, 0.7) 100%
			),
			linear-gradient(180deg, rgba(5, 7, 11, 0.34) 0%, rgba(5, 7, 11, 0.74) 100%);
	}

	.film-grid {
		position: relative;
		z-index: 3;
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.72fr);
		align-items: center;
		gap: clamp(2rem, 5vw, 4.4rem);
		height: var(--stage-height);
		padding: clamp(5.2rem, 7vw, 6.2rem) clamp(1rem, 3vw, 2.8rem) 3.7rem;
		overflow: visible;
	}

	.film-copy {
		display: grid;
		gap: 0;
		max-width: 40rem;
	}

	.film-logo {
		display: block;
		max-width: min(26rem, 90%);
		max-height: 92px;
		margin-top: 0;
		object-fit: contain;
		object-position: left center;
	}

	.film-copy h2 {
		margin-top: 0.65rem;
		font-size: clamp(2rem, 4.2vw, 3.6rem);
		line-height: 0.92;
		letter-spacing: 0 !important;
	}

	.film-meta,
	.film-summary,
	.film-credits {
		margin: 0;
	}

	.film-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 1.25rem;
		font-size: 0.78rem;
		font-weight: 300;
		color: rgba(244, 247, 255, 0.7);
	}

	.film-meta span {
		display: inline-flex;
		align-items: center;
		min-height: 28px;
		padding: 0.35rem 0.58rem;
		background: rgba(255, 255, 255, 0.08);
		color: rgba(244, 247, 255, 0.82);
	}

	.film-summary {
		display: -webkit-box;
		margin-top: 1.35rem;
		max-width: 32rem;
		overflow: hidden;
		font-size: 0.9rem;
		line-height: 1.42;
		color: rgba(244, 247, 255, 0.9);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
	}

	.film-credits {
		display: grid;
		gap: 0.38rem;
		margin-top: 1.25rem;
		font-size: 0.78rem;
		font-weight: 300;
		line-height: 1.35;
		color: rgba(244, 247, 255, 0.66);
	}

	.film-credits p {
		margin: 0;
	}

	.film-credits span {
		display: inline-block;
		min-width: 7rem;
		color: rgba(244, 247, 255, 0.42);
	}

	.film-actions {
		margin-top: 1.45rem;
	}

	.primary-button {
		min-height: 42px;
		padding: 0.62rem 1.05rem;
		font-size: 0.82rem;
		font-weight: 600;
		box-shadow: 0 18px 46px rgba(25, 57, 146, 0.3);
		transition:
			background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.film-poster-wrap {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.film-poster {
		width: min(23vw, 310px);
		max-width: 100%;
		aspect-ratio: 2 / 3;
		object-fit: cover;
		border-radius: 3px;
		box-shadow: 0 42px 100px rgba(0, 0, 0, 0.38);
	}

	.criteria-layer {
		position: fixed;
		inset: 0;
		z-index: 240;
		display: grid;
		align-items: start;
		justify-items: center;
		padding: 88px 18px 18px;
		background: rgba(3, 5, 8, 0.74);
		backdrop-filter: blur(12px);
	}

	.criteria-panel {
		position: relative;
		width: min(1080px, 100%);
		max-height: calc(100svh - 116px);
		overflow: auto;
		padding: 0;
		background: transparent;
		border: 0;
		box-shadow: none;
	}

	.criteria-panel-head {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.4rem;
		min-height: 24px;
	}

	.criteria-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.criteria-card {
		display: grid;
		gap: 1.15rem;
		min-height: 150px;
		padding: 1.45rem;
		background: rgba(10, 12, 16, 0.95);
	}

	.criteria-card h3 {
		font-size: 1rem;
		line-height: 1;
		letter-spacing: 0 !important;
	}

	.panel-close {
		position: relative;
		width: 30px;
		height: 30px;
		border: 0;
		border-radius: 0;
		background: transparent;
		backdrop-filter: none;
		color: rgba(255, 255, 255, 0.72);
		cursor: pointer;
	}

	.panel-close span {
		display: none;
	}

	.panel-close::before,
	.panel-close::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 20px;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.panel-close::after {
		transform: translate(-50%, -50%) rotate(-45deg);
	}

	@media (max-width: 1080px) {
		.film-grid {
			grid-template-columns: 1fr;
			align-items: end;
			gap: 1.2rem;
			padding-top: 5.6rem;
		}

		.film-copy {
			order: 2;
			max-width: none;
		}

		.film-poster-wrap {
			order: 1;
			justify-content: flex-start;
		}

		.film-poster {
			width: min(34vw, 240px);
		}
	}

	@media (max-width: 800px) {
		.tonight-experience {
			--stage-height: 100dvh;
		}

		.tonight-experience,
		.quiz-stage,
		.results-stage,
		.film-slide,
		.film-grid {
			height: var(--stage-height);
		}

		.criteria-toggle {
			right: 14px;
			bottom: 0.9rem;
			padding-inline: 1rem;
		}

		.question-slide {
			padding-block: 0.75rem;
		}

		.question-card h2 {
			max-width: 15ch;
		}

		.criteria-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.quiz-stage {
			padding: 5.45rem 0.95rem calc(3.8rem + env(safe-area-inset-bottom));
		}

		.question-stepper {
			top: 50%;
			left: 0.55rem;
			grid-auto-flow: row;
			grid-template-columns: 28px;
			gap: 0.38rem;
			transform: translateY(-50%);
		}

		.question-card {
			padding: 0;
			width: calc(100% - 3.5rem);
			max-width: 23rem;
			margin-right: 0;
			margin-left: 3.25rem;
		}

		.question-options button,
		.criteria-options button {
			min-height: 38px;
			padding: 0.52rem 0.82rem;
			font-size: 0.76rem;
		}

		.quiz-header h1 {
			font-size: 1.35rem;
		}

		.question-card h2 {
			font-size: 1.28rem;
		}

		.film-grid {
			align-content: end;
			align-items: end;
			gap: 0;
			padding: 5.2rem 1rem calc(4rem + env(safe-area-inset-bottom));
		}

		.film-logo {
			max-width: min(15rem, 82vw);
			max-height: 56px;
		}

		.film-copy h2 {
			font-size: 1.65rem;
		}

		.film-summary {
			font-size: 0.76rem;
			line-height: 1.32;
			margin-top: 0.9rem;
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}

		.film-meta {
			margin-top: 0.85rem;
			gap: 0.32rem;
		}

		.film-meta span {
			min-height: 25px;
			padding: 0.28rem 0.46rem;
		}

		.film-credits {
			margin-top: 0.9rem;
		}

		.film-actions {
			margin-top: 1rem;
		}

		.film-poster-wrap {
			display: none;
		}

		.results-nav {
			top: 50%;
			right: 0.4rem;
			left: 0.4rem;
			bottom: auto;
			justify-content: space-between;
			transform: translateY(-50%);
			pointer-events: none;
		}

		.results-nav .nav-arrow {
			pointer-events: auto;
		}

		.quiz-nav {
			top: 50%;
			right: auto;
			bottom: auto;
			left: 0.25rem;
			flex-direction: column;
			justify-content: center;
			gap: min(24svh, 9rem);
			transform: translateY(-50%);
			pointer-events: auto;
		}

		.quiz-nav .nav-arrow {
			width: 38px;
			height: 38px;
		}

		.quiz-nav .chevron {
			width: 18px;
			height: 18px;
			border-width: 2px;
		}

		.quiz-nav .nav-arrow {
			pointer-events: auto;
		}

		.film-overlay {
			background:
				linear-gradient(
					180deg,
					rgba(5, 7, 11, 0.16) 0%,
					rgba(5, 7, 11, 0.38) 22%,
					rgba(5, 7, 11, 0.72) 54%,
					rgba(5, 7, 11, 0.92) 100%
				),
				rgba(5, 7, 11, 0.2);
		}

		.criteria-toggle {
			top: calc(4.4rem + env(safe-area-inset-top));
			right: 0.95rem;
			bottom: auto;
			min-height: 38px;
			padding: 0.58rem 0.82rem;
			font-size: 0.72rem;
			box-shadow: 0 14px 36px rgba(15, 39, 96, 0.32);
		}

		.stage-dots {
			left: 50%;
			bottom: calc(0.8rem + env(safe-area-inset-bottom));
			max-width: calc(100vw - 2rem);
			justify-content: center;
			gap: 0.34rem;
			transform: translateX(-50%);
		}

		.stage-dots span {
			width: 7px;
			height: 7px;
			border-radius: 999px;
		}

		.nav-arrow {
			width: 42px;
			height: 42px;
		}

		.criteria-layer {
			padding: 10px;
		}
	}

	@media (max-width: 640px) and (max-height: 700px) {
		.film-grid {
			padding-top: 4.6rem;
			padding-bottom: calc(3.35rem + env(safe-area-inset-bottom));
		}

		.film-logo {
			max-height: 44px;
		}

		.film-copy h2 {
			font-size: 1.42rem;
		}

		.film-summary {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.film-credits {
			display: none;
		}

		.film-actions {
			margin-top: 0.75rem;
		}
	}
</style>
