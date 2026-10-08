import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import TipForm, {
  type TipFormInitialData,
} from "@/components/admin/TipForm";

import TipImagesManager from "@/components/admin/TipImagesManager";
import DeleteTipButton from "@/components/admin/DeleteTipButton";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTipPage({
  params,
}: PageProps) {
  const { id } =
    await params;

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
    redirect(
      "/admin/login"
    );
  }

  const {
    data: tip,
    error,
  } = await supabase
    .from("tips")
    .select(`
      id,
      name,
      slug,
      type,
      description,
      card_intro,
      external_url,
      featured,
      published
    `)
    .eq(
      "id",
      id
    )
    .single();

  if (
    error ||
    !tip
  ) {
    notFound();
  }

  const initialData: TipFormInitialData = {
    id:
      tip.id,

    name:
      tip.name,

    slug:
      tip.slug,

    type:
      tip.type,

    description:
      tip.description,

    card_intro:
      tip.card_intro,

    external_url:
      tip.external_url,

    featured:
      tip.featured,

    published:
      tip.published,
  };

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
          Admin · Tip bewerken
        </div>

        <h1 className="admin-form-title">
          Edit
          <span>
            the pick.
          </span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Pas deze favoriet aan, beheer de
          foto&apos;s en sla alles op wanneer het klopt.
        </p>

        <TipForm
          initialData={
            initialData
          }
          imagesSection={
            <TipImagesManager
              tipId={
                tip.id
              }
              tipName={
                tip.name
              }
            />
          }
        />

        <section className="admin-danger-zone">
          <div>
            <div className="admin-danger-eyebrow">
              Danger zone
            </div>

            <h2>
              Tip verwijderen
            </h2>

            <p>
              Verwijder deze tip alleen als hij
              echt niet meer nodig is. Ook de
              bijbehorende foto&apos;s worden verwijderd.
            </p>
          </div>

          <DeleteTipButton
            tipId={
              tip.id
            }
            tipName={
              tip.name
            }
          />
        </section>
      </div>
    </main>
  );
}