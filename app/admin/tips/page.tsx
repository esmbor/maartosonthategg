import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminTipsPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/admin/login");
  }

  const { data: tips, error } = await supabase
    .from("tips")
    .select(`
      id,
      name,
      slug,
      type,
      published,
      updated_at
    `)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading tips:", error);
  }

  return (
    <main className="admin-page">
      <div className="site-shell">
        <div className="admin-list-header">
          <div>
            <Link
              href="/admin"
              className="admin-back-link"
            >
              ← Terug naar admin
            </Link>

            <div className="hero-eyebrow">
              Admin · Maarto&apos;s Picks
            </div>

            <h1 className="admin-title">
              Tips.
            </h1>

            <p className="admin-intro">
              Gear, kruiden, sauzen en andere dingen
              die hun plekje naast de Egg verdiend hebben.
            </p>
          </div>

          <Link
            href="/admin/tips/nieuw"
            className="primary-button"
          >
            Nieuwe tip
          </Link>
        </div>

        <div className="admin-recipe-list">
          {tips && tips.length > 0 ? (
            tips.map((tip) => (
              <Link
                href={`/admin/tips/${tip.id}`}
                className="admin-recipe-row"
                key={tip.id}
              >
                <div>
                  <div className="admin-recipe-title">
                    {tip.name}
                  </div>

                  <div className="admin-recipe-slug">
                    /tips/{tip.slug}
                    {tip.type && ` · ${tip.type}`}
                  </div>
                </div>

                <div className="admin-recipe-meta">
                  <span
                    className={
                      tip.published
                        ? "admin-status admin-status-published"
                        : "admin-status admin-status-draft"
                    }
                  >
                    {tip.published
                      ? "Gepubliceerd"
                      : "Concept"}
                  </span>

                  <span className="admin-recipe-date">
                    {new Date(
                      tip.updated_at
                    ).toLocaleDateString("nl-NL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <span className="admin-recipe-arrow">
                    →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                🔥
              </div>

              <h2>
                Nog geen tips.
              </h2>

              <p>
                Tijd om de eerste favoriet toe te voegen.
              </p>

              <Link
                href="/admin/tips/nieuw"
                className="primary-button"
              >
                Eerste tip toevoegen
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}