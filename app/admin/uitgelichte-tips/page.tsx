import Link from "next/link";
import { redirect } from "next/navigation";

import FeaturedTipsManager from "@/components/admin/FeaturedTipsManager";
import { createClient } from "@/lib/supabase/server";

export default async function FeaturedTipsPage() {
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
    data: tips,
    error,
  } = await supabase
    .from("tips")
    .select(`
      id,
      name,
      slug,
      type,
      published,
      featured,
      featured_order,
      created_at
    `)
    .eq(
      "published",
      true
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Error loading tips for featured manager:",
      error
    );
  }

  const tipIds =
    tips?.map(
      (tip) =>
        tip.id
    ) ?? [];

  let images: {
    tip_id: string;
    storage_path: string;
    alt_text: string | null;
  }[] = [];

  if (
    tipIds.length > 0
  ) {
    const {
      data: imageData,
      error: imageError,
    } = await supabase
      .from("tip_images")
      .select(`
        tip_id,
        storage_path,
        alt_text
      `)
      .in(
        "tip_id",
        tipIds
      )
      .eq(
        "is_main",
        true
      );

    if (imageError) {
      console.error(
        "Error loading tip images:",
        imageError
      );
    }

    images =
      imageData ?? [];
  }

  const tipsWithImages =
    tips?.map(
      (tip) => {
        const image =
          images.find(
            (item) =>
              item.tip_id ===
              tip.id
          );

        const imageUrl =
          image
            ? supabase.storage
                .from(
                  "maarto-images"
                )
                .getPublicUrl(
                  image.storage_path
                )
                .data.publicUrl
            : null;

        return {
          ...tip,

          imageUrl,

          imageAlt:
            image?.alt_text ??
            tip.name,
        };
      }
    ) ?? [];

  return (
    <main className="admin-page">
      <div className="site-shell admin-form-shell">
        <Link
          href="/admin"
          className="admin-back-link"
        >
          ← Terug naar admin
        </Link>

        <div className="hero-eyebrow">
          Admin · Homepage
        </div>

        <h1 className="admin-form-title">
          Maarto&apos;s
          <span>
            Picks.
          </span>
        </h1>

        <p className="admin-intro admin-form-intro">
          Beheer welke vijf tips op de homepage
          worden uitgelicht en bepaal de volgorde.
        </p>

        <FeaturedTipsManager
          tips={
            tipsWithImages
          }
        />
      </div>
    </main>
  );
}