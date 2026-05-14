<script>
	import { tick } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { heroImage } from '$lib/data/catalog';

	let { film = null, similarMovies = [], onClose = () => {}, onSelect = () => {} } = $props();
	/** @type {HTMLDivElement | null} */
	let backdrop = $state(null);

	const handleBackdropClick = () => onClose();
	const handleCloseClick = () => onClose();
	/** @param {{ id: string, genres: string[] }} movie */
	const handleSimilarSelect = (movie) => onSelect(movie);

	$effect(() => {
		if (!film) return;

		document.body.classList.add('sheet-open');
		tick().then(() => {
			backdrop?.scrollTo({ top: 0, behavior: 'auto' });
		});

		return () => {
			document.body.classList.remove('sheet-open');
		};
	});
</script>

{#if film}
	<div
		class="sheet-backdrop"
		bind:this={backdrop}
		role="presentation"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 180 }}
	>
		{#key film.id}
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
					<img
						src={film.backdrop ?? film.image ?? heroImage}
						alt={film.title}
						loading="lazy"
						decoding="async"
					/>
					<div class="sheet-overlay"></div>
					<button class="close-button" type="button" aria-label="Fermer" onclick={handleCloseClick}>
						<span class="close-icon" aria-hidden="true"></span>
					</button>

					<div class="sheet-hero-copy">
						{#if film.clearlogo}
							<img
								class="clearlogo"
								src={film.clearlogo}
								alt={film.title}
								loading="lazy"
								decoding="async"
							/>
						{:else}
							<h2>{film.title}</h2>
						{/if}
					</div>
				</div>

				<div class="sheet-body">
					<div class="sheet-main">
						<p class="meta">{film.year} · {film.duration} · {film.maturity ?? '13+'}</p>
						<p class="summary">{film.summary ?? film.description}</p>
						{#if film.trailerUrl}
							<a
								class="trailer-button"
								href={film.trailerUrl}
								target="_blank"
								rel="noreferrer"
							>
								Bande-annonce
							</a>
						{/if}

						<div class="cast-grid">
							{#each film.castMembers ?? [] as member}
								<article class="cast-card">
									<img
										src={member.image ?? '/photo.webp'}
										alt={member.name}
										loading="lazy"
										decoding="async"
									/>
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
					</aside>
				</div>

				<div class="similar-section">
					<h3>Titres similaires</h3>
					<div class="similar-grid">
						{#each similarMovies as movie}
							<button class="similar-card" type="button" onclick={() => handleSimilarSelect(movie)}>
								<div class="similar-visual">
									<img
										src={movie.backdrop ?? movie.image ?? heroImage}
										alt={movie.title}
										loading="lazy"
										decoding="async"
									/>
									<div class="similar-overlay"></div>
									<div class="similar-brand">
										{#if movie.clearlogo}
											<img
												class="similar-clearlogo"
												src={movie.clearlogo}
												alt={movie.title}
												loading="lazy"
												decoding="async"
											/>
										{:else}
											<h4>{movie.title}</h4>
										{/if}
									</div>
								</div>
								<div class="similar-copy">
									<div class="similar-meta">
										<span>{movie.duration}</span>
										<span>{movie.year}</span>
									</div>
									<p>{movie.description}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/key}
	</div>
{/if}

<style>
	:global(body.sheet-open) {
		overflow: hidden;
	}

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
		border-radius: 3px;
		background: var(--sheet-surface);
		color: var(--page-text);
		box-shadow: var(--sheet-shadow);
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease),
			box-shadow var(--theme-duration) var(--theme-ease);
	}

	.sheet-hero {
		position: relative;
		height: min(60vw, 760px);
		min-height: 420px;
		overflow: hidden;
		background: var(--surface-inverse);
		transition: background-color var(--theme-duration) var(--theme-ease);
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
				var(--sheet-gradient-end) 100%
			),
			linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 52%);
		transition: background var(--theme-duration) var(--theme-ease);
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 220ms ease,
			transform 220ms ease;
	}

	.close-button:hover {
		background: rgba(33, 33, 33, 0.96);
	}

	.close-icon {
		position: relative;
		width: 22px;
		height: 22px;
	}

	.close-icon::before,
	.close-icon::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 22px;
		height: 2px;
		border-radius: 999px;
		background: #ffffff;
		transform-origin: center;
		transition: transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.close-icon::before {
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.close-icon::after {
		transform: translate(-50%, -50%) rotate(-45deg);
	}

	.close-button:hover .close-icon::before {
		transform: translate(-50%, -50%) rotate(405deg);
	}

	.close-button:hover .close-icon::after {
		transform: translate(-50%, -50%) rotate(315deg);
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

	.clearlogo {
		display: block;
		max-width: min(440px, 62vw);
		max-height: 180px;
		object-fit: contain;
		object-position: left bottom;
		filter: drop-shadow(0 10px 32px rgba(0, 0, 0, 0.38));
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
		color: var(--muted-text-strong);
	}

	.summary {
		margin-top: 1rem;
		max-width: 60ch;
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--page-text);
	}

	.trailer-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 1rem;
		padding: 0.82rem 1.1rem;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.92rem;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 12px 28px rgba(47, 107, 255, 0.24);
		transition:
			background-color 220ms ease,
			box-shadow 220ms ease,
			transform 220ms ease;
	}

	.trailer-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 16px 34px rgba(47, 107, 255, 0.3);
	}

	.cast-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
		margin-top: 1.6rem;
	}

	.cast-card {
		border-radius: 3px;
		background: var(--sheet-block);
		overflow: hidden;
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			box-shadow var(--theme-duration) var(--theme-ease);
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
		color: var(--muted-text-strong);
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
		align-items: stretch;
	}

	.similar-card {
		display: grid;
		grid-template-rows: clamp(160px, 16vw, 220px) minmax(0, 1fr);
		border: 0;
		border-radius: 3px;
		background: var(--sheet-block);
		overflow: hidden;
		height: 100%;
		padding: 0;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 220ms ease,
			background-color var(--theme-duration) var(--theme-ease),
			box-shadow var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	.similar-visual {
		position: relative;
		overflow: hidden;
		background: #0d0d0f;
	}

	.similar-card:hover {
		background: var(--sheet-block-hover);
		box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
	}

	.similar-visual > img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.similar-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(8, 8, 10, 0.04) 0%, rgba(8, 8, 10, 0.16) 48%, rgba(8, 8, 10, 0.78) 100%),
			linear-gradient(90deg, rgba(8, 8, 10, 0.18) 0%, rgba(8, 8, 10, 0.04) 100%);
	}

	.similar-brand {
		position: absolute;
		left: 14px;
		right: 14px;
		bottom: 14px;
		z-index: 1;
	}

	.similar-brand h4 {
		margin: 0;
		font-size: 1.2rem;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #ffffff;
		text-shadow: 0 8px 22px rgba(0, 0, 0, 0.42);
	}

	.similar-clearlogo {
		display: block;
		max-width: min(180px, 100%);
		max-height: 58px;
		object-fit: contain;
		object-position: left bottom;
		filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.42));
	}

	.similar-copy {
		display: grid;
		align-content: start;
		padding: 14px;
		transition: color var(--theme-duration) var(--theme-ease);
	}

	.similar-meta {
		display: flex;
		gap: 0.8rem;
		color: var(--muted-text-strong);
	}

	.similar-copy h4 {
		margin-top: 0.6rem;
		font-size: 1.2rem;
	}

	.similar-copy p {
		margin-top: 0.7rem;
		font-size: 0.98rem;
		line-height: 1.55;
		color: var(--muted-text-strong);
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

	@media (max-width: 720px) {
		.trailer-button {
			margin-top: 0.9rem;
			padding: 0.74rem 0.98rem;
			font-size: 0.86rem;
		}

		.cast-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 8px;
			margin-top: 1.2rem;
		}

		.cast-card div {
			padding: 8px;
		}

		.cast-card h3 {
			font-size: 0.8rem;
			line-height: 1.15;
		}

		.cast-card p {
			margin-top: 0.22rem;
			font-size: 0.72rem;
			line-height: 1.25;
		}

		.similar-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 10px;
		}

		.similar-grid .similar-card:nth-child(n + 5) {
			display: none;
		}

		.similar-card {
			grid-template-rows: 132px minmax(0, 1fr);
		}

		.similar-brand {
			left: 10px;
			right: 10px;
			bottom: 10px;
		}

		.similar-brand h4 {
			font-size: 0.96rem;
		}

		.similar-clearlogo {
			max-height: 40px;
		}

		.similar-copy {
			padding: 10px;
		}

		.similar-meta {
			gap: 0.5rem;
			font-size: 0.74rem;
		}

		.similar-copy p {
			margin-top: 0.45rem;
			font-size: 0.8rem;
			line-height: 1.35;
		}
	}
</style>
