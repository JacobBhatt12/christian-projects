"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { getClientId } from "@/components/actions/client-id";

export function SaveButton({
  itemType,
  itemId,
}: {
  itemType: "resource" | "alternative";
  itemId: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getClientId(), itemType, itemId }),
      });
      if (!response.ok) throw new Error("Save failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <span className="action-with-status">
      <button
        type="button"
        className="text-action"
        onClick={save}
        disabled={status === "saving" || status === "saved"}
      >
        {status === "saved" ? <BookmarkCheck aria-hidden="true" size={17} /> : <Bookmark aria-hidden="true" size={17} />}
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save"}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "saved" ? "Result saved." : status === "error" ? "Could not save this result." : ""}
      </span>
    </span>
  );
}
