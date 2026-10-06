import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TipPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const supabase =
    await createClient();

  const {
    data: tip,
    error: tipError,
  } = await supabase
    .from("tips")
    .select(`
      id,
      name,
      slug,
      type,
      description,
      external_url,
      featured,
      published
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (
    tipError ||
    !tip
  ) {
    notFound();
  }

  const {
    data: imageData,
    error: imageError,
  } = await supabase
    .from("tip_images")
    .select(`
      id,
      storage_path,
      alt_text,
      is_main,
      sort_order
    `)
    .eq("tip_id", tip.id)
    .order("sort_order", {
      ascending: true,
    });

  if (imageError) {
    console.error(
      "Error loading tip images:",
      imageError
    );
  }

  const images =
    (imageData ?? []).map(
      (image) => {
        const { data } =
          supabase.storage
            .from("maarto-images")
            .getPublicUrl(
              image.storage_path
            );

        return {
          ...image,
          publicUrl:
            data.publicUrl,
        };
      }
    );

  const mainImage =
    images.find(
      (image) =>
        image.is_main
    ) ??
    images[0] ??
    null;

  return (
    <main className="tip-page">
      <PublicHeader />

      <section className="tip-detail-hero">
        <div className="site-shell">
          <Link
            href="/tips"
            className="recipe-back-link"
          >
            ← Alle tips
          </Link>

          <div className="tip-detail-hero-grid">
            <div className="tip-main-image">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    mainImage.publicUrl
                  }
                  alt={
                    mainImage.alt_text ??
                    tip.name
                  }
                />
              ) : (
                <div className="recipe-image-placeholder">
                  <span>🔥</span>

                  <p>
                    Nog geen foto.
                  </p>
                </div>
              )}

              {tip.featured && (
                <div className="recipe-featured-sticker">
                  Maarto&apos;s
                  <br />
                  pick
                </div>
              )}
            </div>

            <div className="tip-hero-content">
              {tip.type && (
                <div className="recipe-hero-tags">
                  <span>
                    {tip.type}
                  </span>
                </div>
              )}

              <h1>
                {tip.name}
              </h1>

              {tip.description && (
                <p className="recipe-lead">
                  {tip.description}
                </p>
              )}

              {tip.external_url && (
                <a
                  href={
                    tip.external_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button"
                >
                  Bekijk product →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {images.length > 1 && (
        <section className="recipe-gallery-section">
          <div className="site-shell">
            <div className="recipe-gallery-heading">
              <div>
                <div className="section-eyebrow">
                  Tried & tested
                </div>

                <h2>
                  In use.
                </h2>
              </div>

              <span>
                {String(
                  images.length
                ).padStart(2, "0")}{" "}
                foto&apos;s
              </span>
            </div>

            <div className="recipe-gallery">
              {images.map(
                (image, index) => (
                  <figure
                    className={`recipe-gallery-item ${
                      index === 0
                        ? "recipe-gallery-item-large"
                        : ""
                    }`}
                    key={image.id}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        image.publicUrl
                      }
                      alt={
                        image.alt_text ??
                        tip.name
                      }
                    />
                  </figure>
                )
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="site-shell footer-inner">
          <div className="footer-brand">
            Maarto&apos;s on that Egg
          </div>

          <div>
            Fire. Food. Patience.
          </div>
        </div>
      </footer>
    </main>
  );
}