<script>
	import { onMount } from 'svelte';
	import FilmDetailSheet from '$lib/components/FilmDetailSheet.svelte';
	import FilmRow from '$lib/components/FilmRow.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { getSimilarMovies, recommendationMovies, top100Movies } from '$lib/data/catalog';
	import { hydrateMoviePosters } from '$lib/posters';

	const quizMovies = [...recommendationMovies, ...top100Movies].filter(
		(movie, index, list) => index === list.findIndex((item) => item.title === movie.title)
	);

	const questions = [
		{
			id: 'mood',
			label: 'Ambiance',
			question: 'Tu veux quelle ambiance ce soir ?',
			options: [
				{ value: 'intense', label: 'Intense', genres: ['Thriller', 'Action'] },
				{ value: 'emotional', label: 'Émotive', genres: ['Drame', 'Romance'] },
				{ value: 'spectacle', label: 'Spectacle', genres: ['Science-fiction', 'Action'] }
			]
		},
		{
			id: 'pace',
			label: 'Rythme',
			question: 'Tu veux quel rythme ?',
			options: [
				{ value: 'fast', label: 'Rapide', maxDuration: 130 },
				{ value: 'balanced', label: 'Équilibré', maxDuration: 150 },
				{ value: 'long', label: 'Prendre le temps', minDuration: 140 }
			]
		},
		{
			id: 'era',
			label: 'Époque',
			question: 'Tu préfères quelle période ?',
			options: [
				{ value: 'classic', label: 'Classique', maxYear: 1999 },
				{ value: 'modern', label: 'Moderne', minYear: 2000 },
				{ value: 'recent', label: 'Très récent', minYear: 2018 }
			]
		},
		{
			id: 'tone',
			label: 'Tonalité',
			question: 'Quelle tonalité te tente ?',
			options: [
				{ value: 'dark', label: 'Sombre', genres: ['Thriller', 'Crime'] },
				{ value: 'uplift', label: 'Lumineuse', genres: ['Comedie', 'Romance'] },
				{ value: 'epic', label: 'Épique', genres: ['Aventure', 'Science-fiction', 'Action'] }
			]
		},
		{
			id: 'familiarity',
			label: 'Découverte',
			question: 'Tu veux du très connu ou plus pointu ?',
			options: [
				{ value: 'popular', label: 'Très connu', minVotes: 1.5 },
				{ value: 'mixed', label: 'Un mélange', minVotes: 0.8 },
				{ value: 'curious', label: 'Plus pointu', maxVotes: 1.2 }
			]
		},
		{
			id: 'ending',
			label: 'Effet final',
			question: 'Tu veux finir la séance comment ?',
			options: [
				{ value: 'thinking', label: 'En y pensant encore', genres: ['Science-fiction', 'Drame'] },
				{ value: 'shocked', label: 'Secoué', genres: ['Thriller', 'Psychologique'] },
				{ value: 'satisfied', label: 'Satisfait', genres: ['Drame', 'Action', 'Comedie'] }
			]
		}
	];

	/** @type {Record<string, { value: string, label: string, genres?: string[], maxDuration?: number, minDuration?: number, minYear?: number, maxYear?: number, minVotes?: number, maxVotes?: number }>} */
	let answers = $state({});
	let heroVersion = $state(0);
	/** @type {{ id: string, title: string, genres: string[] } | null} */
	let selectedFilm = $state(null);

	const heroMovies = [top100Movies[18], top100Movies[34]];
	const heroSlides = $derived.by(() => {
		heroVersion;
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

	/** @param {typeof quizMovies[number]} movie */
	function scoreMovie(movie) {
		let score = 0;
		for (const question of questions) {
			const answer = answers[question.id];
			if (!answer) continue;
			if (answer.genres?.some((genre) => movie.genres.includes(genre))) score += 3;
			const minutes = durationToMinutes(movie.duration);
			if (answer.maxDuration && minutes <= answer.maxDuration) score += 2;
			if (answer.minDuration && minutes >= answer.minDuration) score += 2;
			if (answer.minYear && movie.year >= answer.minYear) score += 2;
			if (answer.maxYear && movie.year <= answer.maxYear) score += 2;
			const votes = votesToNumber(movie.votes);
			if (answer.minVotes && votes >= answer.minVotes * 1_000_000) score += 1.5;
			if (answer.maxVotes && votes <= answer.maxVotes * 1_000_000) score += 1.5;
		}
		return score + Number.parseFloat(String(movie.rating).replace(',', '.'));
	}

	const selectedCount = $derived(Object.keys(answers).length);
	const suggestedMovies = $derived.by(() =>
		[...quizMovies]
			.sort((left, right) => scoreMovie(right) - scoreMovie(left))
			.slice(0, selectedCount === questions.length ? 10 : 0)
	);

	/** @param {typeof quizMovies[number]} film */
	const openFilm = (film) => {
		selectedFilm = film;
		hydrateMoviePosters([film, ...getSimilarMovies(quizMovies, film, 6)]);
	};

	const closeFilm = () => {
		selectedFilm = null;
	};

	onMount(() => {
		(async () => {
			await hydrateMoviePosters([...quizMovies, ...heroMovies]);
			heroVersion += 1;
		})();
	});
</script>

<svelte:head>
	<title>Moovy | Pour ce soir</title>
</svelte:head>

<div class="tonight-page">
	<PageHero compact={true} fullBleed={true} slides={heroSlides} />

	<section class="tonight-shell" id="quiz">
		<div class="tonight-head">
			<h2>Réponds à 6 questions pour sortir une sélection de 10 films.</h2>
			<p>{selectedCount}/6 réponses validées</p>
		</div>

		<div class="quiz-grid">
			{#each questions as question}
				<section class="question-card">
					<span>{question.label}</span>
					<h3>{question.question}</h3>
					<div class="option-row">
						{#each question.options as option}
							<button
								class:active={answers[question.id]?.value === option.value}
								type="button"
								onclick={() => (answers = { ...answers, [question.id]: option })}
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
					<p>10 films triés selon tes réponses.</p>
				</div>

				<div class="film-list">
					{#each suggestedMovies as film}
						<FilmRow {film} onSelect={openFilm} />
					{/each}
				</div>
			</section>
		{/if}
	</section>

	<FilmDetailSheet
		film={selectedFilm}
		similarMovies={selectedFilm ? getSimilarMovies(quizMovies, selectedFilm, 6) : []}
		onClose={closeFilm}
		onSelect={openFilm}
	/>
</div>

<style>
	.tonight-page {
		display: grid;
		gap: 42px;
	}

	.tonight-shell {
		display: grid;
		gap: 22px;
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
	.question-card h3,
	.question-card span {
		margin: 0;
	}

	.tonight-head h2,
	.results-head h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.05em;
		max-width: 18ch;
	}

	.tonight-head p,
	.results-head p,
	.question-card span {
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

	.question-card span {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
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

	.results,
	.film-list {
		display: grid;
		gap: 12px;
	}

	@media (max-width: 800px) {
		.quiz-grid {
			grid-template-columns: 1fr;
		}

		.tonight-head,
		.results-head {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
