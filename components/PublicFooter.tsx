
const INSTAGRAM_URL =
  "https://www.instagram.com/maartos_onthat_egg/";

export default function PublicFooter() {
  return (
    <footer className="footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          Maarto&apos;s on that Egg
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            flexWrap: "wrap",
          }}
        >
          <span>Fire. Food. Patience.</span>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Volg Maarto op Instagram"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#f3e6cc",
              fontWeight: 700,
            }}
          >
            <svg
              width="18"
              height="18"
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

            Volg mij op Instagram ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
