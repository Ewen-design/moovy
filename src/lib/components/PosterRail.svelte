<script>
	import { onMount } from 'svelte';
	import { heroImage } from '$lib/data/catalog';

	let {
		items = [],
		title = '',
		dark = false,
		variant = 'large',
		centerActive = false,
		onSelect = () => {}
	} = $props();

	/** @type {HTMLDivElement | undefined} */
	let viewport;
	/** @type {HTMLDivElement | undefined} */
	let track;
	let cardWidth = $state(0);
	let viewportWidth = $state(0);
	let gap = $state(0);
	let index = $state(0);
	let instant = $state(false);

	const clonedItems = $derived([...items, ...items.slice(0, 6)]);

	const measure = () => {
		if (!track) return;
		const firstCard = /** @type {HTMLElement | null} */ (track.querySelector('.rail-card'));
		if (!firstCard) return;
		cardWidth = firstCard.offsetWidth;
		viewportWidth = viewport?.offsetWidth ?? 0;
		const style = getComputedStyle(track);
		gap = Number.parseFloat(style.columnGap || style.gap || '0');
	};

	const offset = $derived(centerActive ? Math.max(0, (viewportWidth - cardWidth) / 2) : 0);

	const step = () => {
		if (!items.length) return;
		instant = false;
		index += 1;
	};

	const handleTransitionEnd = () => {
		if (index < items.length) return;
		instant = true;
		index = 0;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				instant = false;
			});
		});
	};

	onMount(() => {
		measure();
		const resizeObserver = new ResizeObserver(() => measure());
		if (viewport) resizeObserver.observe(viewport);
		const interval = setInterval(step, 3600);

		return () => {
			resizeObserver.disconnect();
			clearInterval(interval);
		};
	});
</script>

<section class:dark class={`poster-rail ${variant}`} aria-label={title || 'Selection'}>
	{#if title}
		<h3>{title}</h3>
	{/if}

	<div class="rail-viewport" bind:this={viewport}>
		<div
			class:instant
			class="rail-track"
			bind:this={track}
			ontransitionend={handleTransitionEnd}
			style={`transform: translate3d(-${Math.max(0, index * (cardWidth + gap) - offset)}px, 0, 0);`}
		>
			{#each clonedItems as item}
				<button class="rail-card" type="button" onclick={() => onSelect(item)}>
					<img
						src={item.image ?? heroImage}
						alt={item.title}
						loading="lazy"
						decoding="async"
					/>
					<div class="rail-overlay"></div>
					<div class="rail-copy">
						{#if item.tag}
							<span>{item.tag}</span>
						{/if}
						<strong>{item.title}</strong>
					</div>
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.poster-rail {
		display: grid;
		gap: 12px;
	}

	.poster-rail.dark {
		color: #ffffff;
	}

	h3 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.rail-viewport {
		overflow: hidden;
	}

	.rail-track {
		display: flex;
		gap: 8px;
		transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.rail-track.instant {
		transition: none;
	}

	.rail-card {
		position: relative;
		flex: 0 0 auto;
		padding: 0;
		border: 0;
		background: #151515;
		overflow: hidden;
		cursor: pointer;
	}

	.poster-rail.small .rail-card {
		width: clamp(172px, 14vw, 246px);
		height: clamp(98px, 8vw, 140px);
	}

	.poster-rail.medium .rail-card {
		width: clamp(320px, 23vw, 460px);
		height: clamp(180px, 13vw, 250px);
	}

	.poster-rail.large .rail-card {
		width: clamp(680px, 48vw, 980px);
		height: clamp(382px, 29vw, 552px);
	}

	.rail-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.rail-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(8, 8, 8, 0.02) 0%, rgba(8, 8, 8, 0.38) 100%),
			linear-gradient(90deg, rgba(8, 8, 8, 0.18) 0%, rgba(8, 8, 8, 0.02) 100%);
	}

	.rail-copy {
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 10px;
		z-index: 1;
		display: grid;
		gap: 0.2rem;
		color: #ffffff;
		text-align: left;
	}

	.rail-copy span {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.88;
	}

	.poster-rail.small .rail-copy strong {
		font-size: 1rem;
	}

	.poster-rail.medium .rail-copy strong {
		font-size: 1.2rem;
		line-height: 0.96;
		letter-spacing: -0.03em;
	}

	.poster-rail.large .rail-copy strong {
		font-size: 1.55rem;
		line-height: 0.94;
		letter-spacing: -0.04em;
	}

	@media (max-width: 640px) {
		.poster-rail.small .rail-card {
			width: 42vw;
			height: 24vw;
		}

		.poster-rail.medium .rail-card {
			width: 62vw;
			height: 36vw;
		}

		.poster-rail.large .rail-card {
			width: 86vw;
			height: 49vw;
		}
	}
</style>
