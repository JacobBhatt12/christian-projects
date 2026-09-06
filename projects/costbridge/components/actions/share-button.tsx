"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url?: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const shareUrl = url ? new URL(url, window.location.origin).toString() : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        setMessage("Shared.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setMessage("Link copied.");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("Could not share this link.");
    }
  }

  return (
    <span className="action-with-status">
      <button type="button" className="text-action" onClick={share}>
        <Share2 aria-hidden="true" size={17} /> Share
      </button>
      <span className="sr-only" aria-live="polite">{message}</span>
    </span>
  );
}
