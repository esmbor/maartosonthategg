"use client";
import {
  FormEvent,
  ReactNode,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export type TipFormInitialData = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  description: string | null;
  card_intro: string | null;
  external_url: string | null;
  featured: boolean;
  published: boolean;
};
type TipFormProps = {
  initialData?: TipFormInitialData;
  imagesSection?: ReactNode;
};
function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export default function TipForm({
  initialData,
  imagesSection,
}: TipFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);
  const [name, setName] =
    useState(initialData?.name ?? "");
  const [slug, setSlug] =
    useState(initialData?.slug ?? "");
  /*
   * Bij een bestaande tip blijft de URL stabiel,
   * net zoals bij recepten.
   */
  const [slugEdited, setSlugEdited] =
    useState(isEditing);
  const [type, setType] =
    useState(initialData?.type ?? "");
  const [cardIntro, setCardIntro] = useState(initialData?.card_intro ?? "");
  const [description, setDescription] =
    useState(initialData?.description ?? "");
  const [externalUrl, setExternalUrl] =
    useState(initialData?.external_url ?? "");
  const [featured, setFeatured] =
    useState(initialData?.featured ?? false);
  const [published, setPublished] =
    useState(initialData?.published ?? false);
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage(
        "Je sessie is verlopen. Log opnieuw in."
      );
      setSaving(false);
      return;
    }
    const payload = {
      name,
      slug,
      type:
        type || null,
      card_intro: cardIntro.trim() || null,
      description:
        description || null,
      external_url:
        externalUrl || null,
      featured,
      published,
      updated_by:
        user.id,
    };
    if (initialData) {
      const { error } = await supabase
        .from("tips")
        .update(payload)
        .eq("id", initialData.id);
      if (error) {
        setErrorMessage(
          error.message
        );
        setSaving(false);
        return;
      }
      router.push("/admin/tips");
      router.refresh();
      return;
    }
    const {
      data: tip,
      error,
    } = await supabase
      .from("tips")
      .insert({
        ...payload,
        created_by:
          user.id,
      })
      .select("id")
      .single();
    if (error || !tip) {
      setErrorMessage(
        error?.message ??
          "De tip kon niet worden opgeslagen."
      );
      setSaving(false);
      return;
    }
    /*
     * Een nieuwe tip gaat direct naar edit,
     * zodat daarna foto's toegevoegd kunnen worden.
     */
    router.push(
      `/admin/tips/${tip.id}`
    );
    router.refresh();
  }
  return (
    <form
      className="recipe-admin-form"
      onSubmit={handleSubmit}
    >
      {/* 01 - Basis */}
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>
          <div>
            <h2>De basis</h2>
            <p>
              Wat heeft zijn plekje naast de Egg
              verdiend?
            </p>
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <label htmlFor="name">
              Naam *
            </label>
            <input
              id="name"
              value={name}
              required
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="Bijv. Thermapen ONE"
            />
          </div>
          <div className="admin-field admin-field-wide">
            <label htmlFor="slug">
              URL *
            </label>
            <div className="admin-slug-field">
              <span>/tips/</span>
              <input
                id="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSlug(
                    createSlug(
                      event.target.value
                    )
                  );
                }}
              />
            </div>
          </div>
          <div className="admin-field">
            <label htmlFor="type">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
            >
              <option value="">
                Kies type
              </option>
              <option value="Gear">
                Gear
              </option>
              <option value="Kruiden">
                Kruiden
              </option>
              <option value="Saus">
                Saus
              </option>
              <option value="Fuel & Smoke">
                Fuel & Smoke
              </option>
              <option value="Ingrediënten">
                Ingrediënten
              </option>
              <option value="Boeken">
                Boeken
              </option>
              <option value="Overig">
                Overig
              </option>
            </select>
          </div>
        </div>
      </section>
      {/* 02 - Beschrijving */}
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>
          <div>
            <h2>Waarom deze?</h2>
            <p>
              Geen verkooppraatje. Gewoon waarom
              Maarto hem gebruikt.
            </p>
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <label htmlFor="card_intro">Korte intro (overzichtstegel)</label>
            <textarea
              id="card_intro"
              value={cardIntro}
              onChange={(event) => setCardIntro(event.target.value)}
              rows={2}
              maxLength={250}
              placeholder="Een korte introductie van deze tip..."
            />
          </div>
          <div className="admin-field admin-field-wide">
            <label htmlFor="description">
              Beschrijving
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Waarom verdient deze een plek bij Maarto's Picks?"
            />
          </div>
          <div className="admin-field admin-field-wide">
            <label htmlFor="externalUrl">
              Externe link
            </label>
            <input
              id="externalUrl"
              type="url"
              value={externalUrl}
              onChange={(event) =>
                setExternalUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </section>
      {/* 03 - Publicatie */}
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>03</span>
          <div>
            <h2>Ready to serve?</h2>
            <p>
              Bepaal waar deze tip zichtbaar wordt.
            </p>
          </div>
        </div>
        <div className="admin-toggle-list">
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) =>
                setFeatured(
                  event.target.checked
                )
              }
            />
            <span>
              <strong>
                Uitlichten
              </strong>
              <small>
                Kan worden gebruikt bij
                Maarto's Picks op de homepage.
              </small>
            </span>
          </label>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(
                  event.target.checked
                )
              }
            />
            <span>
              <strong>
                Publiceren
              </strong>
              <small>
                Zet uit om deze tip eerst als
                concept te bewaren.
              </small>
            </span>
          </label>
        </div>
      </section>
      {/* 04 - Foto's alleen op edit */}
      {imagesSection}
      {errorMessage && (
        <div className="admin-form-error">
          {errorMessage}
        </div>
      )}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-secondary-button"
          disabled={saving}
          onClick={() =>
            router.push(
              "/admin/tips"
            )
          }
        >
          Annuleren
        </button>
        <button
          type="submit"
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? "Opslaan..."
            : initialData
              ? "Wijzigingen opslaan"
              : published
                ? "Tip publiceren"
                : "Concept opslaan"}
        </button>
      </div>
    </form>
  );
}