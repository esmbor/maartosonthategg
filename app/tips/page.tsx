import Image from "next/image";
import Link from "next/link";

import PublicHeader from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/server";

export default async function TipsPage() {
  const supabase = await createClient();

  const { data: tips, error } = await supabase
    .from("tips")
    .select(`
      id,
      name,
      slug,
      type,
      card_intro,
      featured,
      created_at
    `)
    .eq("published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading tips:", error);
  }

  const tipIds =
    tips?.map((tip) => tip.id) ?? [];

  let mainImages: {
    tip_id: string;
    storage_path: string;
    alt_text: string | null;
  }[] = [];

  if (tipIds.length > 0) {
    const { data: images, error: imagesError } =
      await supabase
        .from("tip_images")
        .select(`
          tip_id,
          storage_path,
          alt_text
        `)
        .in("tip_id", tipIds)
        .eq("is_main", true);

    if (imagesError) {
      console.error(
        "Error loading tip images:",
        imagesError
      );
    }

    mainImages = images ?? [];
  }

  const tipsWithImages =
    tips?.map((tip) => {
      const image = mainImages.find(
        (item) =>
          item.tip_id === tip.id
      );

      const imageUrl = image
        ? supabase.storage
            .from("maarto-images")
            .getPublicUrl(
              image.storage_path
            )
            .data.publicUrl
        : null;

      return {
        ...tip,
        imageUrl,
        imageAlt:
          image?.alt_text ?? tip.name,
      };
    }) ?? [];

  return (
    <main className="tips-page">
      <PublicHeader />

      <section className="tips-overview-hero">
        <div className="site-shell">
          <div className="tips-overview-copy">
            <div className="section-eyebrow">
              Tried & tested
            </div>

            <h1>
              Maarto&apos;s
              <span>Picks.</span>
            </h1>

            <p>
              Gear, kruiden, sauzen en andere
              dingen die hun plek naast de Egg
              verdiend hebben.
            </p>
          </div>
        </div>
      </section>

      <section className="tips-overview-section">
        <div className="site-shell">
          <div className="tips-overview-heading">
            <div>
              <div className="section-eyebrow">
                Favourites
              </div>

              <h2>
                Alle tips.
              </h2>
            </div>

            <span>
              {String(
                tipsWithImages.length
              ).padStart(2, "0")}{" "}
              picks
            </span>
          </div>

          {tipsWithImages.length === 0 ? (
            <div className="recipes-empty-state">
              <div>🔥</div>

              <h3>
                Nog geen tips.
              </h3>

              <p>
                De eerste favorieten moeten nog
                gepubliceerd worden.
              </p>
            </div>
          ) : (
            <div className="tips-public-grid">
              {tipsWithImages.map(
                (tip, index) => (
                  <Link
                    href={`/tips/${tip.slug}`}
                    className="public-tip-card"
                    key={tip.id}
                  >
                    <div className="public-tip-image">
                      {tip.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tip.imageUrl}
                          alt={tip.imageAlt}
                        />
                      ) : (
                        <div className="public-recipe-image-placeholder">
                          🔥
                        </div>
                      )}

                      <div className="public-recipe-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {tip.featured && (
                        <div className="public-recipe-featured">
                          Maarto&apos;s pick
                        </div>
                      )}
                    </div>

                    <div className="public-tip-content">
                      {tip.type && (
                        <div className="public-recipe-tags">
                          <span>
                            {tip.type}
                          </span>
                        </div>
                      )}

                      <h3>
                        {tip.name}
                      </h3>

                      {tip.card_intro && (
                        <p>
                          {tip.card_intro}
                        </p>
                      )}

                      <div className="public-recipe-link">
                        Bekijk tip
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

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