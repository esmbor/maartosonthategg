
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./AboutEditor.module.css";

type AboutPageData = {
  id: number;
  hero_title: string;
  intro: string;
  story: string;
  image_path: string | null;
  image_alt: string | null;
  is_published: boolean;
};

type Props = {
  initialData: AboutPageData;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function AboutEditor({
  initialData,
}: Props) {
  const [heroTitle, setHeroTitle] = useState(
    initialData.hero_title
  );
  const [intro, setIntro] = useState(
    initialData.intro
  );
  const [story, setStory] = useState(
    initialData.story
  );
  const [imagePath, setImagePath] = useState(
    initialData.image_path
  );
  const [imageAlt, setImageAlt] = useState(
    initialData.image_alt ?? ""
  );
  const [published, setPublished] = useState(
    initialData.is_published
  );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [removeImage, setRemoveImage] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const existingImageUrl =
    imagePath && !removeImage
      ? supabase.storage
          .from("maarto-images")
          .getPublicUrl(imagePath).data.publicUrl
      : null;

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Gebruik een JPG-, PNG- of WebP-afbeelding."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("De afbeelding mag maximaal 5 MB zijn.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setRemoveImage(false);
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!heroTitle.trim()) {
        throw new Error("Vul een paginatitel in.");
      }

      let nextImagePath = removeImage
        ? null
        : imagePath;

      if (selectedFile) {
        const extension =
          selectedFile.type === "image/png"
            ? "png"
            : selectedFile.type === "image/webp"
              ? "webp"
              : "jpg";

        const filename = `${crypto.randomUUID()}.${extension}`;
        const storagePath = `about/${filename}`;

        const { error: uploadError } =
          await supabase.storage
            .from("maarto-images")
            .upload(storagePath, selectedFile, {
              contentType: selectedFile.type,
              upsert: false,
            });

        if (uploadError) {
          throw new Error(
            `Upload mislukt: ${uploadError.message}`
          );
        }

        nextImagePath = storagePath;
      }

      const { error: updateError } = await supabase
        .from("about_page")
        .update({
          hero_title: heroTitle.trim(),
          intro: intro.trim(),
          story: story.trim(),
          image_path: nextImagePath,
          image_alt: nextImagePath
            ? imageAlt.trim() || null
            : null,
          is_published: published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("id")
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setImagePath(nextImagePath);
      setSelectedFile(null);
      setRemoveImage(false);
      setSuccess("De pagina is opgeslagen!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan bij het opslaan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link
          href="/admin"
          className={styles.backLink}
        >
          ← Terug naar dashboard
        </Link>

        <div className={styles.heading}>
          <div className={styles.eyebrow}>
            CONTENT MANAGEMENT
          </div>

          <h1>
            OVER <span>MAARTO.</span>
          </h1>

          <p>
            Beheer de teksten en hoofdfoto van de
            Over Maarto-pagina.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className={styles.form}
        >
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>01</span>
              <h2>De introductie.</h2>
            </div>

            <div className={styles.field}>
              <label htmlFor="heroTitle">
                Paginatitel
              </label>
              <input
                id="heroTitle"
                value={heroTitle}
                onChange={(event) =>
                  setHeroTitle(event.target.value)
                }
                required
                maxLength={120}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="intro">
                Korte introductie
              </label>
              <textarea
                id="intro"
                value={intro}
                onChange={(event) =>
                  setIntro(event.target.value)
                }
                rows={4}
                placeholder="Een korte introductie over Maarto..."
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>02</span>
              <h2>Het verhaal.</h2>
            </div>

            <div className={styles.field}>
              <label htmlFor="story">
                Het verhaal van Maarto
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(event) =>
                  setStory(event.target.value)
                }
                rows={12}
                placeholder="Vertel hier het verhaal achter Maarto's on that Egg..."
              />

              <p className={styles.help}>
                Je kunt meerdere alinea&apos;s maken
                door een lege regel tussen teksten te
                zetten.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>03</span>
              <h2>De foto.</h2>
            </div>

            {existingImageUrl &&
              !selectedFile && (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={existingImageUrl}
                    alt={
                      imageAlt ||
                      "Huidige foto van Maarto"
                    }
                  />
                </div>
              )}

            {selectedFile && (
              <div className={styles.selectedFile}>
                Nieuwe afbeelding:{" "}
                <strong>{selectedFile.name}</strong>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="aboutImage">
                {imagePath
                  ? "Vervang de hoofdfoto"
                  : "Upload een hoofdfoto"}
              </label>

              <input
                id="aboutImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />

              <p className={styles.help}>
                JPG, PNG of WebP. Maximaal 5 MB.
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="imageAlt">
                Beschrijving van de foto
              </label>

              <input
                id="imageAlt"
                value={imageAlt}
                onChange={(event) =>
                  setImageAlt(event.target.value)
                }
                placeholder="Bijvoorbeeld: Maarto achter de Big Green Egg"
              />
            </div>

            {(imagePath || selectedFile) && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setRemoveImage(true);
                  setSelectedFile(null);
                }}
              >
                Verwijder foto van pagina
              </button>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>04</span>
              <h2>Publicatie.</h2>
            </div>

            <label className={styles.publishRow}>
              <input
                type="checkbox"
                checked={published}
                onChange={(event) =>
                  setPublished(event.target.checked)
                }
              />

              <span>
                <strong>Pagina publiceren</strong>
                <small>
                  Wanneer dit aanstaat, mag de inhoud
                  op de openbare website verschijnen.
                </small>
              </span>
            </label>
          </section>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" className={styles.success}>
              {success}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Bezig met opslaan..."
                : "Wijzigingen opslaan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
