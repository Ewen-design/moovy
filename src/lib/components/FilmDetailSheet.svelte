<script>
	import { fly, fade } from 'svelte/transition';
	import { heroImage } from '$lib/data/catalog';

	let { film = null, similarMovies = [], onClose = () => {} } = $props();

	const handleBackdropClick = () => onClose();
	const handleCloseClick = () => onClose();
</script>

{#if film}
	<div
		class="sheet-backdrop"
		role="presentation"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 180 }}
	>
		<div
			class="sheet"
			role="dialog"
			aria-modal="true"
			aria-label={film.title}
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
			transition:fly={{ y: 80, duration: 260 }}
		>
			<div class="sheet-hero">
				<img src={heroImage} alt={film.title} />
				<div class="sheet-overlay"></div>
				<button class="close-button" type="button" aria-label="Fermer" onclick={handleCloseClick}>
					×
				</button>

				<div class="sheet-hero-copy">
					<h2>{film.title}</h2>
					<div class="sheet-actions">
						<button type="button">Lecture</button>
						<button type="button">+</button>
						<button type="button">♡</button>
					</div>
				</div>
			</div>

			<div class="sheet-body">
				<div class="sheet-main">
					<p class="meta">
						{film.year} · {film.duration} · {film.quality ?? 'HD'} · {film.maturity ?? '13+'}
					</p>
					<p class="summary">{film.summary ?? film.description}</p>

					<div class="cast-grid">
						{#each film.castMembers ?? [] as member}
							<article class="cast-card">
								<img src={member.image ?? heroImage} alt={member.name} loading="lazy" />
								<div>
									<h3>{member.name}</h3>
									<p>{member.role}</p>
								</div>
							</article>
						{/each}
					</div>
				</div>

				<aside class="sheet-side">
					<p><strong>Distribution :</strong> {film.cast.join(', ')}</p>
					<p><strong>Genres :</strong> {film.genres.join(', ')}</p>
					<p><strong>Realisateur :</strong> {film.director}</p>
					<p><strong>Note :</strong> {film.rating} · {film.votes}</p>
				</aside>
			</div>

			<div class="similar-section">
				<h3>Titres similaires</h3>
				<div class="similar-grid">
					{#each similarMovies as movie}
						<article class="similar-card">
							<img src={heroImage} alt={movie.title} loading="lazy" />
							<div class="similar-copy">
								<div class="similar-meta">
									<span>{movie.duration}</span>
									<span>{movie.year}</span>
								</div>
								<h4>{movie.title}</h4>
								<p>{movie.description}</p>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 80;
		padding: 24px;
		background: rgba(0, 0, 0, 0.72);
		overflow: auto;
	}

	.sheet {
		width: min(1240px, 100%);
		margin: auto;
		background: #181818;
		color: #ffffff;
		box-shadow: 0 30px 120px rgba(0, 0, 0, 0.45);
	}

	.sheet-hero {
		position: relative;
		height: min(60vw, 760px);
		min-height: 420px;
		overflow: hidden;
		background: #1d1d1d;
	}

	.sheet-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.sheet-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				180deg,
				rgba(0, 0, 0, 0.02) 0%,
				rgba(0, 0, 0, 0.12) 58%,
				rgba(24, 24, 24, 1) 100%
			),
			linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 52%);
	}

	.close-button {
		position: absolute;
		top: 18px;
		right: 18px;
		z-index: 1;
		width: 56px;
		height: 56px;
		border: 0;
		border-radius: 999px;
		background: rgba(24, 24, 24, 0.9);
		color: #ffffff;
		font-size: 2rem;
		cursor: pointer;
	}

	.sheet-hero-copy {
		position: absolute;
		left: 30px;
		right: 30px;
		bottom: 30px;
		z-index: 1;
	}

	.sheet-hero-copy h2 {
		margin: 0;
		max-width: 9ch;
		font-size: clamp(3rem, 7vw, 6rem);
		line-height: 0.92;
		letter-spacing: -0.06em;
	}

	.sheet-actions {
		display: flex;
		gap: 12px;
		margin-top: 1.5rem;
	}

	.sheet-actions button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 64px;
		height: 64px;
		padding: 0 1.4rem;
		border: 0;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		color: #ffffff;
		font-size: 1rem;
		font-weight: 600;
	}

	.sheet-actions button:first-child {
		background: #ffffff;
		color: #111111;
	}

	.sheet-body {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
		gap: 30px;
		padding: 28px 30px 22px;
	}

	.meta,
	.summary,
	.sheet-side p,
	.cast-card p,
	.similar-copy p,
	.similar-meta span {
		margin: 0;
	}

	.meta {
		font-size: 1rem;
		color: #c7c7c7;
	}

	.summary {
		margin-top: 1rem;
		max-width: 60ch;
		font-size: 1.1rem;
		line-height: 1.6;
		color: #f1f1f1;
	}

	.cast-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
		margin-top: 1.6rem;
	}

	.cast-card {
		background: #232323;
		overflow: hidden;
	}

	.cast-card img {
		width: 100%;
		aspect-ratio: 0.72;
		object-fit: cover;
		display: block;
	}

	.cast-card div {
		padding: 12px;
	}

	.cast-card h3,
	.similar-section h3,
	.similar-copy h4 {
		margin: 0;
	}

	.cast-card h3 {
		font-size: 1rem;
	}

	.cast-card p,
	.sheet-side p {
		margin-top: 0.35rem;
		font-size: 0.95rem;
		color: #c7c7c7;
		line-height: 1.5;
	}

	.similar-section {
		padding: 0 30px 30px;
	}

	.similar-section h3 {
		font-size: 2.2rem;
		letter-spacing: -0.04em;
	}

	.similar-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 22px;
		margin-top: 1.2rem;
	}

	.similar-card {
		background: #2c2c2c;
		overflow: hidden;
	}

	.similar-card img {
		width: 100%;
		aspect-ratio: 1.42;
		object-fit: cover;
		display: block;
	}

	.similar-copy {
		padding: 14px;
	}

	.similar-meta {
		display: flex;
		gap: 0.8rem;
		color: #c7c7c7;
	}

	.similar-copy h4 {
		margin-top: 0.6rem;
		font-size: 1.2rem;
	}

	.similar-copy p {
		margin-top: 0.7rem;
		font-size: 0.98rem;
		line-height: 1.55;
		color: #e2e2e2;
	}

	@media (max-width: 900px) {
		.sheet-backdrop {
			padding: 12px;
		}

		.sheet-body,
		.similar-grid,
		.cast-grid {
			grid-template-columns: 1fr;
		}

		.sheet-hero {
			min-height: 340px;
		}
	}
</style>
