<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { heroImage } from '$lib/data/catalog';

	let {
		items = [],
		title = '',
		dark = false,
		variant = 'large',
		orientation = 'landscape',
		density = 'default',
		overlayStyle = 'default',
		layout = 'default',
		showCardCopy = true,
		enableHoverPreview = true,
		pauseOnHover = true,
		autoAdvance = true,
		desktopScrollable = false,
		centerActive = false,
		onSelect = () => {}
	} = $props();

	const previewDelayMs = 1000;
	const scrollSettleDelayMs = 180;

	/** @type {HTMLDivElement | undefined} */
	let railRoot;
	/** @type {HTMLDivElement | undefined} */
	let viewport;
	/** @type {HTMLDivElement | undefined} */
	let track;
	let cardWidth = $state(0);
	let viewportWidth = $state(0);
	let gap = $state(0);
	let index = $state(0);
	let instant = $state(false);
	let isMobileViewport = $state(false);
	let paused = $state(false);
	let previewVisible = $state(false);
	let previewItem = $state(null);
	let previewStyle = $state('');
	let hoverTimer = null;
	let previewUnmountTimer = null;
	let scrollSettleTimer = null;
	let suppressHoverUntil = 0;
	let hoveredCard = null;
	let hoveredItem = null;

	const isScrollable = $derived(isMobileViewport || desktopScrollable);
	const useInfiniteTrack = $derived(!isScrollable && autoAdvance);
	const renderedItems = $derived(useInfiniteTrack ? [...items, ...items] : items);

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
		if (!items.length || paused || !useInfiniteTrack) return;
		instant = false;
		index += 1;
	};

	const clearHoverTimer = () => {
		if (!hoverTimer) return;
		clearTimeout(hoverTimer);
		hoverTimer = null;
	};

	const clearPreviewUnmountTimer = () => {
		if (!previewUnmountTimer) return;
		clearTimeout(previewUnmountTimer);
		previewUnmountTimer = null;
	};

	const clearScrollSettleTimer = () => {
		if (!scrollSettleTimer) return;
		clearTimeout(scrollSettleTimer);
		scrollSettleTimer = null;
	};

	const suppressHover = (delay = scrollSettleDelayMs) => {
		suppressHoverUntil = Date.now() + delay;
	};

	const hidePreview = () => {
		clearHoverTimer();
		clearPreviewUnmountTimer();
		previewVisible = false;
		previewUnmountTimer = setTimeout(() => {
			previewItem = null;
			previewUnmountTimer = null;
		}, 520);
	};

	/**
	 * @param {{ title: string, image?: string | null, backdrop?: string | null, clearlogo?: string | null, duration?: string, year?: number, description?: string }} item
	 * @param {EventTarget | null} target
	 */
	const showPreview = (item, target) => {
		if (!railRoot || !(target instanceof HTMLElement)) return;
		clearPreviewUnmountTimer();
		const rootRect = railRoot.getBoundingClientRect();
		const previewAnchor =
			layout === 'top10'
				? /** @type {HTMLElement | null} */ (target.querySelector('.ranked-poster img'))
				: target;
		const anchorRect = (previewAnchor ?? target).getBoundingClientRect();
		const previewWidth = layout === 'top10' ? 430 : 396;
		const previewHeight = 372;
		const rawLeft = anchorRect.left - rootRect.left + anchorRect.width / 2 - previewWidth / 2;
		const maxLeft = Math.max(0, rootRect.width - previewWidth);
		const left = Math.min(Math.max(0, rawLeft), maxLeft);
		const top = anchorRect.top - rootRect.top + anchorRect.height / 2 - previewHeight / 2;

		previewItem = item;
		previewStyle = `left:${left}px;top:${top}px;width:${previewWidth}px;`;
		requestAnimationFrame(() => {
			previewVisible = true;
		});
	};

	const handleViewportScrollActivity = () => {
		suppressHover();
		hidePreview();
		clearScrollSettleTimer();
		scrollSettleTimer = setTimeout(() => {
			scrollSettleTimer = null;
			if (hoveredCard && hoveredItem && Date.now() >= suppressHoverUntil) {
				clearHoverTimer();
				hoverTimer = setTimeout(() => {
					if (!hoveredCard || !hoveredItem || Date.now() < suppressHoverUntil) return;
					showPreview(hoveredItem, hoveredCard);
				}, 120);
			}
		}, scrollSettleDelayMs);
	};

	/** @param {{ currentTarget: EventTarget | null }} event */
	const handleCardEnter = (item, event) => {
		const target = event.currentTarget;
		if (!(target instanceof HTMLElement)) return;
		hoveredCard = target;
		hoveredItem = item;
		if (!enableHoverPreview || isMobileViewport || Date.now() < suppressHoverUntil) return;
		clearHoverTimer();
		previewVisible = false;
		hoverTimer = setTimeout(() => {
			if (Date.now() < suppressHoverUntil) return;
			showPreview(item, target);
		}, previewDelayMs);
	};

	const handleCardLeave = () => {
		hoveredCard = null;
		hoveredItem = null;
		hidePreview();
	};

	const handleTransitionEnd = () => {
		if (!useInfiniteTrack) return;
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
		if (!browser) return;
		const mediaQuery = window.matchMedia('(max-width: 720px)');
		const syncViewport = (matches) => {
			isMobileViewport = matches;
			if (matches || !useInfiniteTrack) {
				index = 0;
				instant = true;
			} else {
				requestAnimationFrame(() => {
					instant = false;
				});
			}
		};

		syncViewport(mediaQuery.matches);
		requestAnimationFrame(() => measure());
		const resizeObserver = new ResizeObserver(() => measure());
		if (viewport) resizeObserver.observe(viewport);
		const interval = setInterval(step, 3600);
		/** @param {MediaQueryListEvent} event */
		const handleViewportChange = (event) => {
			syncViewport(event.matches);
		};
		mediaQuery.addEventListener('change', handleViewportChange);

		return () => {
			resizeObserver.disconnect();
			clearInterval(interval);
			clearHoverTimer();
			clearPreviewUnmountTimer();
			clearScrollSettleTimer();
			mediaQuery.removeEventListener('change', handleViewportChange);
		};
	});
