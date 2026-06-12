<script>
	import { heroImage } from '$lib/data/catalog';

	let {
		slides = [],
		compact = false,
		fullBleed = false,
		overlayBottom = false,
		overlayTone = 'dark',
		hideCopy = false,
		imageOverlay = 'full'
	} = $props();

	let currentSlide = $state(0);

	const nextSlide = () => {
		currentSlide = (currentSlide + 1) % slides.length;
	};

	$effect(() => {
		if (slides.length <= 1) return;

		const interval = setInterval(nextSlide, 5600);

		return () => clearInterval(interval);
	});
</script>

<section
	class:compact
	class:fullBleed
	class:lightBottom={overlayTone === 'light'}
	class:simpleBottom={imageOverlay === 'bottom-only'}
	class:verticalOnly={imageOverlay === 'vertical'}
	class="page-hero"
	aria-label="Selection editoriale"
>
	<div class="hero-track" style={`transform: translateX(-${currentSlide * 100}%);`}>
		{#each slides as slide}
			<article class={`hero-slide ${slide.tint ?? 'tint-blue'}`}>
				<img
					src={slide.image ?? heroImage}
					alt={slide.title}
					loading="eager"
					decoding="async"
					fetchpriority="high"
				/>
				{#if imageOverlay === 'full' || imageOverlay === 'vertical'}
					<div class="hero-overlay"></div>
				{/if}
				{#if overlayBottom}
					<div class:lightBottom={overlayTone === 'light'} class="hero-bottom-overlay"></div>
				{/if}

				{#if !hideCopy}
					<div class="hero-copy">
						{#if slide.kicker}
							<p>{slide.kicker}</p>
						{/if}
						{#if slide.logo}
							<img
								class="hero-logo"
								src={slide.logo}
								alt={slide.title}
								loading="lazy"
								decoding="async"
							/>
						{:else}
							<h1>{slide.title}</h1>
						{/if}
						{#if slide.button}
							<a href={slide.href ?? '#'}>{slide.button}</a>
						{/if}
					</div>
				{/if}
			</article>
		{/each}
	</div>
</section>

<style>
	.page-hero {
		position: relative;
		min-height: calc(100svh - 96px);
		overflow: hidden;
		background: var(--page-bg);
		transition: background-color var(--theme-duration) var(--theme-ease);
	}

	.page-hero.compact {
		height: 100svh;
		min-height: 100svh;
	}

	.page-hero.fullBleed {
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
		margin-top: -10px;
	}

	.hero-bottom-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		height: 42%;
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0) 0%,
			rgba(10, 10, 10, 0.22) 38%,
			rgba(10, 10, 10, 0.94) 100%
		);
		pointer-events: none;
		transition:
			background var(--theme-duration) var(--theme-ease),
			height var(--theme-duration) var(--theme-ease);
	}

	.page-hero.simpleBottom .hero-bottom-overlay {
		height: 42%;
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0) 0%,
			rgba(10, 10, 10, 0.04) 22%,
			rgba(10, 10, 10, 0.12) 42%,
			rgba(10, 10, 10, 0.3) 64%,
			rgba(10, 10, 10, 0.62) 84%,
			rgba(10, 10, 10, 1) 100%
		);
	}

	.page-hero.simpleBottom .hero-bottom-overlay.lightBottom {
		height: 72%;
		background: linear-gradient(
			180deg,
			rgba(11, 13, 17, 0) 0%,
			rgba(11, 13, 17, 0.08) 10%,
			rgba(11, 13, 17, 0.22) 22%,
			rgba(11, 13, 17, 0.44) 38%,
			rgba(11, 13, 17, 0.7) 56%,
			rgba(11, 13, 17, 0.9) 74%,
			var(--page-bg) 100%
		);
	}

	.hero-bottom-overlay.lightBottom {
		background: linear-gradient(
			180deg,
			rgba(11, 13, 17, 0) 0%,
			rgba(11, 13, 17, 0.32) 34%,
			rgba(11, 13, 17, 0.72) 62%,
			var(--page-bg) 100%
		);
	}

	.hero-track {
		display: flex;
		height: 100%;
		min-height: 100%;
		transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.hero-slide {
		position: relative;
		min-width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.hero-slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			linear-gradient(
				90deg,
				rgba(10, 15, 24, 0.78) 0%,
				rgba(10, 15, 24, 0.18) 56%,
				rgba(10, 15, 24, 0.08) 100%
			),
			linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(10, 15, 24, 0.28) 100%);
	}

	.tint-blue .hero-overlay {
		background:
			linear-gradient(
				90deg,
				rgba(10, 21, 52, 0.82) 0%,
				rgba(10, 21, 52, 0.22) 58%,
				rgba(10, 21, 52, 0.08) 100%
			),
			linear-gradient(180deg, rgba(44, 118, 255, 0.18) 0%, rgba(10, 21, 52, 0.2) 100%);
	}

	.tint-amber .hero-overlay {
		background:
			linear-gradient(
				90deg,
				rgba(37, 24, 8, 0.78) 0%,
				rgba(37, 24, 8, 0.2) 58%,
				rgba(37, 24, 8, 0.08) 100%
			),
			linear-gradient(180deg, rgba(255, 174, 72, 0.2) 0%, rgba(37, 24, 8, 0.16) 100%);
	}

	.tint-silver .hero-overlay {
		background:
			linear-gradient(
				90deg,
				rgba(26, 26, 28, 0.78) 0%,
				rgba(26, 26, 28, 0.22) 58%,
				rgba(26, 26, 28, 0.08) 100%
			),
			linear-gradient(180deg, rgba(180, 188, 204, 0.18) 0%, rgba(26, 26, 28, 0.16) 100%);
	}

	.page-hero.verticalOnly .hero-slide .hero-overlay {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(10, 15, 24, 0.28) 100%);
	}

	.hero-copy {
		position: absolute;
		left: clamp(22px, 4vw, 52px);
		bottom: clamp(22px, 4vw, 44px);
		z-index: 2;
		max-width: 620px;
		color: #ffffff;
	}

	p,
	h1 {
		margin: 0;
	}

	.hero-copy p {
		margin-bottom: 0.7rem;
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.84;
	}

	.hero-copy h1 {
		max-width: 9ch;
		font-size: clamp(3.2rem, 8vw, 7rem);
		line-height: 0.9;
		letter-spacing: -0.07em;
	}

	.page-hero.compact .hero-copy h1 {
		font-size: clamp(2.4rem, 5vw, 4.4rem);
		max-width: 12ch;
	}

	.hero-logo {
		display: block;
		max-width: min(520px, 70vw);
		max-height: clamp(84px, 14vw, 180px);
		object-fit: contain;
		object-position: left center;
		filter: drop-shadow(0 14px 36px rgba(0, 0, 0, 0.38));
	}

	.hero-copy a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 1.2rem;
		padding: 0.9rem 1.3rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: #2f6bff;
		color: #ffffff;
		font-size: 0.98rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 240ms ease,
			color 240ms ease,
			border-color 240ms ease,
			box-shadow 240ms ease;
	}

	@media (max-width: 640px) {
		.page-hero {
			min-height: calc(100svh - 72px);
		}

		.page-hero.compact {
			height: min(100svh, 760px);
			min-height: min(100svh, 760px);
		}

		.page-hero.fullBleed {
			margin-top: -8px;
		}

		.hero-copy {
			left: 18px;
			right: 18px;
			bottom: 18px;
		}

		.hero-copy h1 {
			font-size: clamp(2.8rem, 12vw, 4.6rem);
		}

		.hero-logo {
			max-width: min(78vw, 360px);
			max-height: 96px;
		}
	}

	@media (max-width: 480px) {
		.page-hero.compact {
			height: min(100svh, 680px);
			min-height: min(100svh, 680px);
		}

		.hero-copy {
			left: 14px;
			right: 14px;
			bottom: 14px;
		}

		.hero-copy a {
			width: 100%;
			min-height: 46px;
		}

		.hero-logo {
			max-width: min(82vw, 300px);
			max-height: 82px;
		}
	}
</style>
