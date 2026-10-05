import Image from "next/image";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Image
          src="/images/logo-maarto.png"
          alt="Maarto's on that Egg"
          width={110}
          height={110}
          className="admin-login-logo"
          priority
        />

        <div className="admin-login-eyebrow">Maarto&apos;s backstage</div>

        <h1 className="admin-login-title">
          FIRE UP
          <span>THE ADMIN.</span>
        </h1>

        <p className="admin-login-copy">
          Hier worden recepten, tips en andere BBQ-geheimen bijgehouden.
        </p>

        <AdminLoginForm />
      </div>
    </main>
  );
}