</script>

<section
	bind:this={railRoot}
	class:dark
	class:portrait={orientation === 'portrait'}
	class:expanded={density === 'expanded'}
	class:homeOverlay={overlayStyle === 'home'}
	class:topTen={layout === 'top10'}
	class:desktopScrollable
	class={`poster-rail ${variant}`}
	aria-label={title || 'Selection'}
	onmouseenter={() => {
		if (pauseOnHover && !isMobileViewport) paused = true;
	}}
	onmouseleave={() => {
		if (!isMobileViewport) paused = false;
		hidePreview();
	}}
>
	{#if title}
		<h3>{title}</h3>
	{/if}

	{#if enableHoverPreview && previewItem}
		<article class:visible={previewVisible} class="rail-preview-card" style={previewStyle} aria-hidden="true">
			<div class="rail-preview-visual">
				<img
					src={previewItem.backdrop ?? previewItem.image ?? heroImage}
					alt={previewItem.title}
					loading="lazy"
					decoding="async"
				/>
				<div class="rail-preview-overlay"></div>
				<div class="rail-preview-brand">
					{#if previewItem.clearlogo}
						<img
							class="rail-preview-clearlogo"
							src={previewItem.clearlogo}
							alt={previewItem.title}
							loading="lazy"
							decoding="async"
						/>
					{:else}
						<h4>{previewItem.title}</h4>
					{/if}
				</div>
			</div>
			<div class="rail-preview-copy">
				<div class="rail-preview-meta">
					<span>{previewItem.duration}</span>
					<span>{previewItem.year}</span>
				</div>
				<p>{previewItem.description}</p>
			</div>
		</article>
	{/if}

	<div
		class="rail-viewport"
		bind:this={viewport}
		onscroll={handleViewportScrollActivity}
	>
		<div
			class:instant={instant || isScrollable}
			class:mobile-track={isScrollable}
			class="rail-track"
			bind:this={track}
			ontransitionend={handleTransitionEnd}
			style={isScrollable
				? undefined
				: `transform: translate3d(-${Math.max(0, index * (cardWidth + gap) - offset)}px, 0, 0);`}
		>
			{#each renderedItems as item}
				<button
					class="rail-card"
					type="button"
					onclick={() => onSelect(item)}
					onmouseenter={(event) => handleCardEnter(item, event)}
					onmouseleave={handleCardLeave}
				>
					{#if layout === 'top10'}
						<div class="ranked-poster">
							<span class:double-rank={item.rank >= 10} class="rail-rank-shadow" aria-hidden="true">
								{#if item.rank >= 10}
									<span class="rail-rank-digits">
										{#each String(item.rank).split('') as digit}
											<span>{digit}</span>
										{/each}
									</span>
								{:else}
									{item.rank}
								{/if}
							</span>
							<span class:double-rank={item.rank >= 10} class="rail-rank" aria-hidden="true">
								{#if item.rank >= 10}
									<span class="rail-rank-digits">
										{#each String(item.rank).split('') as digit}
											<span>{digit}</span>
										{/each}
									</span>
								{:else}
									{item.rank}
								{/if}
							</span>
							<img
								src={item.image ?? heroImage}
								alt={item.title}
								loading="lazy"
								decoding="async"
							/>
						</div>
					{:else}
						<img
							src={item.image ?? heroImage}
							alt={item.title}
							loading="lazy"
							decoding="async"
						/>
						<div class="rail-overlay"></div>
						{#if showCardCopy}
							<div class="rail-copy">
								{#if item.tag}
									<span>{item.tag}</span>
								{/if}
								<strong>{item.title}</strong>
							</div>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.poster-rail {
		position: relative;
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

	.poster-rail.desktopScrollable .rail-viewport {
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.poster-rail.desktopScrollable .rail-viewport::-webkit-scrollbar {
		display: none;
	}

	.rail-preview-card {
		position: absolute;
		z-index: 12;
		display: grid;
		grid-template-rows: 232px minmax(0, 1fr);
		border-radius: 3px;
		background: var(--sheet-block, var(--surface-card));
		overflow: hidden;
		opacity: 0;
		transform: translateY(14px) scale(0.965);
		pointer-events: none;
		box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
		transition:
			opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 620ms cubic-bezier(0.22, 1, 0.36, 1),
			background-color var(--theme-duration) var(--theme-ease),
			color var(--theme-duration) var(--theme-ease);
	}

	.rail-preview-card.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.rail-preview-visual {
		position: relative;
		overflow: hidden;
		background: #0d0d0f;
	}

	.rail-preview-visual > img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.rail-preview-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(8, 8, 10, 0.04) 0%, rgba(8, 8, 10, 0.16) 48%, rgba(8, 8, 10, 0.78) 100%),
			linear-gradient(90deg, rgba(8, 8, 10, 0.18) 0%, rgba(8, 8, 10, 0.04) 100%);
	}

	.rail-preview-brand {
		position: absolute;
		left: 14px;
		right: 14px;
		bottom: 14px;
		z-index: 1;
	}

	.rail-preview-brand h4,
	.rail-preview-copy p,
	.rail-preview-meta span {
		margin: 0;
	}

	.rail-preview-brand h4 {
		font-size: 1.2rem;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #ffffff;
		text-shadow: 0 8px 22px rgba(0, 0, 0, 0.42);
	}

	.rail-preview-clearlogo {
		display: block;
		max-width: min(180px, 100%);
		max-height: 58px;
		object-fit: contain;
		object-position: left bottom;
		filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.42));
	}

	.rail-preview-copy {
		display: grid;
		align-content: start;
		gap: 0.8rem;
		padding: 18px;
	}

	.rail-preview-meta {
		display: flex;
		gap: 0.8rem;
		color: var(--muted-text-strong);
		font-size: 0.98rem;
	}

	.rail-preview-copy p {
		font-size: 1.04rem;
		line-height: 1.6;
		color: var(--muted-text-strong);
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
		border-radius: 3px;
		background: #151515;
		overflow: hidden;
		cursor: pointer;
	}

	.poster-rail.topTen .rail-track {
		gap: 168px;
	}

	@media (min-width: 1600px) {
		.poster-rail.topTen .rail-track {
			gap: 228px;
		}
	}

	.poster-rail.topTen .rail-card {
		width: clamp(296px, 22vw, 372px);
		height: auto;
		background: transparent;
		overflow: visible;
	}

	.poster-rail.small .rail-card {
		width: clamp(172px, 14vw, 246px);
		height: clamp(98px, 8vw, 140px);
	}

	.poster-rail.portrait.small .rail-card {
		width: clamp(154px, 12vw, 208px);
		height: clamp(230px, 19vw, 320px);
	}

	.poster-rail.medium .rail-card {
		width: clamp(320px, 23vw, 460px);
		height: clamp(180px, 13vw, 250px);
	}

	.poster-rail.portrait.medium .rail-card {
		width: clamp(190px, 15vw, 260px);
		height: clamp(286px, 23vw, 392px);
	}

	.poster-rail.large .rail-card {
		width: clamp(680px, 48vw, 980px);
		height: clamp(382px, 29vw, 552px);
	}

	.poster-rail.portrait.large .rail-card {
		width: clamp(210px, 17vw, 290px);
		height: clamp(315px, 25vw, 438px);
	}

	.poster-rail.portrait.large.expanded .rail-card {
		width: clamp(344px, 27vw, 478px);
		height: clamp(516px, 40vw, 716px);
	}

	.rail-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.ranked-poster {
		--rail-rank-gap: 4.8rem;
		--rail-rank-overlap: 0.82rem;
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
		width: 100%;
		height: auto;
		padding-left: var(--rail-rank-gap);
		overflow: visible;
	}

	.poster-rail.topTen .ranked-poster img {
		position: relative;
		z-index: 3;
		width: clamp(188px, 14vw, 258px);
		height: auto;
		object-fit: contain;
		filter: none;
	}

	.rail-rank {
		position: absolute;
		right: calc(100% - (var(--rail-rank-gap) + var(--rail-rank-overlap)));
		top: 50%;
		z-index: 1;
		transform: translateY(-50%);
		font-size: clamp(13.4rem, 18vw, 21rem);
		line-height: 0.82;
		font-weight: 900;
		letter-spacing: -0.24em;
		color: var(--rank-number);
		text-shadow:
			5px 0 0 var(--rank-number-stroke),
			-5px 0 0 var(--rank-number-stroke),
			0 5px 0 var(--rank-number-stroke),
			0 -5px 0 var(--rank-number-stroke),
			5px 5px 0 var(--rank-number-stroke),
			-5px -5px 0 var(--rank-number-stroke),
			5px -5px 0 var(--rank-number-stroke),
			-5px 5px 0 var(--rank-number-stroke);
		white-space: nowrap;
		pointer-events: none;
	}

	.rail-rank-shadow {
		position: absolute;
		right: calc(100% - (var(--rail-rank-gap) + var(--rail-rank-overlap)));
		top: 50%;
		z-index: 2;
		transform: translateY(-50%);
		font-size: clamp(13.4rem, 18vw, 21rem);
		line-height: 0.82;
		font-weight: 900;
		letter-spacing: -0.24em;
		color: transparent;
		white-space: nowrap;
		pointer-events: none;
		background:
			linear-gradient(
				90deg,
				rgba(5, 8, 12, 0) 0%,
				rgba(5, 8, 12, 0.07) 18%,
				rgba(5, 8, 12, 0.2) 40%,
				rgba(5, 8, 12, 0.46) 64%,
				rgba(5, 8, 12, 0.72) 100%
			);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		filter:
			blur(0.5px)
			drop-shadow(7px 0 7px rgba(0, 0, 0, 0.16))
			drop-shadow(12px 0 10px rgba(0, 0, 0, 0.1));
		opacity: 0.9;
	}

	.rail-rank-shadow .rail-rank-digits,
	.rail-rank-shadow .rail-rank-digits span {
		background: inherit;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.rail-rank.double-rank {
		--rail-rank-overlap: 2.25rem;
		font-size: clamp(10.7rem, 14.3vw, 15.8rem);
	}

	.rail-rank-shadow.double-rank {
		--rail-rank-overlap: 2.25rem;
		font-size: clamp(10.7rem, 14.3vw, 15.8rem);
	}

	.poster-rail.topTen .rail-rank {
		right: calc(100% - (var(--rail-rank-gap) + 2.75rem));
		color: var(--surface-card);
		text-shadow:
			12px 0 10px rgba(0, 0, 0, 0.52),
			22px 0 22px rgba(0, 0, 0, 0.42),
			34px 0 44px rgba(0, 0, 0, 0.34),
			52px 0 92px rgba(0, 0, 0, 0.28);
		filter:
			drop-shadow(12px 0 12px rgba(0, 0, 0, 0.34))
			drop-shadow(24px 0 30px rgba(0, 0, 0, 0.26))
			drop-shadow(40px 0 68px rgba(0, 0, 0, 0.2));
	}

	.poster-rail.topTen .rail-rank-shadow {
		right: calc(100% - (var(--rail-rank-gap) + 2.75rem));
	}

	:global(body:not(.theme-dark)) .poster-rail.topTen .rail-rank {
		text-shadow:
			1px 0 0 var(--accent-blue),
			-1px 0 0 var(--accent-blue),
			0 1px 0 var(--accent-blue),
			0 -1px 0 var(--accent-blue);
	}

	.rail-rank-digits {
		display: inline-flex;
		gap: 0;
	}

	.rail-rank-shadow .rail-rank-digits {
		display: inline-flex;
		gap: 0;
	}

	.poster-rail.topTen .rail-rank.double-rank .rail-rank-digits {
		gap: 0;
		transform: translateX(0.55rem);
	}

	.poster-rail.topTen .rail-rank-shadow.double-rank .rail-rank-digits {
		gap: 0;
		transform: translateX(0.55rem);
	}

	.poster-rail.topTen .rail-rank.double-rank .rail-rank-digits span + span {
		margin-left: -1.35rem;
	}

	.poster-rail.topTen .rail-rank-shadow.double-rank .rail-rank-digits span + span {
		margin-left: -1.35rem;
	}

	.rail-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(8, 8, 8, 0.02) 0%, rgba(8, 8, 8, 0.38) 100%),
			linear-gradient(90deg, rgba(8, 8, 8, 0.18) 0%, rgba(8, 8, 8, 0.02) 100%);
	}

	.poster-rail.homeOverlay .rail-overlay {
		background:
			linear-gradient(180deg, rgba(8, 8, 8, 0.01) 0%, rgba(8, 8, 8, 0.14) 40%, rgba(8, 8, 8, 0.52) 100%),
			linear-gradient(90deg, rgba(8, 8, 8, 0.18) 0%, rgba(8, 8, 8, 0.04) 100%);
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

	.poster-rail.topTen .rail-overlay,
	.poster-rail.topTen .rail-copy {
		display: none;
	}

	.poster-rail.topTen h3 {
		font-size: 1.95rem;
		letter-spacing: -0.04em;
	}

	@media (max-width: 640px) {
		.rail-viewport {
			overflow-x: auto;
			overflow-y: hidden;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior-x: contain;
		}

		.rail-viewport::-webkit-scrollbar {
			display: none;
		}

		.rail-track.mobile-track {
			width: max-content;
			padding-right: 12px;
			transition: none;
		}

		.rail-card,
		.ranked-poster,
		.rail-card img {
			touch-action: auto;
			user-select: none;
			-webkit-user-drag: none;
		}

		.poster-rail.small .rail-card {
			width: 42vw;
			height: 24vw;
		}

		.poster-rail.portrait.small .rail-card {
			width: 34vw;
			height: 52vw;
		}

		.poster-rail.medium .rail-card {
			width: 62vw;
			height: 36vw;
		}

		.poster-rail.portrait.medium .rail-card {
			width: 42vw;
			height: 62vw;
		}

		.poster-rail.large .rail-card {
			width: 86vw;
			height: 49vw;
		}

		.poster-rail.portrait.large .rail-card {
			width: 46vw;
			height: 68vw;
		}

		.poster-rail.portrait.large.expanded .rail-card {
			width: 74vw;
			height: 108vw;
		}

		.poster-rail.topTen .rail-card {
			width: 62vw;
			height: auto;
		}

		.poster-rail.topTen .rail-track {
			gap: 88px;
		}

		.poster-rail.topTen .ranked-poster {
			--rail-rank-gap: 3.2rem;
			--rail-rank-overlap: 0.52rem;
		}

		.poster-rail.topTen .ranked-poster img {
			width: 42vw;
			height: auto;
		}

		.poster-rail.topTen .rail-rank {
			font-size: clamp(9.2rem, 32vw, 14rem);
			letter-spacing: -0.2em;
		}

		.poster-rail.topTen .rail-rank.double-rank {
			--rail-rank-overlap: 1.5rem;
			font-size: clamp(7rem, 24vw, 10rem);
		}

		.poster-rail.topTen .rail-rank.double-rank .rail-rank-digits {
			transform: translateX(0.34rem);
		}

		.poster-rail.topTen .rail-rank-shadow.double-rank .rail-rank-digits {
			transform: translateX(0.34rem);
		}

		.poster-rail.topTen .rail-rank.double-rank .rail-rank-digits span + span {
			margin-left: -0.9rem;
		}

		.poster-rail.topTen .rail-rank-shadow.double-rank .rail-rank-digits span + span {
			margin-left: -0.9rem;
		}
	}
</style>
