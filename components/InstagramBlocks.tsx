
import styles from "./InstagramBlocks.module.css";

const INSTAGRAM_PROFILE =
  "https://www.instagram.com/maartos_onthat_egg/";

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
      <rect x="2" y="2" width="20" height="20" rx="5" />
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

export function RecipeInstagramSection({
  instagramUrl,
}: {
  instagramUrl: string | null;
}) {
  if (!instagramUrl) return null;

  return (
    <section className={styles.recipeSection}>
      <div className="site-shell">
        <div className={styles.recipeCard}>
          <div className={styles.recipeText}>
            <div className={styles.eyebrow}>
              <InstagramIcon />
              FROM THE FEED
            </div>

            <h2>
              DEZE COOK
              <span>IN ACTIE.</span>
            </h2>

            <p>
              Benieuwd hoe dit recept op de Egg tot leven
              kwam? Bekijk de extra foto&apos;s en
              video&apos;s op mijn Instagram.
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.recipeButton}
          >
            <InstagramIcon />
            <span>BEKIJK DEZE COOK OP INSTAGRAM</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomeInstagramTeaser() {
  return (
    <section className={styles.homeSection}>
      <div className="site-shell">
        <div className={styles.homeCard}>
          <div className={styles.homeText}>
            <div className={styles.eyebrow}>
              <InstagramIcon />
              FOLLOW THE FIRE
            </div>

            <h2>
              MEER VAN <span>DE EGG?</span>
            </h2>

            <p>
              Meer foto&apos;s, video&apos;s en een kijkje
              achter de schermen? Mijn BBQ-avonturen
              begonnen op Instagram en gaan daar gewoon
              door.
            </p>
          </div>

          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.homeButton}
          >
            <InstagramIcon />
            VOLG MIJ OP INSTAGRAM
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
