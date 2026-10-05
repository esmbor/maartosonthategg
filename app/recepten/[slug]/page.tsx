import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatMinutes(minutes: number | null) {
  if (!minutes) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} u`;
  }

  return `${hours} u ${remainingMinutes} min`;
}

function formatAmount(amount: number | null) {
  if (amount === null) {
    return "";
  }

  return Number(amount).toLocaleString("nl-NL", {
    maximumFractionDigits: 2,
  });
}

export default async function RecipePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: recipe,
    error: recipeError,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      title,
      slug,
      description,
      category,
      cooking_style,
      servings,
      prep_time_minutes,
      cook_time_minutes,
      bbq_temperature_c,
      core_temperature_c,
      difficulty,
      instagram_url,
      maarto_tip,
      featured,
      published
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (recipeError || !recipe) {
    notFound();
  }

  const [
    ingredientsResult,
    stepsResult,
    imagesResult,
  ] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select(`
        id,
        amount,
        unit,
        ingredient,
        sort_order
      `)
      .eq("recipe_id", recipe.id)
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("recipe_steps")
      .select(`
        id,
        step_number,
        instruction
      `)
      .eq("recipe_id", recipe.id)
      .order("step_number", {
        ascending: true,
      }),

    supabase
      .from("recipe_images")
      .select(`
        id,
        storage_path,
        alt_text,
        is_main,
        sort_order
      `)
      .eq("recipe_id", recipe.id)
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  const ingredients =
    ingredientsResult.data ?? [];

  const steps =
    stepsResult.data ?? [];

  const images =
    (imagesResult.data ?? []).map((image) => {
      const { data } = supabase.storage
        .from("maarto-images")
        .getPublicUrl(image.storage_path);

      return {
        ...image,
        publicUrl: data.publicUrl,
      };
    });

  const mainImage =
    images.find((image) => image.is_main) ??
    images[0] ??
    null;

  return (
    <main className="recipe-page">
      {/* -------------------------- */}
      {/* Header                     */}
      {/* -------------------------- */}

      <PublicHeader />

      {/* -------------------------- */}
      {/* Hero                       */}
      {/* -------------------------- */}

      <section className="recipe-detail-hero">
        <div className="site-shell">
          <Link
            href="/recepten"
            className="recipe-back-link"
          >
            ← Alle recepten
          </Link>

          <div className="recipe-detail-hero-grid">
            <div className="recipe-main-image">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage.publicUrl}
                  alt={
                    mainImage.alt_text ??
                    recipe.title
                  }
                />
              ) : (
                <div className="recipe-image-placeholder">
                  <span>🔥</span>
                  <p>
                    Deze cook heeft nog geen foto.
                  </p>
                </div>
              )}

              {recipe.featured && (
                <div className="recipe-featured-sticker">
                  Maarto&apos;s
                  <br />
                  pick
                </div>
              )}
            </div>

            <div className="recipe-hero-content">
              <div className="recipe-hero-tags">
                {recipe.category && (
                  <span>
                    {recipe.category}
                  </span>
                )}

                {recipe.cooking_style && (
                  <span>
                    {recipe.cooking_style}
                  </span>
                )}
              </div>

              <h1>
                {recipe.title}
              </h1>

              {recipe.description && (
                <p className="recipe-lead">
                  {recipe.description}
                </p>
              )}

              <div className="recipe-meta-grid">
                <RecipeMeta
                  label="Voor"
                  value={
                    recipe.servings
                      ? `${recipe.servings} personen`
                      : "—"
                  }
                />

                <RecipeMeta
                  label="Prep"
                  value={formatMinutes(
                    recipe.prep_time_minutes
                  )}
                />

                <RecipeMeta
                  label="Op de Egg"
                  value={formatMinutes(
                    recipe.cook_time_minutes
                  )}
                />

                <RecipeMeta
                  label="Egg"
                  value={
                    recipe.bbq_temperature_c
                      ? `${recipe.bbq_temperature_c}°C`
                      : "—"
                  }
                />

                <RecipeMeta
                  label="Kern"
                  value={
                    recipe.core_temperature_c
                      ? `${recipe.core_temperature_c}°C`
                      : "—"
                  }
                />

                <RecipeMeta
                  label="Niveau"
                  value={
                    recipe.difficulty || "—"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- */}
      {/* Recipe                     */}
      {/* -------------------------- */}

      <section className="recipe-content-section">
        <div className="site-shell recipe-content-grid">
          {/* Ingredients */}

          <aside className="recipe-ingredients">
            <div className="recipe-section-number">
              01
            </div>

            <div className="section-eyebrow">
              Mise en place
            </div>

            <h2>
              Ingrediënten
            </h2>

            {ingredients.length > 0 ? (
              <ul>
                {ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    <div className="recipe-ingredient-amount">
                      {formatAmount(
                        ingredient.amount
                      )}

                      {ingredient.unit && (
                        <>
                          {" "}
                          {ingredient.unit}
                        </>
                      )}
                    </div>

                    <div className="recipe-ingredient-name">
                      {ingredient.ingredient}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="recipe-empty-copy">
                Geen ingrediënten toegevoegd.
              </p>
            )}
          </aside>

          {/* Steps */}

          <div className="recipe-method">
            <div className="recipe-section-number">
              02
            </div>

            <div className="section-eyebrow">
              Fire it up
            </div>

            <h2>
              Aan de slag
            </h2>

            {steps.length > 0 ? (
              <div className="recipe-steps">
                {steps.map((step) => (
                  <article
                    className="recipe-step"
                    key={step.id}
                  >
                    <div className="recipe-step-number">
                      {String(
                        step.step_number
                      ).padStart(2, "0")}
                    </div>

                    <p>
                      {step.instruction}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="recipe-empty-copy">
                Nog geen bereidingsstappen.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------- */}
      {/* Maarto tip                 */}
      {/* -------------------------- */}

      {recipe.maarto_tip && (
        <section className="recipe-tip-section">
          <div className="site-shell">
            <div className="recipe-tip-card">
              <div className="recipe-tip-label">
                🔥 Maarto&apos;s Tip
              </div>

              <blockquote>
                {recipe.maarto_tip}
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------- */}
      {/* Gallery                    */}
      {/* -------------------------- */}

      {images.length > 1 && (
        <section className="recipe-gallery-section">
          <div className="site-shell">
            <div className="recipe-gallery-heading">
              <div>
                <div className="section-eyebrow">
                  From the grill
                </div>

                <h2>
                  The cook.
                </h2>
              </div>

              <span>
                {String(images.length).padStart(
                  2,
                  "0"
                )}{" "}
                foto&apos;s
              </span>
            </div>

            <div className="recipe-gallery">
              {images.map((image, index) => (
                <figure
                  className={`recipe-gallery-item ${
                    index === 0
                      ? "recipe-gallery-item-large"
                      : ""
                  }`}
                  key={image.id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.publicUrl}
                    alt={
                      image.alt_text ??
                      recipe.title
                    }
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------- */}
      {/* Instagram                  */}
      {/* -------------------------- */}

      {recipe.instagram_url && (
        <section className="recipe-instagram-section">
          <div className="site-shell recipe-instagram-inner">
            <div>
              <div className="section-eyebrow">
                From the feed
              </div>

              <h2>
                Seen it on
                <span>Instagram?</span>
              </h2>
            </div>

            <a
              href={recipe.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Bekijk de post →
            </a>
          </div>
        </section>
      )}

      {/* -------------------------- */}
      {/* Footer                     */}
      {/* -------------------------- */}

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

type RecipeMetaProps = {
  label: string;
  value: string;
};

function RecipeMeta({
  label,
  value,
}: RecipeMetaProps) {
  return (
    <div className="recipe-meta-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}