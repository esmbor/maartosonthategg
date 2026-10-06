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

type DeleteTipButtonProps = {
  tipId: string;
  tipName: string;
};

export default function DeleteTipButton({
  tipId,
  tipName,
}: DeleteTipButtonProps) {
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
     * Eerst alle foto's ophalen.
     */

    const {
      data: images,
      error: imagesError,
    } = await supabase
      .from("tip_images")
      .select(
        "storage_path"
      )
      .eq(
        "tip_id",
        tipId
      );

    if (imagesError) {
      setErrorMessage(
        imagesError.message
      );

      setDeleting(false);
      return;
    }

    const storagePaths =
      images?.map(
        (image) =>
          image.storage_path
      ) ?? [];

    /*
     * Storage opruimen.
     */

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
     * Daarna tip verwijderen.
     *
     * tip_images verdwijnt uit de database
     * via ON DELETE CASCADE.
     */

    const {
      error: tipError,
    } = await supabase
      .from("tips")
      .delete()
      .eq(
        "id",
        tipId
      );

    if (tipError) {
      setErrorMessage(
        tipError.message
      );

      setDeleting(false);
      return;
    }

    router.push(
      "/admin/tips"
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
        Tip verwijderen
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
          “{tipName}” wordt definitief verwijderd,
          inclusief alle foto&apos;s.
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
          disabled={deleting}
          onClick={() =>
            setConfirming(
              false
            )
          }
        >
          Annuleren
        </button>

        <button
          type="button"
          className="admin-delete-confirm-button"
          disabled={deleting}
          onClick={
            handleDelete
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