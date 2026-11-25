
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./RecipeFilters.module.css";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  card_intro: string | null;
  category: string | null;
  cooking_style: string | null;
  difficulty: string | null;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  bbq_temperature_c: number | null;
  featured: boolean;
  imageUrl: string | null;
  imageAlt: string;
};

type RecipeFiltersProps = {
  recipes: Recipe[];
};

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

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("nl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function RecipeFilters({
  recipes,
}: RecipeFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cookingStyle, setCookingStyle] = useState("all");

  const categories = useMemo(
    () =>
      [...new Set(
        recipes
          .map((recipe) => recipe.category?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort((a, b) => a.localeCompare(b, "nl")),
    [recipes]
  );

  const cookingStyles = useMemo(
    () =>
      [...new Set(
        recipes
          .map((recipe) => recipe.cooking_style?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort((a, b) => a.localeCompare(b, "nl")),
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    const terms = normalizeText(search)
      .split(/\s+/)
      .filter(Boolean);

    return recipes.filter((recipe) => {
      const searchableText = normalizeText(
        [
          recipe.title,
          recipe.card_intro,
          recipe.category,
          recipe.cooking_style,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const matchesSearch = terms.every((term) =>
        searchableText.includes(term)
      );

      const matchesCategory =
        category === "all" ||
        recipe.category?.trim() === category;

      const matchesStyle =
        cookingStyle === "all" ||
        recipe.cooking_style?.trim() === cookingStyle;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStyle
      );
    });
  }, [recipes, search, category, cookingStyle]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    cookingStyle !== "all";

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setCookingStyle("all");
  }

  return (
    <div>
      {/* Search and filters */}

      {recipes.length > 0 && (
        <div className={styles.filterPanel}>
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Zoek een recept..."
                aria-label="Zoek een recept"
              />
            </div>

            <div className={styles.styleField}>
              <label htmlFor="cooking-style-filter">
                Bereidingswijze
              </label>

              <select
                id="cooking-style-filter"
                value={cookingStyle}
                onChange={(event) =>
                  setCookingStyle(event.target.value)
                }
              >
                <option value="all">
                  Alle bereidingswijzen
                </option>

                {cookingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.categoryRow}>
            <div className={styles.categoryButtons}>
              <button
                type="button"
                className={`${styles.categoryButton} ${
                  category === "all"
                    ? styles.categoryButtonActive
                    : ""
                }`}
                onClick={() => setCategory("all")}
                aria-pressed={category === "all"}
              >
                Alles
              </button>

              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`${styles.categoryButton} ${
                    category === item
                      ? styles.categoryButtonActive
                      : ""
                  }`}
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterFooter}>
            <span className={styles.resultCount}>
              <strong>
                {String(filteredRecipes.length).padStart(2, "0")}
              </strong>{" "}
              {filteredRecipes.length === 1
                ? "recept gevonden"
                : "recepten gevonden"}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={resetFilters}
              >
                Wis filters ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* No published recipes */}

      {recipes.length === 0 && (
        <div className="recipes-empty-state">
          <div>🔥</div>

          <h3>Nog niks op de Egg.</h3>

          <p>
            De eerste cook moet nog gepubliceerd worden.
          </p>
        </div>
      )}

      {/* No matching recipes */}

      {recipes.length > 0 &&
        filteredRecipes.length === 0 && (
          <div className={styles.noResults}>
            <div>🔍</div>

            <h3>Geen recepten gevonden.</h3>

            <p>
              Probeer een andere zoekterm of pas je filters
              aan.
            </p>

            <button
              type="button"
              className={styles.resetResultsButton}
              onClick={resetFilters}
            >
              Bekijk alle recepten
            </button>
          </div>
        )}

      {/* Recipe cards */}

      {filteredRecipes.length > 0 && (
        <div className="recipes-public-grid">
          {filteredRecipes.map((recipe, index) => (
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
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="public-recipe-content">
                <div className="public-recipe-tags">
                  {recipe.category && (
                    <span>{recipe.category}</span>
                  )}

                  {recipe.cooking_style && (
                    <span>{recipe.cooking_style}</span>
                  )}
                </div>

                <h3>{recipe.title}</h3>

                {recipe.card_intro && (
                  <p>{recipe.card_intro}</p>
                )}

                <div className="public-recipe-meta">
                  <span>
                    {formatMinutes(recipe.cook_time_minutes)}
                  </span>

                  {recipe.bbq_temperature_c && (
                    <span>{recipe.bbq_temperature_c}°C</span>
                  )}

                  {recipe.difficulty && (
                    <span>{recipe.difficulty}</span>
                  )}
                </div>

                <div className="public-recipe-link">
                  Bekijk recept
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}