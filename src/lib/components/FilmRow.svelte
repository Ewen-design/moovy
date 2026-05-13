<script>
	import { heroImage } from '$lib/data/catalog';

	let { film, rank = null, detailed = false, onSelect = () => {} } = $props();

	const handleSelect = () => onSelect(film);
</script>

<button class:detailed class:ranked={rank} class="film-row" type="button" onclick={handleSelect}>
	<div class="poster-wrap">
		{#if rank}
			<span class="rank-backdrop" aria-hidden="true">{rank}</span>
		{/if}
		<img src={film.image ?? heroImage} alt={film.title} loading="lazy" decoding="async" />
	</div>

	<div class="film-copy">
		<h3>{film.title}</h3>
		<p class="meta">{film.year} · {film.duration} · {film.genres.join(', ')}</p>
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

	.film-row.ranked {
		grid-template-columns: 196px minmax(0, 1fr) auto;
		padding-left: 188px;
	}

	.poster-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		min-width: 0;
		overflow: visible;
	}

	.film-row.ranked .poster-wrap {
		--rank-gap: 4.8rem;
		--rank-overlap: 0.78rem;
		justify-content: flex-start;
		padding-left: var(--rank-gap);
	}

	.poster-wrap img {
		width: 100%;
		aspect-ratio: 3 / 4.2;
		object-fit: cover;
		display: block;
		position: relative;
		z-index: 1;
	}

	.rank-backdrop {
		position: absolute;
		right: calc(100% - (var(--rank-gap) + var(--rank-overlap)));
		top: 50%;
		z-index: 0;
		transform: translateY(-50%);
		font-size: clamp(6.7rem, 10vw, 10rem);
		line-height: 0.82;
		font-weight: 900;
		letter-spacing: -0.56em;
		color: var(--rank-number);
		text-shadow:
			1px 0 0 var(--rank-number-stroke),
			-1px 0 0 var(--rank-number-stroke),
			0 1px 0 var(--rank-number-stroke),
			0 -1px 0 var(--rank-number-stroke),
			1px 1px 0 var(--rank-number-stroke),
			-1px -1px 0 var(--rank-number-stroke),
			1px -1px 0 var(--rank-number-stroke),
			-1px 1px 0 var(--rank-number-stroke);
		pointer-events: none;
		white-space: nowrap;
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

		.film-row.ranked,
		.film-row.ranked.detailed {
			grid-template-columns: 136px minmax(0, 1fr);
			padding-left: 108px;
		}

		.film-row.ranked .poster-wrap {
			--rank-gap: 2.9rem;
			--rank-overlap: 0.46rem;
			padding-left: var(--rank-gap);
		}

		.rank-backdrop {
			font-size: clamp(4.8rem, 16vw, 6.6rem);
		}

		.row-action {
			grid-column: 2;
			justify-self: flex-start;
			margin-top: 0.8rem;
		}
	}
</style>
