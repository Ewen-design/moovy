<script>
	import { heroImage } from '$lib/data/catalog';

	let { film, rank = null, detailed = false, onSelect = () => {} } = $props();

	const handleSelect = () => onSelect(film);
</script>

<button class:detailed class="film-row" type="button" onclick={handleSelect}>
	<div class="poster-wrap">
		<img src={film.image ?? heroImage} alt={film.title} loading="lazy" decoding="async" />
		{#if rank}
			<span class="rank-chip">#{rank}</span>
		{/if}
	</div>

	<div class="film-copy">
		<h3>{film.title}</h3>
		<p class="meta">{film.year} · {film.duration} · {film.genres.join(', ')}</p>
		<p class="rating">★ {film.rating} · {film.votes}</p>
		{#if detailed}
			<p class="description">{film.editorial}</p>
			<p class="credits">De {film.director} · Avec {film.cast.join(', ')}</p>
		{:else}
			<p class="description">{film.description}</p>
		{/if}
	</div>

	<span class="row-action">Voir</span>
</button>

<style>
	.film-row {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr) auto;
		gap: 16px;
		align-items: center;
		width: 100%;
		padding: 14px 18px;
		background: var(--surface-card);
		border: 0;
		color: var(--page-text);
		cursor: pointer;
		text-align: left;
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	.film-row.detailed {
		grid-template-columns: 120px minmax(0, 1fr) auto;
		padding: 18px;
	}

	.poster-wrap {
		position: relative;
	}

	.poster-wrap img {
		width: 100%;
		aspect-ratio: 3 / 4.2;
		object-fit: cover;
		display: block;
	}

	.rank-chip {
		position: absolute;
		top: 8px;
		left: 8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.35rem 0.6rem;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.86rem;
		font-weight: 700;
	}

	h3,
	p {
		margin: 0;
	}

	h3 {
		font-size: clamp(1.2rem, 2vw, 1.9rem);
		line-height: 1.02;
		letter-spacing: -0.04em;
	}

	.meta,
	.rating,
	.credits {
		margin-top: 0.35rem;
		font-size: 0.96rem;
		color: var(--muted-text-strong);
		transition: color var(--theme-duration) var(--theme-ease);
	}

	.description {
		margin-top: 0.55rem;
		max-width: 76ch;
		font-size: 0.98rem;
		line-height: 1.45;
		color: var(--page-text);
		transition: color var(--theme-duration) var(--theme-ease);
	}

	.row-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.15rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: var(--accent-blue);
		color: #ffffff;
		font-size: 0.92rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease;
	}

	@media (max-width: 720px) {
		.film-row,
		.film-row.detailed {
			grid-template-columns: 78px minmax(0, 1fr);
			padding: 12px;
		}

		.row-action {
			grid-column: 2;
			justify-self: flex-start;
			margin-top: 0.8rem;
		}
	}
</style>
