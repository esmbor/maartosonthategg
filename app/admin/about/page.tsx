
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AboutEditor from "@/components/AboutEditor";

export default async function AdminAboutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    redirect("/admin");
  }

  const { data: about, error } = await supabase
    .from("about_page")
    .select(
      "id, hero_title, intro, story, image_path, image_alt, is_published"
    )
    .eq("id", 1)
    .single();

  if (error || !about) {
    return (
      <main style={{ padding: "60px 32px" }}>
        <h1>Over Maarto</h1>
        <p>
          De pagina kon niet worden geladen. Controleer
          de tabel about_page en de RLS-policies.
        </p>
      </main>
    );
  }

  return <AboutEditor initialData={about} />;
}
