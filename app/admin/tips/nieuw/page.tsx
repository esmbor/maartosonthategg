import Link from "next/link";
import { redirect } from "next/navigation";

import TipForm from "@/components/admin/TipForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewTipPage() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getClaims();

  if (
    error ||
    !data?.claims
  ) {
    redirect(
      "/admin/login"
    );
  }

  return (
    <main className="admin-page">
      <div className="site-shell admin-form-shell">
        <Link
          href="/admin/tips"
          className="admin-back-link"
        >
          ← Terug naar tips
        </Link>

        <div className="hero-eyebrow">
          Admin · Nieuwe tip
        </div>

        <h1 className="admin-form-title">
          New
          <span>
            favourite.
          </span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Gear, kruiden of iets anders waar de
          Egg inmiddels niet meer zonder kan.
        </p>

        <TipForm />
      </div>
    </main>
  );
}