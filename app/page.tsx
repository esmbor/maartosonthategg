import Image from "next/image";
import Link from "next/link";

const recipes = [
  {
    number: "01",
    name: "Pulled Pork",
    tags: ["Low & Slow", "Varken"],
    meta: "110°C · ± 8 uur",
  },
  {
    number: "02",
    name: "Picanha Reverse Sear",
    tags: ["Reverse Sear", "Rund"],
    meta: "120°C → hot & fast · ± 1,5 uur",
  },
  {
    number: "03",
    name: "Pizza van de Egg",
    tags: ["Hot & Fast", "Pizza"],
    meta: "300°C · ± 15 minuten",
  },
];

const picks = [
  {
    number: "01",
    name: "Favoriete kernthermometer",
    type: "Gear",
  },
  {
    number: "02",
    name: "De rub die altijd in de kast staat",
    type: "Kruiden",
  },
  {
    number: "03",
    name: "Rookhout voor low & slow",
    type: "Fuel & Smoke",
  },
  {
    number: "04",
    name: "Gietijzer dat tegen een stootje kan",
    type: "Gear",
  },
];

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="site-shell header-inner">
          <Link href="/" className="brand">
            <Image
              src="/images/logo-maarto.png"
              alt="Maarto's on that Egg"
              width={80}
              height={80}
              priority
            />

            <span className="brand-name">Maarto&apos;s on that Egg</span>
          </Link>

          <nav className="nav">
            <Link href="/recepten">Recepten</Link>
            <Link href="/tips">Maarto&apos;s Tips</Link>
            <Link href="/over">Over Maarto</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="site-shell hero-grid">
          <div>
            <div className="hero-eyebrow">
              BBQ · Recepten · Tips · Veel vuur
            </div>

            <h1 className="hero-title">
              Fire up
              <span>the Egg.</span>
            </h1>

            <p className="hero-description">
              Recepten, tips en alles wat ik onderweg heb geleerd over koken
              op vuur. Van urenlang low & slow tot iets dat binnen twintig
              minuten van de Egg komt.
            </p>

            <div className="hero-actions">
              <Link href="/recepten" className="primary-button">
                Bekijk de recepten
              </Link>

              <Link href="/tips" className="text-link">
                Ontdek Maarto&apos;s Tips <span>→</span>
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-media">
              <div className="hero-photo-circle">
                <Image
                  src="/images/hero-bbq.jpg"
                  alt="Maarto bij de Big Green Egg"
                  fill
                  className="hero-photo"
                  priority
                />

                <div className="hero-photo-overlay" />
              </div>

              <div className="hero-sticker">
                Born to grill
                <br />
                forced to
                <br />
                wait for temp
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="on-the-egg">
        <div className="site-shell">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">De laatste cooks</div>
              <h2 className="section-title">
                What&apos;s on
                <br />
                the Egg?
              </h2>
            </div>

            <p className="section-intro">
              Geen gedoe, gewoon goed eten van de BBQ. Dit zijn een paar
              recepten die momenteel favoriet zijn.
            </p>
          </div>

          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <Link
                href="/recepten"
                className="recipe-card"
                key={recipe.number}
              >
                <span className="recipe-number">{recipe.number}</span>

                <div className="recipe-content">
                  <div className="recipe-tags">
                    {recipe.tags.map((tag) => (
                      <span className="recipe-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="recipe-name">{recipe.name}</h3>

                  <div className="recipe-meta">{recipe.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="picks">
        <div className="site-shell picks-grid">
          <div>
            <div className="section-eyebrow">Maarto&apos;s favorieten</div>

            <h2 className="picks-title">
              Maarto&apos;s
              <br />
              Picks.
            </h2>

            <p className="picks-copy">
              Spullen die hun plekje naast de Egg verdiend hebben. Van
              favoriete rubs tot tools waar je na één keer gebruiken niet meer
              zonder wilt. Geen eindeloze lijst met gadgets, gewoon dingen die
              hier écht gebruikt worden.
            </p>

            <div style={{ marginTop: "36px" }}>
              <Link href="/tips" className="text-link">
                Bekijk alle tips <span>→</span>
              </Link>
            </div>
          </div>

          <div className="picks-list">
            {picks.map((pick) => (
              <Link href="/tips" className="pick-item" key={pick.number}>
                <span className="pick-number">{pick.number}</span>
                <span className="pick-name">{pick.name}</span>
                <span className="pick-type">{pick.type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="site-shell footer-inner">
          <div className="footer-brand">Maarto&apos;s on that Egg</div>

          <div>BBQ, recepten en nét iets te veel rook.</div>
        </div>
      </footer>
    </main>
  );
}