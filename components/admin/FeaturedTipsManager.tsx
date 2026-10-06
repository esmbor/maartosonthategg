"use client";

import {
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";

type Tip = {
  id: string;
  name: string;
  slug: string;

  featured: boolean;
  featured_order: number | null;

  type: string | null;

  imageUrl: string | null;
  imageAlt: string;
};

type FeaturedTipsManagerProps = {
  tips: Tip[];
};

export default function FeaturedTipsManager({
  tips,
}: FeaturedTipsManagerProps) {
  const initialFeatured =
    tips
      .filter(
        (tip) =>
          tip.featured
      )
      .sort(
        (a, b) =>
          (a.featured_order ?? 999) -
          (b.featured_order ?? 999)
      );

  const initialAvailable =
    tips.filter(
      (tip) =>
        !tip.featured
    );

  const [featured, setFeatured] =
    useState(initialFeatured);

  const [available, setAvailable] =
    useState(initialAvailable);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 8,
          },
        }
      )
    );

  async function saveFeaturedOrder(
    nextFeatured: Tip[]
  ) {
    setSaving(true);
    setErrorMessage("");

    const supabase =
      createClient();

    try {
      const updates =
        nextFeatured.map(
          (tip, index) =>
            supabase
              .from("tips")
              .update({
                featured:
                  true,

                featured_order:
                  index,
              })
              .eq(
                "id",
                tip.id
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
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De volgorde kon niet worden opgeslagen."
      );

      throw error;
    } finally {
      setSaving(false);
    }
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
      featured.findIndex(
        (tip) =>
          tip.id === active.id
      );

    const newIndex =
      featured.findIndex(
        (tip) =>
          tip.id === over.id
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const previousFeatured =
      featured;

    const reordered =
      arrayMove(
        featured,
        oldIndex,
        newIndex
      ).map(
        (tip, index) => ({
          ...tip,

          featured_order:
            index,
        })
      );

    setFeatured(
      reordered
    );

    try {
      await saveFeaturedOrder(
        reordered
      );
    } catch {
      setFeatured(
        previousFeatured
      );
    }
  }

  async function addTip(
    tip: Tip
  ) {
    if (
      featured.length >= 5
    ) {
      setErrorMessage(
        "Je kunt maximaal vijf tips uitlichten."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");

    const nextFeatured = [
      ...featured,

      {
        ...tip,
        featured:
          true,

        featured_order:
          featured.length,
      },
    ];

    const supabase =
      createClient();

    const {
      error,
    } = await supabase
      .from("tips")
      .update({
        featured:
          true,

        featured_order:
          featured.length,
      })
      .eq(
        "id",
        tip.id
      );

    if (error) {
      setErrorMessage(
        error.message
      );

      setSaving(false);
      return;
    }

    setFeatured(
      nextFeatured
    );

    setAvailable(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            tip.id
        )
    );

    setSaving(false);
  }

  async function removeTip(
    tip: Tip
  ) {
    setSaving(true);
    setErrorMessage("");

    const supabase =
      createClient();

    const {
      error,
    } = await supabase
      .from("tips")
      .update({
        featured:
          false,

        featured_order:
          null,
      })
      .eq(
        "id",
        tip.id
      );

    if (error) {
      setErrorMessage(
        error.message
      );

      setSaving(false);
      return;
    }

    const remaining =
      featured
        .filter(
          (item) =>
            item.id !==
            tip.id
        )
        .map(
          (item, index) => ({
            ...item,

            featured_order:
              index,
          })
        );

    setFeatured(
      remaining
    );

    setAvailable(
      (current) => [
        {
          ...tip,

          featured:
            false,

          featured_order:
            null,
        },

        ...current,
      ]
    );

    try {
      await saveFeaturedOrder(
        remaining
      );
    } catch {
      //
    }

    setSaving(false);
  }

  return (
    <div className="featured-admin">
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>

          <div>
            <h2>
              Uitgelichte tips
            </h2>

            <p>
              Deze favorieten staan momenteel
              bij Maarto&apos;s Picks op de homepage.
            </p>
          </div>
        </div>

        <div className="featured-admin-count">
          {featured.length} / 5 geselecteerd
        </div>

        {featured.length === 0 ? (
          <div className="featured-admin-empty">
            <strong>
              Nog geen tips uitgelicht.
            </strong>

            <p>
              Voeg hieronder een gepubliceerde tip toe.
            </p>
          </div>
        ) : !mounted ? (
          <div className="featured-admin-list">
            {featured.map(
              (tip, index) => (
                <div
                  className="featured-admin-row"
                  key={tip.id}
                >
                  <div className="featured-admin-position">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <TipImage
                    tip={tip}
                  />

                  <div className="featured-admin-info">
                    <div className="featured-admin-tags">
                      {tip.type && (
                        <span>
                          {tip.type}
                        </span>
                      )}
                    </div>

                    <strong>
                      {tip.name}
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
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
              items={featured.map(
                (tip) =>
                  tip.id
              )}
              strategy={
                verticalListSortingStrategy
              }
            >
              <div className="featured-admin-list">
                {featured.map(
                  (
                    tip,
                    index
                  ) => (
                    <SortableFeaturedTip
                      key={tip.id}
                      tip={tip}
                      index={index}
                      onRemove={
                        removeTip
                      }
                      disabled={
                        saving
                      }
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>

          <div>
            <h2>
              Tip toevoegen
            </h2>

            <p>
              Kies uit de andere gepubliceerde tips.
            </p>
          </div>
        </div>

        {available.length === 0 ? (
          <div className="featured-admin-empty">
            <strong>
              Geen andere tips beschikbaar.
            </strong>
          </div>
        ) : (
          <div className="featured-available-grid">
            {available.map(
              (tip) => (
                <article
                  className="featured-available-card"
                  key={tip.id}
                >
                  <TipImage
                    tip={tip}
                  />

                  <div className="featured-available-content">
                    <div className="featured-admin-tags">
                      {tip.type && (
                        <span>
                          {tip.type}
                        </span>
                      )}
                    </div>

                    <h3>
                      {tip.name}
                    </h3>

                    <button
                      type="button"
                      className="admin-secondary-button"
                      disabled={
                        saving ||
                        featured.length >=
                          5
                      }
                      onClick={() =>
                        addTip(
                          tip
                        )
                      }
                    >
                      + Uitlichten
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {errorMessage && (
        <div className="admin-form-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

type SortableFeaturedTipProps = {
  tip: Tip;

  index: number;

  onRemove: (
    tip: Tip
  ) => void;

  disabled:
    boolean;
};

function SortableFeaturedTip({
  tip,
  index,
  onRemove,
  disabled,
}: SortableFeaturedTipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tip.id,
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
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="featured-admin-row"
    >
      <div className="featured-admin-position">
        {String(
          index + 1
        ).padStart(
          2,
          "0"
        )}
      </div>

      <TipImage
        tip={tip}
      />

      <div className="featured-admin-info">
        <div className="featured-admin-tags">
          {tip.type && (
            <span>
              {tip.type}
            </span>
          )}
        </div>

        <strong>
          {tip.name}
        </strong>
      </div>

      <button
        type="button"
        className="featured-drag-handle"
        aria-label="Volgorde wijzigen"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      <button
        type="button"
        className="featured-remove-button"
        disabled={
          disabled
        }
        onClick={() =>
          onRemove(
            tip
          )
        }
      >
        Verwijderen
      </button>
    </article>
  );
}

function TipImage({
  tip,
}: {
  tip: Tip;
}) {
  if (!tip.imageUrl) {
    return (
      <div className="featured-admin-image featured-admin-image-placeholder">
        🔥
      </div>
    );
  }

  return (
    <div className="featured-admin-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          tip.imageUrl
        }
        alt={
          tip.imageAlt
        }
      />
    </div>
  );
}