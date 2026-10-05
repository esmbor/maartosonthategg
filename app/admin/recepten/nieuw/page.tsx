import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecipeForm from "@/components/admin/RecipeForm";

export default async function NewRecipePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  return (
    <main className="admin-page">
      <div className="site-shell admin-form-shell">
        <Link href="/admin/recepten" className="admin-back-link">
          ← Terug naar recepten
        </Link>

        <div className="hero-eyebrow">Admin · Nieuw recept</div>

        <h1 className="admin-form-title">
          Nieuwe
          <span>cook.</span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Alles wat nodig is om deze cook straks netjes op Maarto&apos;s on
          that Egg te zetten.
        </p>

        <RecipeForm />
      </div>
    </main>
  );
}