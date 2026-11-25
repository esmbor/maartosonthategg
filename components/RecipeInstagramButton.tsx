
import styles from "./RecipeInstagramButton.module.css";

type Props = {
  instagramUrl: string | null;
};

export default function RecipeInstagramButton({
  instagramUrl,
}: Props) {
  if (!instagramUrl) return null;

  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Bekijk deze cook op Instagram"
    >
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={styles.icon}
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

      <span className={styles.text}>
        <strong>Deze cook in actie?</strong>
        <span>
          Bekijk alle behind the scenes van deze cook op Instagram.
        </span>
      </span>

      <span className={styles.arrow} aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
