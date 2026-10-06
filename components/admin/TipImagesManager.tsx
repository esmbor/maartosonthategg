"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/images/compressImage";

type TipImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  is_main: boolean;
  sort_order: number;

  publicUrl: string;
};

type TipImagesManagerProps = {
  tipId: string;
  tipName: string;
};

export default function TipImagesManager({
  tipId,
  tipName,
}: TipImagesManagerProps) {
  const [images, setImages] =
    useState<TipImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadImages =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      const supabase =
        createClient();

      const { data, error } =
        await supabase
          .from("tip_images")
          .select(`
            id,
            storage_path,
            alt_text,
            is_main,
            sort_order
          `)
          .eq("tip_id", tipId)
          .order("sort_order", {
            ascending: true,
          });

      if (error) {
        setErrorMessage(
          error.message
        );

        setLoading(false);
        return;
      }

      const imagesWithUrls =
        (data ?? []).map(
          (image) => {
            const {
              data: publicUrlData,
            } = supabase.storage
              .from("maarto-images")
              .getPublicUrl(
                image.storage_path
              );

            return {
              ...image,

              publicUrl:
                publicUrlData.publicUrl,
            };
          }
        );

      setImages(
        imagesWithUrls
      );

      setLoading(false);
    }, [tipId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  async function handleFilesSelected(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files ?? []
      );

    if (
      files.length === 0
    ) {
      return;
    }

    setUploading(true);
    setErrorMessage("");

    const supabase =
      createClient();

    try {
      let nextSortOrder =
        images.length;

      for (const file of files) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          continue;
        }

        const compressed =
          await compressImage(
            file,
            {
              maxSize: 1600,
              quality: 0.8,
            }
          );

        const filename =
          `${crypto.randomUUID()}.webp`;

        const storagePath =
          `tips/${tipId}/${filename}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("maarto-images")
          .upload(
            storagePath,
            compressed,
            {
              contentType:
                "image/webp",

              cacheControl:
                "31536000",

              upsert:
                false,
            }
          );

        if (uploadError) {
          throw new Error(
            `Upload van ${file.name} mislukt: ${uploadError.message}`
          );
        }

        const shouldBeMain =
          images.length === 0 &&
          nextSortOrder === 0;

        const {
          error: databaseError,
        } = await supabase
          .from("tip_images")
          .insert({
            tip_id:
              tipId,

            storage_path:
              storagePath,

            alt_text:
              tipName,

            is_main:
              shouldBeMain,

            sort_order:
              nextSortOrder,
          });

        if (databaseError) {
          await supabase.storage
            .from("maarto-images")
            .remove([
              storagePath,
            ]);

          throw new Error(
            `Afbeelding kon niet aan de tip worden gekoppeld: ${databaseError.message}`
          );
        }

        nextSortOrder += 1;
      }

      await loadImages();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Er ging iets mis tijdens het uploaden."
      );
    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }

  async function makeMainPhoto(
    imageId: string
  ) {
    setErrorMessage("");

    const supabase =
      createClient();

    const {
      error: resetError,
    } = await supabase
      .from("tip_images")
      .update({
        is_main: false,
      })
      .eq(
        "tip_id",
        tipId
      );

    if (resetError) {
      setErrorMessage(
        resetError.message
      );

      return;
    }

    const {
      error: mainError,
    } = await supabase
      .from("tip_images")
      .update({
        is_main: true,
      })
      .eq(
        "id",
        imageId
      );

    if (mainError) {
      setErrorMessage(
        mainError.message
      );

      return;
    }

    setImages((current) =>
      current.map((image) => ({
        ...image,

        is_main:
          image.id === imageId,
      }))
    );
  }

  function updateAltText(
    imageId: string,
    altText: string
  ) {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId
          ? {
              ...image,
              alt_text: altText,
            }
          : image
      )
    );
  }

  async function saveAltText(
    imageId: string,
    altText: string
  ) {
    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("tip_images")
        .update({
          alt_text:
            altText.trim() ||
            null,
        })
        .eq(
          "id",
          imageId
        );

    if (error) {
      setErrorMessage(
        error.message
      );
    }
  }

  async function normalizeSortOrder(
    newImages: TipImage[]
  ) {
    const supabase =
      createClient();

    const updates =
      newImages.map(
        (image, index) =>
          supabase
            .from("tip_images")
            .update({
              sort_order:
                index,
            })
            .eq(
              "id",
              image.id
            )
      );

    const results =
      await Promise.all(
        updates
      );

    const failed =
      results.find(
        (result) =>
          result.error
      );

    if (
      failed?.error
    ) {
      throw new Error(
        failed.error.message
      );
    }
  }

  async function deleteImage(
    image: TipImage
  ) {
    const confirmed =
      window.confirm(
        image.is_main
          ? "Dit is de hoofdafbeelding. Weet je zeker dat je deze foto wilt verwijderen?"
          : "Weet je zeker dat je deze foto wilt verwijderen?"
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    const supabase =
      createClient();

    const {
      error: storageError,
    } = await supabase.storage
      .from("maarto-images")
      .remove([
        image.storage_path,
      ]);

    if (storageError) {
      setErrorMessage(
        `Foto kon niet uit Storage worden verwijderd: ${storageError.message}`
      );

      return;
    }

    const {
      error: databaseError,
    } = await supabase
      .from("tip_images")
      .delete()
      .eq(
        "id",
        image.id
      );

    if (databaseError) {
      setErrorMessage(
        `Foto kon niet uit de database worden verwijderd: ${databaseError.message}`
      );

      return;
    }

    const remaining =
      images.filter(
        (item) =>
          item.id !== image.id
      );

    if (
      image.is_main &&
      remaining.length > 0
    ) {
      const nextMain =
        remaining[0];

      const {
        error: mainError,
      } = await supabase
        .from("tip_images")
        .update({
          is_main:
            true,
        })
        .eq(
          "id",
          nextMain.id
        );

      if (mainError) {
        setErrorMessage(
          mainError.message
        );
      }
    }

    try {
      await normalizeSortOrder(
        remaining
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De fotovolgorde kon niet worden bijgewerkt."
      );
    }

    await loadImages();
  }

  async function handleDragEnd(
    event: DragEndEvent
  ) {
    const {
      active,
      over,
    } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      images.findIndex(
        (image) =>
          image.id === active.id
      );

    const newIndex =
      images.findIndex(
        (image) =>
          image.id === over.id
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const previousImages =
      images;

    const reordered =
      arrayMove(
        images,
        oldIndex,
        newIndex
      ).map(
        (image, index) => ({
          ...image,

          sort_order:
            index,
        })
      );

    setImages(
      reordered
    );

    try {
      await normalizeSortOrder(
        reordered
      );
    } catch (error) {
      setImages(
        previousImages
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De fotovolgorde kon niet worden opgeslagen."
      );
    }
  }

  return (
    <section className="admin-form-section">
      <div className="admin-form-section-heading">
        <span>04</span>

        <div>
          <h2>
            Foto&apos;s
          </h2>

          <p>
            Main photo, gallery en alles wat
            deze favoriet een gezicht geeft.
          </p>
        </div>
      </div>

      <div className="recipe-image-upload">
        <div>
          <strong>
            Foto&apos;s toevoegen
          </strong>

          <p>
            Foto&apos;s worden automatisch
            verkleind naar maximaal 1600 px
            en opgeslagen als WebP.
          </p>
        </div>

        <label
          className={`admin-secondary-button recipe-image-upload-button ${
            uploading
              ? "recipe-image-upload-button-disabled"
              : ""
          }`}
        >
          {uploading
            ? "Uploaden..."
            : "+ Foto's toevoegen"}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={
              handleFilesSelected
            }
          />
        </label>
      </div>

      {errorMessage && (
        <div className="admin-form-error">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="recipe-images-loading">
          Foto&apos;s laden...
        </div>
      ) : images.length === 0 ? (
        <div className="recipe-images-empty">
          <div>📸</div>

          <strong>
            Nog geen foto&apos;s
          </strong>

          <p>
            Voeg hierboven de eerste
            foto&apos;s toe.
          </p>
        </div>
      ) : !mounted ? (
        <div className="recipe-images-grid">
          {images.map(
            (image) => (
              <StaticTipImage
                key={image.id}
                image={image}
              />
            )
          )}
        </div>
      ) : (
        <>
          <div className="recipe-images-help">
            <span>↕</span>

            Sleep de foto&apos;s om de volgorde
            van de gallery te veranderen.
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={
              closestCenter
            }
            onDragEnd={
              handleDragEnd
            }
          >
            <SortableContext
              items={images.map(
                (image) =>
                  image.id
              )}
              strategy={
                rectSortingStrategy
              }
            >
              <div className="recipe-images-grid">
                {images.map(
                  (image) => (
                    <SortableTipImage
                      key={image.id}
                      image={image}
                      onMakeMain={
                        makeMainPhoto
                      }
                      onDelete={
                        deleteImage
                      }
                      onAltTextChange={
                        updateAltText
                      }
                      onAltTextSave={
                        saveAltText
                      }
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </section>
  );
}

function StaticTipImage({
  image,
}: {
  image: TipImage;
}) {
  return (
    <div
      className={`recipe-image-card ${
        image.is_main
          ? "recipe-image-card-main"
          : ""
      }`}
    >
      <div className="recipe-image-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt={image.alt_text ?? ""}
        />

        {image.is_main && (
          <div className="recipe-image-main-badge">
            Main photo
          </div>
        )}
      </div>
    </div>
  );
}

type SortableTipImageProps = {
  image: TipImage;

  onMakeMain: (
    imageId: string
  ) => void;

  onDelete: (
    image: TipImage
  ) => void;

  onAltTextChange: (
    imageId: string,
    value: string
  ) => void;

  onAltTextSave: (
    imageId: string,
    value: string
  ) => void;
};

function SortableTipImage({
  image,
  onMakeMain,
  onDelete,
  onAltTextChange,
  onAltTextSave,
}: SortableTipImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),

    transition,

    opacity:
      isDragging
        ? 0.55
        : 1,

    zIndex:
      isDragging
        ? 10
        : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`recipe-image-card ${
        image.is_main
          ? "recipe-image-card-main"
          : ""
      }`}
    >
      <div className="recipe-image-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt={
            image.alt_text ??
            ""
          }
        />

        {image.is_main && (
          <div className="recipe-image-main-badge">
            Main photo
          </div>
        )}

        <button
          type="button"
          className="recipe-image-drag-handle"
          aria-label="Foto verplaatsen"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </div>

      <div className="recipe-image-content">
        <div className="admin-field">
          <label>
            Alt-tekst
          </label>

          <input
            value={
              image.alt_text ??
              ""
            }
            onChange={(event) =>
              onAltTextChange(
                image.id,
                event.target.value
              )
            }
            onBlur={(event) =>
              onAltTextSave(
                image.id,
                event.target.value
              )
            }
            placeholder="Wat is er op deze foto te zien?"
          />
        </div>

        <div className="recipe-image-actions">
          {!image.is_main && (
            <button
              type="button"
              className="recipe-image-main-button"
              onClick={() =>
                onMakeMain(
                  image.id
                )
              }
            >
              Maak hoofdafbeelding
            </button>
          )}

          <button
            type="button"
            className="recipe-image-delete-button"
            onClick={() =>
              onDelete(image)
            }
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  );
}