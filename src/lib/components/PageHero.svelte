<script>
	import { heroImage } from '$lib/data/catalog';

	let {
		slides = [],
		compact = false,
		fullBleed = false,
		overlayBottom = false,
		overlayTone = 'dark',
		hideCopy = false
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
	class:overlayBottom
	class:lightBottom={overlayTone === 'light'}
	class="page-hero"
	aria-label="Selection editoriale"
>
	<div class="hero-track" style={`transform: translateX(-${currentSlide * 100}%);`}>
		{#each slides as slide}
			<article class={`hero-slide ${slide.tint ?? 'tint-blue'}`}>
				<img src={heroImage} alt={slide.title} loading="eager" fetchpriority="high" />
				<div class="hero-overlay"></div>

				{#if !hideCopy}
					<div class="hero-copy">
						{#if slide.kicker}
							<p>{slide.kicker}</p>
						{/if}
						<h1>{slide.title}</h1>
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
	}

	.page-hero.compact {
		min-height: 31svh;
	}

	.page-hero.fullBleed {
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
		margin-top: -10px;
	}

	.page-hero.overlayBottom::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 34%;
		background: linear-gradient(180deg, rgba(10, 10, 10, 0) 0%, rgba(10, 10, 10, 0.9) 100%);
		pointer-events: none;
	}

	.page-hero.overlayBottom.lightBottom::after {
		background: linear-gradient(
			180deg,
			rgba(245, 245, 247, 0) 0%,
			rgba(245, 245, 247, 0.18) 34%,
			rgba(245, 245, 247, 0.52) 62%,
			var(--page-bg) 100%
		);
	}

	.hero-track {
		display: flex;
		height: 100%;
		transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.hero-slide {
		position: relative;
		min-width: 100%;
		min-height: inherit;
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

	.hero-copy {
		position: absolute;
		left: clamp(22px, 4vw, 52px);
		bottom: clamp(22px, 4vw, 44px);
		z-index: 1;
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
		font-weight: 600;
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

	.hero-copy a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 1.2rem;
		padding: 0.9rem 1.3rem;
		border-radius: 999px;
		background: #2f6bff;
		color: #ffffff;
		font-size: 0.98rem;
		font-weight: 600;
		text-decoration: none;
	}

	@media (max-width: 640px) {
		.page-hero {
			min-height: calc(100svh - 84px);
		}

		.page-hero.compact {
			min-height: 24svh;
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
	}
</style>
