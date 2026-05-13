<script>
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, tonightMoviePool, top100Movies } from '$lib/data/catalog';
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
			label: 'Époque',
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
				{ value: 'action', label: 'Action', genres: ['Action', 'Aventure', 'Thriller', 'Crime', 'Psychologique'] },
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
				{ value: 'spectacular', label: 'Spectaculaire', genres: ['Action', 'Aventure', 'Science-fiction'] },
				{ value: 'light', label: 'Légère', genres: ['Comedie', 'Romance'] },
				{ value: 'thoughtful', label: 'Qui fait réfléchir', genres: ['Science-fiction', 'Drame', 'Mystere'] }
			]
		}
	];

	const criterionPriority = ['genre', 'duration', 'era', 'mood'];
	const fallbackPriority = ['genre', 'era', 'duration', 'mood'];

	/** @type {Record<string, { value: string, label: string, genres?: string[], maxDuration?: number, minDuration?: number, minYear?: number, maxYear?: number, minVotes?: number, maxVotes?: number }[]>} */
	let answers = $state({});
	let heroVersion = $state(0);
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	const heroMovies = $derived.by(() => {
		$posterVersion;
		return top100Movies.filter((movie) =>
			['Whiplash', 'The Wolf of Wall Street'].includes(movie.title)
		);
	});
	const heroSlides = $derived.by(() => {
		heroVersion;
		$posterVersion;
		return heroMovies.map((movie, index) => ({
			title: movie.title,
			logo: movie.clearlogo,
			image: movie.backdrop ?? movie.image,
			button: 'Découvrir',
			href: '#quiz',
			tint: index === 0 ? 'tint-blue' : 'tint-silver'
		}));
	});

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

			const bestQuestionScore = Math.max(...selectedOptions.map((option) => scoreOption(movie, option)));
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

	const answeredQuestions = $derived(questions.filter((question) => (answers[question.id] ?? []).length > 0).length);
	const suggestedMovies = $derived.by(() => {
		$posterVersion;
		if (!answeredQuestions) return [];

		const activeCriteria = criterionPriority.filter((questionId) => (answers[questionId] ?? []).length > 0);
		const rankedMovies = tonightMoviePool
			.map((movie) => ({ movie, data: scoreMovie(movie) }))
			.sort((left, right) => {
				for (const questionId of criterionPriority) {
					if (left.data.matches[questionId] !== right.data.matches[questionId]) {
						return Number(right.data.matches[questionId]) - Number(left.data.matches[questionId]);
					}
				}
				if (right.data.score !== left.data.score) {
					return right.data.score - left.data.score;
				}
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

		const fallbackCriteria = fallbackPriority.filter((questionId) => (answers[questionId] ?? []).length > 0);
		const fallbackRankedMovies = rankedMovies
			.filter(({ data }) => fallbackCriteria.some((questionId) => data.matches[questionId]))
			.sort((left, right) => {
				for (const questionId of fallbackPriority) {
					if (!fallbackCriteria.includes(questionId)) continue;
					if (left.data.matches[questionId] !== right.data.matches[questionId]) {
						return Number(right.data.matches[questionId]) - Number(left.data.matches[questionId]);
					}
				}
				if (right.data.score !== left.data.score) {
					return right.data.score - left.data.score;
				}
				if (Boolean(left.movie.rank) !== Boolean(right.movie.rank)) {
					return Number(Boolean(right.movie.rank)) - Number(Boolean(left.movie.rank));
				}
				return left.data.rank - right.data.rank;
			});

		return (fallbackRankedMovies.length ? fallbackRankedMovies : rankedMovies)
			.slice(0, 3)
			.map(({ movie }) => movie);
	});

	/**
	 * @param {string} questionId
	 * @param {{ value: string }} option
	 */
	function toggleOption(questionId, option) {
		const currentOptions = answers[questionId] ?? [];
		const hasOption = currentOptions.some((entry) => entry.value === option.value);
		answers = {
			...answers,
			[questionId]: hasOption
				? currentOptions.filter((entry) => entry.value !== option.value)
				: [...currentOptions, option]
		};
	}

	/** @param {typeof tonightMoviePool[number]} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(tonightMoviePool, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	onMount(() => {
		(async () => {
			await hydrateMoviePosters([...tonightMoviePool, ...heroMovies]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Pour ce soir</title>
</svelte:head>

<div class="tonight-page">
	<PageHero
		compact={true}
		fullBleed={true}
		overlayBottom={true}
		imageOverlay="vertical"
		slides={heroSlides}
	/>

	<section class="tonight-shell" id="quiz">
		<div class="tonight-head">
			<h2>Trouve ton film</h2>
			<p>{answeredQuestions}/4 critères renseignés</p>
		</div>

		<div class="quiz-grid">
			{#each questions as question}
				<section class="question-card">
					<h3>{question.question}</h3>
					<div class="option-row">
						{#each question.options as option}
							<button
								class:active={(answers[question.id] ?? []).some((entry) => entry.value === option.value)}
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

		{#if suggestedMovies.length}
			<section class="results">
				<div class="results-head">
					<h2>Ta sélection pour ce soir</h2>
					<p>Top 10 du top 100 selon tes critères.</p>
				</div>

				<div class="film-list">
					{#each suggestedMovies as film}
						<FilmRow {film} mobileCard={true} onSelect={openFilm} />
					{/each}
				</div>
			</section>
		{/if}
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(tonightMoviePool, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.tonight-page {
		display: grid;
		gap: 144px;
	}

	.tonight-shell {
		display: grid;
		gap: 48px;
	}

	.tonight-head,
	.results-head {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}

	.tonight-head h2,
	.tonight-head p,
	.results-head h2,
	.results-head p,
	.question-card h3 {
		margin: 0;
	}

	.tonight-head h2,
	.results-head h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
		max-width: 18ch;
	}

	.results-head h2 {
		max-width: none;
		white-space: nowrap;
	}

	.tonight-head p,
	.results-head p {
		color: var(--muted-text);
	}

	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.question-card {
		display: grid;
		gap: 1rem;
		padding: 22px;
		background: var(--surface-card);
	}

	.question-card h3 {
		font-size: 1.35rem;
		letter-spacing: -0.03em;
	}

	.option-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
	}

	.option-row button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0.9rem 1.15rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.option-row button.active {
		background: #ffffff;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
	}

	:global(body.theme-dark) .option-row button.active {
		background: #05070a;
		color: var(--accent-blue);
		border-color: var(--accent-blue);
	}

	.results,
	.film-list {
		display: grid;
		gap: 12px;
	}

	@media (max-width: 800px) {
		.tonight-page {
			gap: 72px;
		}

		.tonight-shell {
			gap: 32px;
		}

		.quiz-grid {
			grid-template-columns: 1fr;
		}

		.tonight-head,
		.results-head {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 640px) {
		.question-card {
			padding: 18px 16px;
		}

		.question-card h3 {
			font-size: 1.2rem;
		}

		.option-row {
			gap: 0.55rem;
		}

		.option-row button {
			width: 100%;
			justify-content: flex-start;
			padding: 0.88rem 1rem;
		}
	}
</style>
