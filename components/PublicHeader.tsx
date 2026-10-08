
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
          ? "header header-absolute"
          : "header header-static"
      }
      style={{
        position: absolute ? "absolute" : "relative",
        top: absolute ? 0 : undefined,
        left: absolute ? 0 : undefined,
      }}
    >
      <div
        className="header-inner"
        style={{
          width: "calc(100% - 64px)",
          maxWidth: "none",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          className="brand"
          aria-label="Maarto's on that Egg"
        >
          <Image
            src="/images/logo-maarto.png"
            alt="Maarto's on that Egg"
            width={76}
            height={76}
            priority
          />
        </Link>

        <nav className="nav">
          <Link href="/recepten">
            Recepten
          </Link>

          <Link href="/tips">
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
