import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import RecipeForm, {
  type RecipeFormInitialData,
} from "@/components/admin/RecipeForm";

import RecipeImagesManager from "@/components/admin/RecipeImagesManager";
import DeleteRecipeButton from "@/components/admin/DeleteRecipeButton";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRecipePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims
  ) {
    redirect("/admin/login");
  }

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
      card_intro,
      category,
      cooking_style,
      difficulty,
      servings,
      prep_time_minutes,
      cook_time_minutes,
      bbq_temperature_c,
      core_temperature_c,
      instagram_url,
      maarto_tip,
      featured,
      published
    `)
    .eq("id", id)
    .single();

  if (
    recipeError ||
    !recipe
  ) {
    notFound();
  }

  const {
    data: ingredients,
    error: ingredientsError,
  } = await supabase
    .from("recipe_ingredients")
    .select(`
      amount,
      unit,
      ingredient,
      sort_order
    `)
    .eq(
      "recipe_id",
      id
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    );

  if (ingredientsError) {
    console.error(
      "Error loading ingredients:",
      ingredientsError
    );
  }

  const {
    data: steps,
    error: stepsError,
  } = await supabase
    .from("recipe_steps")
    .select(`
      step_number,
      instruction
    `)
    .eq(
      "recipe_id",
      id
    )
    .order(
      "step_number",
      {
        ascending: true,
      }
    );

  if (stepsError) {
    console.error(
      "Error loading steps:",
      stepsError
    );
  }

  const initialData: RecipeFormInitialData =
    {
      id: recipe.id,

      title:
        recipe.title,

      slug:
        recipe.slug,

      description:
        recipe.description,

      card_intro:
        recipe.card_intro,

      category:
        recipe.category,

      cooking_style:
        recipe.cooking_style,

      difficulty:
        recipe.difficulty,

      servings:
        recipe.servings,

      prep_time_minutes:
        recipe.prep_time_minutes,

      cook_time_minutes:
        recipe.cook_time_minutes,

      bbq_temperature_c:
        recipe.bbq_temperature_c,

      core_temperature_c:
        recipe.core_temperature_c,

      instagram_url:
        recipe.instagram_url,

      maarto_tip:
        recipe.maarto_tip,

      featured:
        recipe.featured,

      published:
        recipe.published,

      ingredients:
        ingredients?.map(
          (ingredient) => ({
            amount:
              ingredient.amount,

            unit:
              ingredient.unit,

            ingredient:
              ingredient.ingredient,
          })
        ) ?? [],

      steps:
        steps?.map(
          (step) => ({
            instruction:
              step.instruction,
          })
        ) ?? [],
    };

  return (
    <main className="admin-page">
      <div className="site-shell admin-form-shell">
        <Link
          href="/admin/recepten"
          className="admin-back-link"
        >
          ← Terug naar recepten
        </Link>

        <div className="hero-eyebrow">
          Admin · Recept bewerken
        </div>

        <h1 className="admin-form-title">
          Edit
          <span>
            the cook.
          </span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Pas het recept aan,
          beheer de foto&apos;s en
          sla de wijzigingen op
          wanneer alles weer klopt.
        </p>

        <RecipeForm
            initialData={initialData}
            imagesSection={
                <RecipeImagesManager
                recipeId={recipe.id}
                recipeTitle={recipe.title}
                />
            }
            />

        <section className="admin-danger-zone">
          <div>
            <div className="admin-danger-eyebrow">
              Danger zone
            </div>

            <h2>
              Recept verwijderen
            </h2>

            <p>
              Verwijder dit recept
              alleen als het echt niet
              meer nodig is. Deze actie
              kan niet ongedaan worden
              gemaakt.
            </p>
          </div>

          <DeleteRecipeButton
            recipeId={
              recipe.id
            }
            recipeTitle={
              recipe.title
            }
          />
        </section>
      </div>
    </main>
  );
}