import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

function formatMinutes(minutes: number | null) {
  if (!minutes) return "—";

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

export default async function RecipesPage() {
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(`
      id,
      title,
      slug,
      description,
      category,
      cooking_style,
      difficulty,
      servings,
      prep_time_minutes,
      cook_time_minutes,
      bbq_temperature_c,
      featured,
      created_at
    `)
    .eq("published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading recipes:", error);
  }

  const recipeIds =
    recipes?.map((recipe) => recipe.id) ?? [];

  let mainImages: {
    recipe_id: string;
    storage_path: string;
    alt_text: string | null;
  }[] = [];

  if (recipeIds.length > 0) {
    const { data: images, error: imagesError } =
      await supabase
        .from("recipe_images")
        .select(`
          recipe_id,
          storage_path,
          alt_text
        `)
        .in("recipe_id", recipeIds)
        .eq("is_main", true);

    if (imagesError) {
      console.error(
        "Error loading recipe images:",
        imagesError
      );
    }

    mainImages = images ?? [];
  }

  const recipesWithImages =
    recipes?.map((recipe) => {
      const image = mainImages.find(
        (item) => item.recipe_id === recipe.id
      );

      let imageUrl: string | null = null;

      if (image) {
        const { data } = supabase.storage
          .from("maarto-images")
          .getPublicUrl(image.storage_path);

        imageUrl = data.publicUrl;
      }

      return {
        ...recipe,
        imageUrl,
        imageAlt:
          image?.alt_text ?? recipe.title,
      };
    }) ?? [];

  return (
    <main className="recipes-page">
      {/* Header */}

      <header className="recipe-site-header">
        <div className="site-shell recipe-header-inner">
          <Link href="/" className="brand">
            <Image
              src="/images/logo.png"
              alt="Maarto's on that Egg"
              width={70}
              height={70}
            />
          </Link>

          <nav className="recipe-public-nav">
            <Link href="/recepten">
              Recepten
            </Link>

            <Link href="/#tips">
              Maarto&apos;s Tips
            </Link>

            <Link href="/#over-maarto">
              Over Maarto
            </Link>
          </nav>
        </div>
      </header>

      {/* Intro */}

      <section className="recipes-overview-hero">
        <div className="site-shell">
          <div className="recipes-overview-copy">
            <div className="section-eyebrow">
              From the Egg
            </div>

            <h1>
              FIRE.
              <span>FOOD.</span>
              PATIENCE.
            </h1>

            <p>
              Alles wat van de Egg af kwam en goed genoeg
              was om nog een keer te maken. Van low & slow
              tot hot & fast.
            </p>
          </div>
        </div>
      </section>

      {/* Recipes */}

      <section className="recipes-overview-section">
        <div className="site-shell">
          <div className="recipes-overview-heading">
            <div>
              <div className="section-eyebrow">
                What&apos;s on the Egg?
              </div>

              <h2>
                Alle recepten.
              </h2>
            </div>

            <span>
              {String(
                recipesWithImages.length
              ).padStart(2, "0")}{" "}
              cooks
            </span>
          </div>

          {recipesWithImages.length === 0 ? (
            <div className="recipes-empty-state">
              <div>🔥</div>

              <h3>
                Nog niks op de Egg.
              </h3>

              <p>
                De eerste cook moet nog gepubliceerd worden.
              </p>
            </div>
          ) : (
            <div className="recipes-public-grid">
              {recipesWithImages.map(
                (recipe, index) => (
                  <Link
                    href={`/recepten/${recipe.slug}`}
                    className="public-recipe-card"
                    key={recipe.id}
                  >
                    <div className="public-recipe-image">
                      {recipe.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.imageAlt}
                        />
                      ) : (
                        <div className="public-recipe-image-placeholder">
                          🔥
                        </div>
                      )}

                      {recipe.featured && (
                        <div className="public-recipe-featured">
                          Maarto&apos;s pick
                        </div>
                      )}

                      <div className="public-recipe-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>
                    </div>

                    <div className="public-recipe-content">
                      <div className="public-recipe-tags">
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

                      <h3>
                        {recipe.title}
                      </h3>

                      {recipe.description && (
                        <p>
                          {recipe.description}
                        </p>
                      )}

                      <div className="public-recipe-meta">
                        <span>
                          {formatMinutes(
                            recipe.cook_time_minutes
                          )}
                        </span>

                        {recipe.bbq_temperature_c && (
                          <span>
                            {
                              recipe.bbq_temperature_c
                            }
                            °C
                          </span>
                        )}

                        {recipe.difficulty && (
                          <span>
                            {recipe.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="public-recipe-link">
                        Bekijk recept
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

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