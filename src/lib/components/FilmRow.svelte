<script>
	import { heroImage } from '$lib/data/catalog';

	let {
		film,
		rank = null,
		detailed = false,
		mobileCard = false,
		mobileExpanded = false,
		onSelect = () => {}
	} = $props();

	const handleSelect = () => onSelect(film);
</script>

<button
	class:detailed
	class:ranked={rank}
	class:mobile-card={mobileCard}
	class:mobile-expanded={mobileExpanded}
	class="film-row"
	type="button"
	onclick={handleSelect}
>
	<div class="poster-wrap">
		{#if rank}
			<span class="rank-backdrop" aria-hidden="true">{rank}</span>
		{/if}
		<img src={film.image ?? heroImage} alt={film.title} loading="lazy" decoding="async" />
	</div>

	<div class="content-stack">
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
	</div>
</button>

<style>
	.film-row {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		gap: 16px;
		align-items: center;
		width: 100%;
		padding: 14px 18px;
		background: var(--surface-card);
		border: 0;
		border-radius: 3px;
		color: var(--page-text);
		cursor: pointer;
		text-align: left;
		transition:
			background-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	.film-copy {
		min-width: 0;
	}

	.content-stack {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		min-width: 0;
	}

	.film-row.detailed {
		grid-template-columns: 120px minmax(0, 1fr);
		padding: 18px;
	}

	.film-row.ranked {
		grid-template-columns: 196px minmax(0, 1fr);
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
		border-radius: 3px;
	}

	.rank-backdrop {
		position: absolute;
		right: calc(100% - (var(--rank-gap) + var(--rank-overlap)));
		top: 50%;
		z-index: 0;
		transform: translateY(-50%);
		font-family: var(--font-body);
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

	@media (min-width: 721px) {
		.rank-backdrop {
			text-shadow: none;
		}
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
		font-weight: 300;
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
		font-weight: 500;
		text-decoration: none;
		transition:
			background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (max-width: 720px) {
		.film-row,
		.film-row.detailed {
			grid-template-columns: 78px minmax(0, 1fr);
			padding: 12px;
			align-items: start;
		}

		.content-stack {
			grid-template-columns: 1fr;
			align-items: start;
			gap: 0.8rem;
		}

		.film-row.ranked,
		.film-row.ranked.detailed {
			position: relative;
			grid-template-columns: 148px minmax(0, 1fr);
			gap: 14px;
			padding: 14px 12px;
			align-items: center;
		}

		.film-row.ranked .poster-wrap {
			padding-left: 0;
			align-self: center;
			justify-content: center;
		}

		.film-row.ranked .content-stack {
			display: grid;
			grid-template-columns: 1fr;
			align-content: center;
			align-self: center;
			gap: 0.7rem;
			min-height: 0;
		}

		.film-row.ranked .film-copy {
			display: grid;
			gap: 0.72rem;
		}

		.film-row.ranked .meta,
		.film-row.ranked .credits,
		.film-row.ranked .description {
			margin-top: 0;
			line-height: 1.48;
		}

		.film-row.ranked h3 {
			line-height: 1.12;
		}

		.film-row.ranked .poster-wrap img {
			width: 148px;
			max-width: 100%;
		}

		.film-row.ranked .rank-backdrop {
			top: 10px;
			left: 10px;
			right: auto;
			transform: none;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 34px;
			height: 34px;
			padding: 0 8px;
			border-radius: 3px;
			background: var(--accent-blue);
			color: #ffffff;
			font-size: 0.92rem;
			font-weight: 800;
			letter-spacing: -0.04em;
			line-height: 1;
			text-shadow: none;
			box-shadow: 0 10px 22px rgba(47, 107, 255, 0.34);
			z-index: 3;
		}

		.row-action {
			justify-self: flex-start;
			margin-top: 0;
		}

		.film-row.ranked .row-action {
			margin-top: 0.38rem;
		}

		.film-row.mobile-card,
		.film-row.mobile-card.detailed {
			grid-template-columns: 132px minmax(0, 1fr);
			gap: 14px;
			padding: 14px 12px;
			align-items: center;
		}

		.film-row.mobile-card .poster-wrap {
			align-self: center;
			justify-content: center;
		}

		.film-row.mobile-card .poster-wrap img {
			width: 132px;
			max-width: 100%;
		}

		.film-row.mobile-card .content-stack {
			grid-template-columns: 1fr;
			align-content: center;
			align-self: center;
			gap: 0.62rem;
			min-height: 0;
		}

		.film-row.mobile-card .film-copy {
			display: grid;
			gap: 0.58rem;
		}

		.film-row.mobile-card .meta,
		.film-row.mobile-card .credits,
		.film-row.mobile-card .description {
			margin-top: 0;
			line-height: 1.42;
		}

		.film-row.mobile-card .row-action {
			margin-top: 0.28rem;
		}

		.film-row.mobile-card.mobile-expanded,
		.film-row.mobile-card.mobile-expanded.detailed {
			grid-template-columns: 144px minmax(0, 1fr);
			gap: 16px;
			padding: 15px 13px;
		}

		.film-row.mobile-card.mobile-expanded .poster-wrap img {
			width: 144px;
		}

		.film-row.mobile-card.mobile-expanded .content-stack {
			gap: 0.68rem;
		}

		.film-row.mobile-card.mobile-expanded .film-copy {
			gap: 0.62rem;
		}
	}

	@media (max-width: 480px) {
		.film-row,
		.film-row.detailed {
			grid-template-columns: 64px minmax(0, 1fr);
			gap: 12px;
			padding: 10px;
		}

		.film-row.ranked,
		.film-row.ranked.detailed {
			grid-template-columns: 136px minmax(0, 1fr);
			gap: 12px;
			padding: 12px 9px;
			align-items: center;
		}

		.film-row.ranked .poster-wrap {
			padding-left: 0;
		}

		.film-row.ranked .poster-wrap img {
			width: 136px;
		}

		.film-row.ranked .content-stack {
			display: grid;
			grid-template-columns: 1fr;
			align-content: center;
			align-self: center;
			gap: 0.6rem;
		}

		.film-row.ranked .film-copy {
			display: grid;
			gap: 0.68rem;
		}

		.film-row.ranked .meta,
		.film-row.ranked .credits,
		.film-row.ranked .description {
			margin-top: 0;
			line-height: 1.44;
		}

		.film-row.ranked h3 {
			line-height: 1.1;
		}

		.film-row.ranked .rank-backdrop {
			top: 8px;
			left: 8px;
			min-width: 30px;
			height: 30px;
			padding: 0 7px;
			border-radius: 3px;
			font-size: 0.84rem;
		}

		h3 {
			font-size: 1.05rem;
		}

		.meta,
		.credits,
		.description {
			font-size: 0.88rem;
		}

		.row-action {
			min-height: 40px;
			padding: 0.72rem 1rem;
			font-size: 0.86rem;
		}

		.film-row.ranked .row-action {
			margin-top: 0.32rem;
		}

		.film-row.mobile-card,
		.film-row.mobile-card.detailed {
			grid-template-columns: 120px minmax(0, 1fr);
			gap: 12px;
			padding: 12px 10px;
			align-items: center;
		}

		.film-row.mobile-card .poster-wrap img {
			width: 120px;
		}

		.film-row.mobile-card .content-stack {
			grid-template-columns: 1fr;
			align-content: center;
			align-self: center;
			gap: 0.56rem;
		}

		.film-row.mobile-card .film-copy {
			display: grid;
			gap: 0.54rem;
		}

		.film-row.mobile-card .meta,
		.film-row.mobile-card .credits,
		.film-row.mobile-card .description {
			margin-top: 0;
			line-height: 1.38;
		}

		.film-row.mobile-card .row-action {
			margin-top: 0.24rem;
		}

		.film-row.mobile-card.mobile-expanded,
		.film-row.mobile-card.mobile-expanded.detailed {
			grid-template-columns: 130px minmax(0, 1fr);
			gap: 13px;
			padding: 13px 10px;
		}

		.film-row.mobile-card.mobile-expanded .poster-wrap img {
			width: 130px;
		}

		.film-row.mobile-card.mobile-expanded .content-stack {
			gap: 0.6rem;
		}

		.film-row.mobile-card.mobile-expanded .film-copy {
			gap: 0.58rem;
		}

	}
</style>
