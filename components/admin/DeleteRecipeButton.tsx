"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export default function DeleteRecipeButton({
  recipeId,
  recipeTitle,
}: DeleteRecipeButtonProps) {
  const router =
    useRouter();

  const [
    confirming,
    setConfirming,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErrorMessage("");

    const supabase =
      createClient();

    /*
     * Eerst alle Storage paths
     * ophalen.
     */

    const {
      data: images,
      error: imagesError,
    } = await supabase
      .from("recipe_images")
      .select(
        "storage_path"
      )
      .eq(
        "recipe_id",
        recipeId
      );

    if (imagesError) {
      setErrorMessage(
        imagesError.message
      );

      setDeleting(false);
      return;
    }

    /*
     * Eerst Storage opruimen.
     */

    const storagePaths =
      images?.map(
        (image) =>
          image.storage_path
      ) ?? [];

    if (
      storagePaths.length > 0
    ) {
      const {
        error: storageError,
      } = await supabase.storage
        .from(
          "maarto-images"
        )
        .remove(
          storagePaths
        );

      if (storageError) {
        setErrorMessage(
          `De foto's konden niet worden verwijderd: ${storageError.message}`
        );

        setDeleting(false);
        return;
      }
    }

    /*
     * Daarna recept verwijderen.
     *
     * recipe_images,
     * recipe_ingredients en
     * recipe_steps verdwijnen via
     * ON DELETE CASCADE.
     */

    const {
      error: recipeError,
    } = await supabase
      .from("recipes")
      .delete()
      .eq(
        "id",
        recipeId
      );

    if (recipeError) {
      setErrorMessage(
        recipeError.message
      );

      setDeleting(false);
      return;
    }

    router.push(
      "/admin/recepten"
    );

    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="admin-delete-button"
        onClick={() =>
          setConfirming(true)
        }
      >
        Recept verwijderen
      </button>
    );
  }

  return (
    <div className="admin-delete-confirm">
      <div>
        <strong>
          Weet je het zeker?
        </strong>

        <p>
          “{recipeTitle}” wordt
          definitief verwijderd,
          inclusief ingrediënten,
          bereidingsstappen en
          foto&apos;s.
        </p>

        {errorMessage && (
          <p className="admin-delete-error">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="admin-delete-actions">
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            setConfirming(
              false
            )
          }
          disabled={
            deleting
          }
        >
          Annuleren
        </button>

        <button
          type="button"
          className="admin-delete-confirm-button"
          onClick={
            handleDelete
          }
          disabled={
            deleting
          }
        >
          {deleting
            ? "Verwijderen..."
            : "Ja, verwijderen"}
        </button>
      </div>
    </div>
  );
}