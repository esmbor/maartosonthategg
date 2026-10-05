import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRecipesPage() {
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
      updated_at,
      updated_by
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading recipes:", error);
  }

  return (
    <main className="admin-page">
      <div className="site-shell">
        <div className="admin-list-header">
          <div>
            <Link href="/admin" className="admin-back-link">
                ← Terug naar admin
            </Link>
            <div className="hero-eyebrow">Admin · Recepten</div>

            <h1 className="admin-title">Recepten.</h1>

            <p className="admin-intro">
              Voeg nieuwe cooks toe, werk recepten bij en bepaal wat er live staat.
            </p>
          </div>

          <Link
            href="/admin/recepten/nieuw"
            className="primary-button"
          >
            Nieuw recept
          </Link>
        </div>

        <div className="admin-recipe-list">
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe) => (
              <Link
                href={`/admin/recepten/${recipe.id}`}
                className="admin-recipe-row"
                key={recipe.id}
              >
                <div>
                  <div className="admin-recipe-title">
                    {recipe.title}
                  </div>

                  <div className="admin-recipe-slug">
                    /recepten/{recipe.slug}
                  </div>
                </div>

                <div className="admin-recipe-meta">
                  <span
                    className={
                      recipe.published
                        ? "admin-status admin-status-published"
                        : "admin-status admin-status-draft"
                    }
                  >
                    {recipe.published ? "Gepubliceerd" : "Concept"}
                  </span>

                  <span className="admin-recipe-date">
                    {new Date(recipe.updated_at).toLocaleDateString(
                      "nl-NL",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span className="admin-recipe-arrow">→</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">🔥</div>

              <h2>Nog geen recepten.</h2>

              <p>
                Tijd om de eerste cook toe te voegen.
              </p>

              <Link
                href="/admin/recepten/nieuw"
                className="primary-button"
              >
                Eerste recept toevoegen
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}