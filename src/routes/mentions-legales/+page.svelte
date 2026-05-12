<svelte:head>
	<title>Moovy | Mentions legales</title>
</svelte:head>

<section class="legal-page">
	<div class="legal-head">
		<h1>Mentions legales</h1>
		<p>Informations legales, credits et conditions generales d utilisation du site Moovy.</p>
	</div>

	<div class="legal-grid">
		<section>
			<h2>Editeur</h2>
			<p>Moovy est un projet editorial et demonstratif autour de la recommandation de films.</p>
		</section>

		<section>
			<h2>Publication</h2>
			<p>Responsable de publication : Moovy Studio.</p>
		</section>

		<section>
			<h2>Hebergement</h2>
			<p>L hebergement depend de l environnement de deploiement choisi pour l application SvelteKit.</p>
		</section>

		<section>
			<h2>Donnees</h2>
			<p>Les metadonnees, affiches, fonds et logos de films peuvent provenir de services tiers.</p>
		</section>

		<section>
			<h2>Propriete intellectuelle</h2>
			<p>Le design, les textes originaux et la structure de Moovy restent proteges par le droit applicable.</p>
		</section>

		<section>
			<h2>Responsabilite</h2>
			<p>Le site est fourni a titre demonstratif, sans garantie d exactitude ou de disponibilite permanente.</p>
		</section>
	</div>
</section>

<style>
	.legal-page {
		display: grid;
		gap: 22px;
		padding-top: 112px;
	}

	.legal-head,
	.legal-grid section {
		background: var(--surface-card);
	}

	.legal-head {
		padding: 28px;
	}

	.legal-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}

	.legal-grid section {
		padding: 24px;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.4rem, 5vw, 4.8rem);
		letter-spacing: -0.06em;
	}

	.legal-head p {
		margin-top: 0.75rem;
		max-width: 58ch;
		color: var(--muted-text);
	}

	h2 {
		font-size: 1.15rem;
		letter-spacing: -0.03em;
	}

	.legal-grid p {
		margin-top: 0.65rem;
		color: var(--muted-text-strong);
		line-height: 1.6;
	}

	@media (max-width: 760px) {
		.legal-page {
			padding-top: 96px;
		}

		.legal-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
