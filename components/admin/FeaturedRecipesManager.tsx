"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { createClient } from "@/lib/supabase/client";

type Recipe = {
  id: string;
  title: string;
  slug: string;

  featured: boolean;
  featured_order: number | null;

  cooking_style: string | null;
  category: string | null;

  imageUrl: string | null;
  imageAlt: string;
};

type FeaturedRecipesManagerProps = {
  recipes: Recipe[];
};

export default function FeaturedRecipesManager({
  recipes,
}: FeaturedRecipesManagerProps) {
  const initialFeatured = recipes
    .filter((recipe) => recipe.featured)
    .sort(
      (a, b) =>
        (a.featured_order ?? 999) -
        (b.featured_order ?? 999)
    );

  const initialAvailable = recipes.filter(
    (recipe) => !recipe.featured
  );

  const [featured, setFeatured] =
    useState(initialFeatured);

  const [available, setAvailable] =
    useState(initialAvailable);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function saveFeaturedOrder(
    nextFeatured: Recipe[]
  ) {
    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    try {
      const updates = nextFeatured.map(
        (recipe, index) =>
          supabase
            .from("recipes")
            .update({
              featured: true,
              featured_order: index,
            })
            .eq("id", recipe.id)
      );

      const results =
        await Promise.all(updates);

      const failed = results.find(
        (result) => result.error
      );

      if (failed?.error) {
        throw new Error(
          failed.error.message
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De volgorde kon niet worden opgeslagen."
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      featured.findIndex(
        (recipe) =>
          recipe.id === active.id
      );

    const newIndex =
      featured.findIndex(
        (recipe) =>
          recipe.id === over.id
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const previousFeatured = featured;

    const reordered =
      arrayMove(
        featured,
        oldIndex,
        newIndex
      ).map(
        (recipe, index) => ({
          ...recipe,
          featured_order: index,
        })
      );

    setFeatured(reordered);

    try {
      await saveFeaturedOrder(
        reordered
      );
    } catch {
      setFeatured(previousFeatured);
    }
  }

  async function addRecipe(
    recipe: Recipe
  ) {
    if (featured.length >= 3) {
      setErrorMessage(
        "Je kunt maximaal drie recepten uitlichten."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");

    const nextFeatured = [
      ...featured,
      {
        ...recipe,
        featured: true,
        featured_order:
          featured.length,
      },
    ];

    const supabase = createClient();

    const { error } = await supabase
      .from("recipes")
      .update({
        featured: true,
        featured_order:
          featured.length,
      })
      .eq("id", recipe.id);

    if (error) {
      setErrorMessage(
        error.message
      );

      setSaving(false);
      return;
    }

    setFeatured(nextFeatured);

    setAvailable((current) =>
      current.filter(
        (item) =>
          item.id !== recipe.id
      )
    );

    setSaving(false);
  }

  async function removeRecipe(
    recipe: Recipe
  ) {
    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("recipes")
      .update({
        featured: false,
        featured_order: null,
      })
      .eq("id", recipe.id);

    if (error) {
      setErrorMessage(
        error.message
      );

      setSaving(false);
      return;
    }

    const remaining =
      featured
        .filter(
          (item) =>
            item.id !== recipe.id
        )
        .map(
          (item, index) => ({
            ...item,
            featured_order: index,
          })
        );

    setFeatured(remaining);

    setAvailable((current) => [
      {
        ...recipe,
        featured: false,
        featured_order: null,
      },
      ...current,
    ]);

    try {
      await saveFeaturedOrder(
        remaining
      );
    } catch {
      // De UI blijft bruikbaar;
      // foutmelding wordt al gezet in saveFeaturedOrder.
    }

    setSaving(false);
  }

  return (
    <div className="featured-admin">
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>

          <div>
            <h2>
              Uitgelichte recepten
            </h2>

            <p>
              Deze recepten staan momenteel in
              What&apos;s on the Egg? op de homepage.
            </p>
          </div>
        </div>

        <div className="featured-admin-count">
          {featured.length} / 3 geselecteerd
        </div>

        {featured.length === 0 ? (
          <div className="featured-admin-empty">
            <strong>
              Nog geen recepten uitgelicht.
            </strong>

            <p>
              Voeg hieronder een gepubliceerd recept toe.
            </p>
          </div>
        ) : !mounted ? (
          <div className="featured-admin-list">
            {featured.map(
              (recipe, index) => (
                <div
                  className="featured-admin-row"
                  key={recipe.id}
                >
                  <div className="featured-admin-position">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <RecipeImage
                    recipe={recipe}
                  />

                  <div className="featured-admin-info">
                    <div className="featured-admin-tags">
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

                    <strong>
                      {recipe.title}
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={
              closestCenter
            }
            onDragEnd={
              handleDragEnd
            }
          >
            <SortableContext
              items={featured.map(
                (recipe) =>
                  recipe.id
              )}
              strategy={
                verticalListSortingStrategy
              }
            >
              <div className="featured-admin-list">
                {featured.map(
                  (recipe, index) => (
                    <SortableFeaturedRecipe
                      key={recipe.id}
                      recipe={recipe}
                      index={index}
                      onRemove={
                        removeRecipe
                      }
                      disabled={saving}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>

          <div>
            <h2>
              Recept toevoegen
            </h2>

            <p>
              Kies uit de andere gepubliceerde recepten.
            </p>
          </div>
        </div>

        {available.length === 0 ? (
          <div className="featured-admin-empty">
            <strong>
              Geen andere recepten beschikbaar.
            </strong>
          </div>
        ) : (
          <div className="featured-available-grid">
            {available.map(
              (recipe) => (
                <article
                  className="featured-available-card"
                  key={recipe.id}
                >
                  <RecipeImage
                    recipe={recipe}
                  />

                  <div className="featured-available-content">
                    <div className="featured-admin-tags">
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

                    <button
                      type="button"
                      className="admin-secondary-button"
                      disabled={
                        saving ||
                        featured.length >= 3
                      }
                      onClick={() =>
                        addRecipe(recipe)
                      }
                    >
                      + Uitlichten
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {errorMessage && (
        <div className="admin-form-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

type SortableFeaturedRecipeProps = {
  recipe: Recipe;
  index: number;

  onRemove: (
    recipe: Recipe
  ) => void;

  disabled: boolean;
};

function SortableFeaturedRecipe({
  recipe,
  index,
  onRemove,
  disabled,
}: SortableFeaturedRecipeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: recipe.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),

    transition,

    opacity:
      isDragging
        ? 0.55
        : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="featured-admin-row"
    >
      <div className="featured-admin-position">
        {String(index + 1).padStart(
          2,
          "0"
        )}
      </div>

      <RecipeImage
        recipe={recipe}
      />

      <div className="featured-admin-info">
        <div className="featured-admin-tags">
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

        <strong>
          {recipe.title}
        </strong>
      </div>

      <button
        type="button"
        className="featured-drag-handle"
        aria-label="Volgorde wijzigen"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      <button
        type="button"
        className="featured-remove-button"
        disabled={disabled}
        onClick={() =>
          onRemove(recipe)
        }
      >
        Verwijderen
      </button>
    </article>
  );
}

function RecipeImage({
  recipe,
}: {
  recipe: Recipe;
}) {
  if (!recipe.imageUrl) {
    return (
      <div className="featured-admin-image featured-admin-image-placeholder">
        🔥
      </div>
    );
  }

  return (
    <div className="featured-admin-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={recipe.imageUrl}
        alt={recipe.imageAlt}
      />
    </div>
  );
}