
import PublicHeader from "@/components/PublicHeader";
import RecipeFilters from "@/components/RecipeFilters";
import { createClient } from "@/lib/supabase/server";
import PublicFooter from "@/components/PublicFooter";


export default async function RecipesPage() {
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(`
      id,
      title,
      slug,
      card_intro,
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
        imageAlt: image?.alt_text ?? recipe.title,
      };
    }) ?? [];

  return (
    <main className="recipes-page">
      {/* Header */}

      <PublicHeader />

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

              <h2>Alle recepten.</h2>
            </div>

            <span>
              {String(recipesWithImages.length).padStart(2, "0")}{" "}
              cooks
            </span>
          </div>

          <RecipeFilters recipes={recipesWithImages} />
        </div>
      </section>

      {/* Footer */}

      <PublicFooter />
    </main>
  );
}