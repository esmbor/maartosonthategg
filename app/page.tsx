import Image from "next/image";
import Link from "next/link";

import PublicHeader from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/server";

function formatMinutes(minutes: number | null) {
  if (!minutes) return null;

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} u`;
  }

  return `${hours} u ${remaining} min`;
}

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredRecipes, error } = await supabase
    .from("recipes")
    .select(`
      id,
      title,
      slug,
      category,
      cooking_style,
      cook_time_minutes,
      bbq_temperature_c,
      featured,
      created_at
    `)
    .eq("published", true)
    .eq("featured", true)
    .order("featured_order", {
      ascending: true,
    })
    .limit(3);

  if (error) {
    console.error(
      "Error loading featured recipes:",
      error
    );
  }

  const recipeIds =
    featuredRecipes?.map((recipe) => recipe.id) ?? [];

  let recipeImages: {
    recipe_id: string;
    storage_path: string;
    alt_text: string | null;
  }[] = [];

  if (recipeIds.length > 0) {
    const { data: images, error: imageError } =
      await supabase
        .from("recipe_images")
        .select(`
          recipe_id,
          storage_path,
          alt_text
        `)
        .in("recipe_id", recipeIds)
        .eq("is_main", true);

    if (imageError) {
      console.error(
        "Error loading featured recipe images:",
        imageError
      );
    }

    recipeImages = images ?? [];
  }

  const recipes =
    featuredRecipes?.map((recipe) => {
      const image = recipeImages.find(
        (item) =>
          item.recipe_id === recipe.id
      );

      const imageUrl = image
        ? supabase.storage
            .from("maarto-images")
            .getPublicUrl(image.storage_path)
            .data.publicUrl
        : null;

      return {
        ...recipe,
        imageUrl,
        imageAlt:
          image?.alt_text ?? recipe.title,
      };
    }) ?? [];

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
  ];

  return (
    <main>
      <PublicHeader absolute />

      {/* HERO */}

      <section className="hero">
        <div className="site-shell hero-grid">
          <div>
            <div className="hero-eyebrow">
              Smoke · Fire · Good Food
            </div>

            <h1 className="hero-title">
              Fire up
              <span>the Egg.</span>
            </h1>

            <p className="hero-description">
              Recepten, favoriete tools en alles
              wat hier op de Big Green Egg
              belandt.
            </p>

            <div className="hero-actions">
              <Link
                href="/recepten"
                className="primary-button"
              >
                Bekijk de recepten
              </Link>

              <a
                href="#tips"
                className="text-link"
              >
                Maarto&apos;s Tips
                <span>→</span>
              </a>
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

      {/* WHAT'S ON THE EGG */}

      <section
        className="on-the-egg"
        id="recepten"
      >
        <div className="site-shell">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">
                Straight from the fire
              </div>

              <h2 className="section-title">
                What&apos;s on
                <br />
                the Egg?
              </h2>
            </div>

            <div>
              <p className="section-intro">
                De cooks die hier absoluut nog
                een keer op de Egg komen.
              </p>

              <Link
                href="/recepten"
                className="text-link"
              >
                Bekijk alle recepten
                <span>→</span>
              </Link>
            </div>
          </div>

          {recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map(
                (recipe, index) => (
                  <Link
                    href={`/recepten/${recipe.slug}`}
                    className="recipe-card"
                    key={recipe.id}
                  >
                    {recipe.imageUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.imageAlt}
                          className="homepage-recipe-image"
                        />

                        <div className="homepage-recipe-overlay" />
                      </>
                    )}

                    <div className="recipe-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="recipe-content">
                      <div className="recipe-tags">
                        {recipe.category && (
                          <span className="recipe-tag">
                            {recipe.category}
                          </span>
                        )}

                        {recipe.cooking_style && (
                          <span className="recipe-tag">
                            {recipe.cooking_style}
                          </span>
                        )}
                      </div>

                      <h3 className="recipe-name">
                        {recipe.title}
                      </h3>

                      <div className="recipe-meta">
                        {formatMinutes(
                          recipe.cook_time_minutes
                        )}

                        {recipe.cook_time_minutes &&
                          recipe.bbq_temperature_c && (
                            <> · </>
                          )}

                        {recipe.bbq_temperature_c && (
                          <>
                            {
                              recipe.bbq_temperature_c
                            }
                            °C
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                🔥
              </div>

              <h2>
                Nog geen featured cooks.
              </h2>

              <p>
                Zet in de admin een gepubliceerd
                recept op Uitlichten.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MAARTO'S PICKS */}

      <section
        className="picks"
        id="tips"
      >
        <div className="site-shell picks-grid">
          <div>
            <div className="section-eyebrow">
              Tried & tested
            </div>

            <h2 className="picks-title">
              Maarto&apos;s
              <br />
              Picks.
            </h2>

            <p className="picks-copy">
              Spullen die hun plekje naast de Egg
              verdiend hebben. Van favoriete rubs
              tot tools waar je na één keer
              gebruiken niet meer zonder wilt.
              Geen eindeloze lijst met gadgets,
              gewoon dingen die hier écht gebruikt
              worden.
            </p>

            <div
              style={{
                marginTop: "32px",
              }}
            >
              <Link
                href="/#tips"
                className="text-link"
              >
                Bekijk alle tips
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="picks-list">
            {picks.map((pick) => (
              <div
                className="pick-item"
                key={pick.number}
              >
                <div className="pick-number">
                  {pick.number}
                </div>

                <div className="pick-name">
                  {pick.name}
                </div>

                <div className="pick-type">
                  {pick.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVER MAARTO PLACEHOLDER */}

      <section
        id="over-maarto"
        style={{
          padding: "100px 0",
          background: "var(--background)",
        }}
      >
        <div className="site-shell">
          <div className="section-eyebrow">
            Behind the Egg
          </div>

          <h2
            className="section-title"
            style={{
              color: "var(--cream)",
            }}
          >
            Over Maarto.
          </h2>

          <p
            className="hero-description"
            style={{
              marginTop: "24px",
            }}
          >
            Binnenkort meer over de man achter
            het vuur, de cooks en de lichte
            obsessie met alles wat op de Egg kan.
          </p>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="site-shell footer-inner">
          <div className="footer-brand">
            Maarto&apos;s on that Egg
          </div>

          <div>
            Fire. Food. Patience.
          </div>
        </div>
      </footer>
    </main>
  );
}