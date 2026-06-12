<svelte:head>
	<title>Moovy | Mentions legales</title>
	<meta
		name="description"
		content="Mentions legales, credits, responsabilites et informations sur les sources editoriales et visuelles de Moovy."
	/>
</svelte:head>

<section class="legal-page">
	<div class="legal-hero">
		<p>Moovy</p>
		<h1>Mentions legales</h1>
		<span>Informations juridiques, credits et cadre d utilisation du site.</span>
	</div>

	<div class="legal-layout">
		<section class="legal-section intro">
			<div>
				<h2>Presentation</h2>
				<p>
					Moovy est un projet editorial et demonstratif dedie a la recommandation de films, a la
					mise en scene de selections cinematographiques et a l exploration de parcours de
					navigation inspires des plateformes de streaming premium.
				</p>
			</div>
			<div class="legal-note">
				<strong>Nature du site</strong>
				<p>
					Le site a une vocation de demonstration, de direction artistique et de prototypage d
					interface. Il ne constitue pas un service officiel d exploitation ou de diffusion d
					oeuvres cinematographiques.
				</p>
			</div>
		</section>

		<section class="legal-section">
			<h2>Editeur</h2>
			<p>
				Moovy est edite comme un projet de vitrine et de conception web. Les contenus textuels, la
				structure editoriale, l organisation des parcours et l habillage de l interface sont
				produits pour cette demonstration.
			</p>
		</section>

		<section class="legal-section split">
			<div>
				<h2>Responsable de publication</h2>
				<p>Moovy Studio.</p>
			</div>
			<div>
				<h2>Hebergement</h2>
				<p>
					L hebergement du projet depend de l environnement de deploiement retenu pour l application
					SvelteKit et peut varier selon les besoins techniques du site.
				</p>
			</div>
		</section>

		<section class="legal-section">
			<h2>Sources, donnees et visuels</h2>
			<p>
				Moovy assemble des donnees editoriales internes et peut s appuyer sur des services tiers
				pour enrichir les fiches films, les affiches, les fonds visuels et certains elements
				graphiques associes aux oeuvres referencees.
			</p>
			<p>
				Les affiches, backdrops et clearlogos peuvent notamment provenir de la base
				<strong> TheTVDB (TVDB)</strong> ou de sources equivalentes lorsque ces ressources sont disponibles.
				Ces elements restent soumis aux droits et conditions de leurs ayants droit et fournisseurs respectifs.
			</p>
		</section>

		<section class="legal-section split">
			<div>
				<h2>Propriete intellectuelle</h2>
				<p>
					Le design du site, son architecture, ses textes originaux, son systeme de navigation et
					ses choix editoriaux sont proteges par le droit applicable. Toute reproduction, adaptation
					ou reutilisation non autorisee de ces elements peut etre interdite.
				</p>
			</div>
			<div>
				<h2>Marques et oeuvres citees</h2>
				<p>
					Les titres de films, noms d oeuvres, logos, affiches et visuels mentionnes sur le site
					restent la propriete de leurs titulaires respectifs et sont utilises ici dans un cadre de
					presentation, de demonstration ou de reference editoriale.
				</p>
			</div>
		</section>

		<section class="legal-section">
			<h2>Responsabilite</h2>
			<p>
				Moovy est fourni en l etat, sans garantie d exactitude absolue, d exhaustivite ou de
				disponibilite continue. Malgre le soin apporte a la conception et a la selection des
				contenus, certaines informations, illustrations ou associations de films peuvent etre
				incompletes, approximatives ou evolutives.
			</p>
		</section>

		<section class="legal-section compact">
			<h2>Contact</h2>
			<p>
				Pour toute demande relative au projet, a son design, a ses contenus ou a l utilisation de
				ses elements editoriaux, la prise de contact se fait via l entite mentionnee dans le footer
				du site.
			</p>
		</section>
	</div>
</section>

<style>
	.legal-page {
		display: grid;
		gap: 34px;
		padding-top: 116px;
		padding-bottom: 34px;
	}

	.legal-hero {
		display: grid;
		gap: 1rem;
		padding: clamp(30px, 5vw, 54px);
		background:
			linear-gradient(180deg, rgba(47, 107, 255, 0.08) 0%, rgba(47, 107, 255, 0) 100%),
			var(--surface-card);
		border: 1px solid var(--border-soft);
		box-shadow: var(--shadow-soft);
	}

	.legal-hero p,
	.legal-hero h1,
	.legal-hero span,
	.legal-section h2,
	.legal-section p,
	.legal-note strong,
	.legal-note p {
		margin: 0;
	}

	.legal-hero p {
		color: var(--accent-blue);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.legal-hero h1 {
		font-size: clamp(2.8rem, 6vw, 5.8rem);
		line-height: 0.9;
		letter-spacing: -0.08em;
	}

	.legal-hero span {
		max-width: 54ch;
		color: var(--muted-text);
		font-size: 1rem;
		line-height: 1.65;
	}

	.legal-layout {
		display: grid;
		gap: 14px;
	}

	.legal-section {
		display: grid;
		gap: 1rem;
		padding: clamp(24px, 3vw, 34px);
		background: var(--surface-card);
		border: 1px solid var(--border-soft);
	}

	.legal-section h2 {
		font-size: 1.2rem;
		letter-spacing: -0.04em;
	}

	.legal-section p,
	.legal-note p {
		max-width: 72ch;
		color: var(--muted-text-strong);
		line-height: 1.7;
	}

	.legal-section.split,
	.legal-section.intro {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
	}

	.legal-note {
		display: grid;
		align-content: start;
		gap: 0.8rem;
		padding: 22px;
		background: var(--surface-subtle);
	}

	.legal-note strong {
		font-size: 0.92rem;
		letter-spacing: -0.02em;
	}

	.legal-section.compact {
		padding-bottom: 28px;
	}

	@media (max-width: 820px) {
		.legal-page {
			padding-top: 100px;
			gap: 16px;
		}

		.legal-section.split,
		.legal-section.intro {
			grid-template-columns: 1fr;
		}
	}
</style>
