"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormEvent, ReactNode, useState } from "react";

type Ingredient = {
  amount: string;
  unit: string;
  ingredient: string;
};

type Step = {
  instruction: string;
};

export type RecipeFormInitialData = {
  id: string;

  title: string;
  slug: string;
  description: string | null;

  category: string | null;
  cooking_style: string | null;
  difficulty: string | null;

  servings: number | null;

  prep_time_minutes: number | null;
  cook_time_minutes: number | null;

  bbq_temperature_c: number | null;
  core_temperature_c: number | null;

  instagram_url: string | null;
  maarto_tip: string | null;

  featured: boolean;
  published: boolean;

  ingredients: {
    amount: number | null;
    unit: string | null;
    ingredient: string;
  }[];

  steps: {
    instruction: string;
  }[];
};

type RecipeFormProps = {
  initialData?: RecipeFormInitialData;
  imagesSection?: ReactNode;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RecipeForm({
  initialData,
  imagesSection,
}: RecipeFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(
    initialData?.title ?? ""
  );

  const [slug, setSlug] = useState(
    initialData?.slug ?? ""
  );

  /*
   * Bij een bestaand recept willen we de slug niet automatisch
   * veranderen als iemand alleen de titel aanpast.
   */
  const [slugEdited, setSlugEdited] =
    useState(isEditing);

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [category, setCategory] = useState(
    initialData?.category ?? ""
  );

  const [cookingStyle, setCookingStyle] = useState(
    initialData?.cooking_style ?? ""
  );

  const [difficulty, setDifficulty] = useState(
    initialData?.difficulty ?? ""
  );

  const [servings, setServings] = useState(
    initialData?.servings?.toString() ?? ""
  );

  const [prepTime, setPrepTime] = useState(
    initialData?.prep_time_minutes?.toString() ?? ""
  );

  const [cookTime, setCookTime] = useState(
    initialData?.cook_time_minutes?.toString() ?? ""
  );

  const [bbqTemperature, setBbqTemperature] =
    useState(
      initialData?.bbq_temperature_c?.toString() ?? ""
    );

  const [coreTemperature, setCoreTemperature] =
    useState(
      initialData?.core_temperature_c?.toString() ?? ""
    );

  const [instagramUrl, setInstagramUrl] = useState(
    initialData?.instagram_url ?? ""
  );

  const [maartoTip, setMaartoTip] = useState(
    initialData?.maarto_tip ?? ""
  );

  const [featured, setFeatured] = useState(
    initialData?.featured ?? false
  );

  const [published, setPublished] = useState(
    initialData?.published ?? false
  );

  const [ingredients, setIngredients] = useState<
    Ingredient[]
  >(
    initialData?.ingredients.length
      ? initialData.ingredients.map((ingredient) => ({
          amount:
            ingredient.amount?.toString() ?? "",
          unit: ingredient.unit ?? "",
          ingredient: ingredient.ingredient,
        }))
      : [
          {
            amount: "",
            unit: "",
            ingredient: "",
          },
        ]
  );

  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps.length
      ? initialData.steps.map((step) => ({
          instruction: step.instruction,
        }))
      : [
          {
            instruction: "",
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    setIngredients((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        amount: "",
        unit: "",
        ingredient: "",
      },
    ]);
  }

  function removeIngredient(index: number) {
    setIngredients((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function updateStep(
    index: number,
    value: string
  ) {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index
          ? {
              instruction: value,
            }
          : step
      )
    );
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        instruction: "",
      },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) =>
      current.filter(
        (_, stepIndex) => stepIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Je sessie is verlopen. Log opnieuw in."
      );
      setSaving(false);
      return;
    }

    const recipePayload = {
      title,
      slug,

      description: description || null,

      category: category || null,
      cooking_style: cookingStyle || null,
      difficulty: difficulty || null,

      servings: servings
        ? Number(servings)
        : null,

      prep_time_minutes: prepTime
        ? Number(prepTime)
        : null,

      cook_time_minutes: cookTime
        ? Number(cookTime)
        : null,

      bbq_temperature_c: bbqTemperature
        ? Number(bbqTemperature)
        : null,

      core_temperature_c: coreTemperature
        ? Number(coreTemperature)
        : null,

      instagram_url: instagramUrl || null,
      maarto_tip: maartoTip || null,

      featured,
      published,

      updated_by: user.id,
    };

    let recipeId: string;

    /*
     * --------------------------------
     * UPDATE bestaand recept
     * --------------------------------
     */
    if (initialData) {
      const { data: recipe, error: recipeError } =
        await supabase
          .from("recipes")
          .update(recipePayload)
          .eq("id", initialData.id)
          .select("id")
          .single();

      if (recipeError || !recipe) {
        setErrorMessage(
          recipeError?.message ??
            "Het recept kon niet worden bijgewerkt."
        );

        setSaving(false);
        return;
      }

      recipeId = recipe.id;
    }

    /*
     * --------------------------------
     * INSERT nieuw recept
     * --------------------------------
     */
    else {
      const { data: recipe, error: recipeError } =
        await supabase
          .from("recipes")
          .insert({
            ...recipePayload,

            created_by: user.id,
          })
          .select("id")
          .single();

      if (recipeError || !recipe) {
        setErrorMessage(
          recipeError?.message ??
            "Het recept kon niet worden opgeslagen."
        );

        setSaving(false);
        return;
      }

      recipeId = recipe.id;
    }

    /*
     * --------------------------------
     * Ingrediënten voorbereiden
     * --------------------------------
     */

    const validIngredients = ingredients.filter(
      (ingredient) =>
        ingredient.ingredient.trim() !== ""
    );

    /*
     * Bij bewerken vervangen we de bestaande lijst.
     */
    if (initialData) {
      const { error: deleteIngredientsError } =
        await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", recipeId);

      if (deleteIngredientsError) {
        setErrorMessage(
          `Bestaande ingrediënten konden niet worden bijgewerkt: ${deleteIngredientsError.message}`
        );

        setSaving(false);
        return;
      }
    }

    if (validIngredients.length > 0) {
      const { error: ingredientsError } =
        await supabase
          .from("recipe_ingredients")
          .insert(
            validIngredients.map(
              (ingredient, index) => ({
                recipe_id: recipeId,

                amount: ingredient.amount
                  ? Number(
                      ingredient.amount.replace(
                        ",",
                        "."
                      )
                    )
                  : null,

                unit: ingredient.unit || null,

                ingredient:
                  ingredient.ingredient,

                sort_order: index,
              })
            )
          );

      if (ingredientsError) {
        /*
         * Alleen bij een nieuw recept ruimen we
         * het recept weer op.
         */
        if (!initialData) {
          await supabase
            .from("recipes")
            .delete()
            .eq("id", recipeId);
        }

        setErrorMessage(
          `Ingrediënten konden niet worden opgeslagen: ${ingredientsError.message}`
        );

        setSaving(false);
        return;
      }
    }

    /*
     * --------------------------------
     * Bereidingsstappen
     * --------------------------------
     */

    const validSteps = steps.filter(
      (step) => step.instruction.trim() !== ""
    );

    if (initialData) {
      const { error: deleteStepsError } =
        await supabase
          .from("recipe_steps")
          .delete()
          .eq("recipe_id", recipeId);

      if (deleteStepsError) {
        setErrorMessage(
          `Bestaande bereidingsstappen konden niet worden bijgewerkt: ${deleteStepsError.message}`
        );

        setSaving(false);
        return;
      }
    }

    if (validSteps.length > 0) {
      const { error: stepsError } =
        await supabase
          .from("recipe_steps")
          .insert(
            validSteps.map((step, index) => ({
              recipe_id: recipeId,
              step_number: index + 1,
              instruction: step.instruction,
            }))
          );

      if (stepsError) {
        if (!initialData) {
          await supabase
            .from("recipes")
            .delete()
            .eq("id", recipeId);
        }

        setErrorMessage(
          `Bereidingsstappen konden niet worden opgeslagen: ${stepsError.message}`
        );

        setSaving(false);
        return;
      }
    }

    if (initialData) {
        router.push("/admin/recepten");
    } else {
        router.push(
            `/admin/recepten/${recipeId}`
        );
    }
        router.refresh();
  }

  return (
    <form
      className="recipe-admin-form"
      onSubmit={handleSubmit}
    >
      {/* -------------------------- */}
      {/* 01 - Basis                */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>

          <div>
            <h2>De basis</h2>
            <p>
              Waar hebben we het vandaag over?
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <label htmlFor="title">
              Naam van het recept *
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) =>
                handleTitleChange(
                  event.target.value
                )
              }
              placeholder="Bijv. Pulled pork"
              required
            />
          </div>

          <div className="admin-field admin-field-wide">
            <label htmlFor="slug">URL *</label>

            <div className="admin-slug-field">
              <span>/recepten/</span>

              <input
                id="slug"
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSlug(
                    createSlug(event.target.value)
                  );
                }}
                required
              />
            </div>
          </div>

          <div className="admin-field admin-field-wide">
            <label htmlFor="description">
              Korte omschrijving
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Een korte intro van deze cook..."
              rows={4}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="category">
              Categorie
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="">
                Kies categorie
              </option>
              <option value="Rund">Rund</option>
              <option value="Varken">
                Varken
              </option>
              <option value="Kip">Kip</option>
              <option value="Vis">Vis</option>
              <option value="Vega">Vega</option>
              <option value="Side dish">
                Side dish
              </option>
              <option value="Saus">Saus</option>
              <option value="Pizza">Pizza</option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="cookingStyle">
              Bereidingsstijl
            </label>

            <select
              id="cookingStyle"
              value={cookingStyle}
              onChange={(event) =>
                setCookingStyle(
                  event.target.value
                )
              }
            >
              <option value="">
                Kies stijl
              </option>
              <option value="Low & Slow">
                Low & Slow
              </option>
              <option value="Direct">
                Direct
              </option>
              <option value="Indirect">
                Indirect
              </option>
              <option value="Reverse Sear">
                Reverse Sear
              </option>
              <option value="Hot & Fast">
                Hot & Fast
              </option>
              <option value="Dutch Oven">
                Dutch Oven
              </option>
              <option value="Rotisserie">
                Rotisserie
              </option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="difficulty">
              Moeilijkheid
            </label>

            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value
                )
              }
            >
              <option value="">
                Kies niveau
              </option>
              <option value="Makkelijk">
                Makkelijk
              </option>
              <option value="Gemiddeld">
                Gemiddeld
              </option>
              <option value="Uitdagend">
                Uitdagend
              </option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="servings">
              Personen
            </label>

            <input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(event) =>
                setServings(event.target.value)
              }
              placeholder="4"
            />
          </div>
        </div>
      </section>

      {/* -------------------------- */}
      {/* 02 - Fire control         */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>

          <div>
            <h2>Fire control</h2>
            <p>Tijden en temperaturen.</p>
          </div>
        </div>

        <div className="admin-form-grid admin-form-grid-four">
          <div className="admin-field">
            <label htmlFor="prepTime">
              Voorbereiding
            </label>

            <div className="admin-input-unit">
              <input
                id="prepTime"
                type="number"
                min="0"
                value={prepTime}
                onChange={(event) =>
                  setPrepTime(
                    event.target.value
                  )
                }
              />
              <span>min</span>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="cookTime">
              Bereiding
            </label>

            <div className="admin-input-unit">
              <input
                id="cookTime"
                type="number"
                min="0"
                value={cookTime}
                onChange={(event) =>
                  setCookTime(
                    event.target.value
                  )
                }
              />
              <span>min</span>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="bbqTemperature">
              BBQ temperatuur
            </label>

            <div className="admin-input-unit">
              <input
                id="bbqTemperature"
                type="number"
                value={bbqTemperature}
                onChange={(event) =>
                  setBbqTemperature(
                    event.target.value
                  )
                }
              />
              <span>°C</span>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="coreTemperature">
              Kerntemperatuur
            </label>

            <div className="admin-input-unit">
              <input
                id="coreTemperature"
                type="number"
                value={coreTemperature}
                onChange={(event) =>
                  setCoreTemperature(
                    event.target.value
                  )
                }
              />
              <span>°C</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- */}
      {/* 03 - Ingrediënten         */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>03</span>

          <div>
            <h2>Ingrediënten</h2>
            <p>
              Alles wat klaar moet liggen voordat
              het vuur aangaat.
            </p>
          </div>
        </div>

        <div className="admin-repeat-list">
          {ingredients.map(
            (ingredient, index) => (
              <div
                className="admin-ingredient-row"
                key={index}
              >
                <div className="admin-field">
                  <label>Hoeveelheid</label>

                  <input
                    value={ingredient.amount}
                    onChange={(event) =>
                      updateIngredient(
                        index,
                        "amount",
                        event.target.value
                      )
                    }
                    placeholder="500"
                  />
                </div>

                <div className="admin-field">
                  <label>Eenheid</label>

                  <input
                    value={ingredient.unit}
                    onChange={(event) =>
                      updateIngredient(
                        index,
                        "unit",
                        event.target.value
                      )
                    }
                    placeholder="g"
                  />
                </div>

                <div className="admin-field admin-ingredient-name">
                  <label>Ingrediënt</label>

                  <input
                    value={
                      ingredient.ingredient
                    }
                    onChange={(event) =>
                      updateIngredient(
                        index,
                        "ingredient",
                        event.target.value
                      )
                    }
                    placeholder="Procureur"
                  />
                </div>

                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="admin-remove-button"
                    onClick={() =>
                      removeIngredient(index)
                    }
                    aria-label="Ingrediënt verwijderen"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={addIngredient}
        >
          + Ingrediënt toevoegen
        </button>
      </section>

      {/* -------------------------- */}
      {/* 04 - Stappen              */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>04</span>

          <div>
            <h2>Aan de slag</h2>
            <p>
              Stap voor stap richting iets lekkers.
            </p>
          </div>
        </div>

        <div className="admin-repeat-list">
          {steps.map((step, index) => (
            <div
              className="admin-step-row"
              key={index}
            >
              <div className="admin-step-number">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </div>

              <div className="admin-field admin-step-field">
                <label>Bereidingsstap</label>

                <textarea
                  value={step.instruction}
                  onChange={(event) =>
                    updateStep(
                      index,
                      event.target.value
                    )
                  }
                  placeholder="Beschrijf wat er in deze stap gebeurt..."
                  rows={4}
                />
              </div>

              {steps.length > 1 && (
                <button
                  type="button"
                  className="admin-remove-button"
                  onClick={() =>
                    removeStep(index)
                  }
                  aria-label="Stap verwijderen"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={addStep}
        >
          + Stap toevoegen
        </button>
      </section>

      {/* -------------------------- */}
      {/* 05 - Extra                */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>05</span>

          <div>
            <h2>The good stuff</h2>
            <p>
              Persoonlijke tips en extra&apos;s.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <label htmlFor="maartoTip">
              Maarto&apos;s Tip
            </label>

            <textarea
              id="maartoTip"
              value={maartoTip}
              onChange={(event) =>
                setMaartoTip(event.target.value)
              }
              placeholder="Wat moet je bij dit recept écht weten?"
              rows={4}
            />
          </div>

          <div className="admin-field admin-field-wide">
            <label htmlFor="instagramUrl">
              Instagram-link
            </label>

            <input
              id="instagramUrl"
              type="url"
              value={instagramUrl}
              onChange={(event) =>
                setInstagramUrl(
                  event.target.value
                )
              }
              placeholder="https://www.instagram.com/..."
            />
          </div>
        </div>
      </section>

      {/* -------------------------- */}
      {/* 06 - Publicatie           */}
      {/* -------------------------- */}

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>06</span>

          <div>
            <h2>Ready to serve?</h2>
            <p>
              Bepaal wat er op de site verschijnt.
            </p>
          </div>
        </div>

        <div className="admin-toggle-list">
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) =>
                setFeatured(
                  event.target.checked
                )
              }
            />

            <span>
              <strong>Uitlichten</strong>
              <small>
                Dit recept kan op de homepage
                verschijnen.
              </small>
            </span>
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(
                  event.target.checked
                )
              }
            />

            <span>
              <strong>Publiceren</strong>
              <small>
                Zet uit om het recept eerst als
                concept te bewaren.
              </small>
            </span>
          </label>
        </div>
      </section>

      {imagesSection}

      {errorMessage && (
        <div className="admin-form-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-form-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? "Opslaan..."
            : initialData
              ? "Wijzigingen opslaan"
              : published
                ? "Recept publiceren"
                : "Concept opslaan"}
        </button>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/recepten")
          }
          disabled={saving}
        >
          Annuleren
        </button>

        
      </div>
    </form>
  );
}