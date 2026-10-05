import Image from "next/image";
import Link from "next/link";

type PublicHeaderProps = {
  absolute?: boolean;
};

export default function PublicHeader({
  absolute = false,
}: PublicHeaderProps) {
  return (
    <header
      className={
        absolute
          ? "header"
          : "recipe-site-header"
      }
    >
      <div
        className={
          absolute
            ? "site-shell header-inner"
            : "site-shell recipe-header-inner"
        }
      >
        <Link
          href="/"
          className="brand"
        >
          <Image
            src="/images/logo-maarto.png"
            alt="Maarto's on that Egg"
            width={78}
            height={78}
            priority
          />
        </Link>

        <nav
          className={
            absolute
              ? "nav"
              : "recipe-public-nav"
          }
        >
          <Link href="/recepten">
            Recepten
          </Link>

          <Link href="/#tips">
            Maarto&apos;s Tips
          </Link>

          <Link href="/#over-maarto">
            Over Maarto
          </Link>
        </nav>
      </div>
    </header>
  );
}