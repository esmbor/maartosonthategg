import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  const userId = data.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", userId)
    .single();

  return (
    <main className="admin-page">
      <div className="site-shell">
        <div className="admin-header">
          <div>
            <div className="hero-eyebrow">Maarto&apos;s backstage</div>

            <h1 className="admin-title">
              Welkom
              {profile?.display_name
                ? `, ${profile.display_name}`
                : ""}
              .
            </h1>

            <p className="admin-intro">
              Tijd om iets lekkers op de Egg te gooien.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="admin-dashboard-grid">
          <a href="/admin/recepten" className="admin-dashboard-card">
            <span className="admin-dashboard-number">01</span>

            <div>
              <span className="admin-dashboard-eyebrow">
                Recipes
              </span>

              <h2>Recepten</h2>

              <p>
                Recepten toevoegen, aanpassen en publiceren.
              </p>
            </div>

            <span className="admin-dashboard-arrow">→</span>
          </a>

          <a href="/admin/tips" className="admin-dashboard-card">
            <span className="admin-dashboard-number">02</span>

            <div>
              <span className="admin-dashboard-eyebrow">
                Maarto&apos;s Picks
              </span>

              <h2>Tips</h2>

              <p>
                Gear, kruiden, sauzen en andere favorieten.
              </p>
            </div>

            <span className="admin-dashboard-arrow">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}