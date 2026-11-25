
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { createClient } from "@/lib/supabase/server";
import styles from "./AboutPage.module.css";
import instagramStyles from "./InstagramSection.module.css";

const INSTAGRAM_URL =
  "https://www.instagram.com/maartos_onthat_egg/";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Over Maarto | Maarto's on that Egg",
  description:
    "Het verhaal achter Maarto's on that Egg. Over vuur, lekker eten en de Big Green Egg.",
};

export default async function AboutPage() {
  const supabase = await createClient();

  const { data: about, error } = await supabase
    .from("about_page")
    .select(
      "hero_title, intro, story, image_path, image_alt"
    )
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Error loading About page:", error);
    throw new Error(
      "De Over Maarto-pagina kon niet worden geladen."
    );
  }

  if (!about) {
    notFound();
  }

  const imageUrl = about.image_path
    ? supabase.storage
        .from("maarto-images")
        .getPublicUrl(about.image_path).data.publicUrl
    : null;

  const paragraphs: string[] = (about.story as string)
    .split(/\n\s*\n/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className={styles.page}>
      <PublicHeader />

      {/* Hero */}

      <section className={styles.hero}>
        <div className={styles.shell}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>
                THE MAN BEHIND THE EGG
              </div>

              <h1 className={styles.heroTitle}>
                {about.hero_title}
                <span className={styles.titleDot}>.</span>
              </h1>

              {about.intro && (
                <p className={styles.heroIntro}>
                  {about.intro}
                </p>
              )}

              <div className={styles.heroSignature}>
                <span className={styles.signatureLine} />
                FIRE. FOOD. PATIENCE.
              </div>
            </div>

            <div className={styles.heroVisual}>
              {imageUrl ? (
                <div className={styles.imageFrame}>
                  <Image
                    src={imageUrl}
                    alt={
                      about.image_alt ||
                      "Maarto bij zijn Big Green Egg"
                    }
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 900px) 100vw, 45vw"
                    className={styles.heroImage}
                  />

                  <div className={styles.imageOverlay} />
                </div>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>🔥</span>
                  <p>Life tastes better from the Egg.</p>
                </div>
              )}

              <div className={styles.imageLabel}>
                MADE WITH FIRE
                <span>AND A LITTLE PATIENCE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The story */}

      {paragraphs.length > 0 && (
        <section className={styles.storySection}>
          <div className={styles.shell}>
            <div className={styles.storyGrid}>
              <div className={styles.storyHeading}>
                <div className={styles.eyebrow}>
                  BEHIND THE SMOKE
                </div>

                <h2>
                  HET
                  <br />
                  VERHAAL<span>.</span>
                </h2>
              </div>

              <div className={styles.storyContent}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Instagram */}

      <section className={instagramStyles.section}>
        <div className={styles.shell}>
          <div className={instagramStyles.content}>
            <div className={instagramStyles.icon}>
              <InstagramIcon />
            </div>

            <div className={instagramStyles.eyebrow}>
              FROM THE FEED
            </div>

            <h2 className={instagramStyles.title}>
              FOLLOW
              <span>THE FIRE.</span>
            </h2>

            <p className={instagramStyles.description}>
              Maarto&apos;s on that Egg begon op Instagram.
              Daar deel ik nog steeds mijn BBQ-avonturen,
              extra foto&apos;s, video&apos;s en alles wat er
              op de Egg gebeurt.
              <br />
              <br />
              Zin in meer? Volg me daar!
            </p>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={instagramStyles.button}
              aria-label="Volg Maarto op Instagram"
            >
              <InstagramIcon />
              VOLG MIJ OP INSTAGRAM
              <span>↗</span>
            </a>

            <div className={instagramStyles.handle}>
              @maartos_onthat_egg
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}

      <section className={styles.closingSection}>
        <div className={styles.shell}>
          <div className={styles.closingContent}>
            <div className={styles.eyebrow}>
              READY TO FIRE IT UP?
            </div>

            <h2>
              GENOEG GEKLETST.
              <span>TIJD OM TE GRILLEN.</span>
            </h2>

            <p>
              Genoeg over mij. Het lekkerste verhaal
              begint natuurlijk op de Egg.
            </p>

            <Link
              href="/recepten"
              className={styles.ctaButton}
            >
              BEKIJK DE RECEPTEN
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
      />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
