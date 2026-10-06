import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import FeaturedRecipesManager from "@/components/admin/FeaturedRecipesManager";

export default async function FeaturedRecipesPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/admin/login");
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(`
      id,
      title,
      slug,
      published,
      featured,
      featured_order,
      cooking_style,
      category,
      created_at
    `)
    .eq("published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading recipes for featured manager:",
      error
    );
  }

  const recipeIds =
    recipes?.map((recipe) => recipe.id) ?? [];

  let images: {
    recipe_id: string;
    storage_path: string;
    alt_text: string | null;
  }[] = [];

  if (recipeIds.length > 0) {
    const { data: imageData, error: imageError } =
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

    images = imageData ?? [];
  }

  const recipesWithImages =
    recipes?.map((recipe) => {
      const image = images.find(
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

  return (
    <main className="admin-page">
      <div className="site-shell admin-form-shell">
        <Link
          href="/admin"
          className="admin-back-link"
        >
          ← Terug naar admin
        </Link>

        <div className="hero-eyebrow">
          Admin · Homepage
        </div>

        <h1 className="admin-form-title">
          What&apos;s
          <span>on the Egg?</span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Beheer welke drie recepten op de homepage
          worden uitgelicht en bepaal de volgorde.
        </p>

        <FeaturedRecipesManager
          recipes={recipesWithImages}
        />
      </div>
    </main>
  );
}