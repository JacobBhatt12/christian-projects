"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ExternalLink, LoaderCircle, MapPin, Trash2 } from "lucide-react";
import { getClientId } from "@/components/actions/client-id";
import type { Alternative, AssistanceResource, SavedItem } from "@/lib/types";
import { calculateMonthlySavings, formatCurrency } from "@/lib/savings";

type SavedPayload = {
  saved: SavedItem;
  item: Alternative | AssistanceResource;
};

function isResource(item: Alternative | AssistanceResource): item is AssistanceResource {
  return "organizationName" in item;
}

export function SavedList() {
  const [items, setItems] = useState<SavedPayload[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/saved?clientId=${encodeURIComponent(getClientId())}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Load failed");
        const data = (await response.json()) as { items: SavedPayload[] };
        setItems(data.items);
        setStatus("ready");
      })
      .catch((error) => {
        if ((error as DOMException).name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  async function remove(saved: SavedItem) {
    const previous = items;
    setItems((current) => current.filter((entry) => entry.saved.id !== saved.id));
    const response = await fetch("/api/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: getClientId(), itemType: saved.itemType, itemId: saved.itemId }),
    });
    if (!response.ok) setItems(previous);
  }

  if (status === "loading") {
    return <div className="saved-state" aria-live="polite"><LoaderCircle className="spin" aria-hidden="true" size={24} /> Loading saved results…</div>;
  }
  if (status === "error") {
    return <div className="saved-state" role="alert">We could not load your saved results. Refresh the page to try again.</div>;
  }
  if (items.length === 0) {
    return (
      <div className="saved-empty">
        <Bookmark aria-hidden="true" size={32} />
        <h2>Nothing saved yet</h2>
        <p>Save alternatives and community resources while you compare them. They will stay tied to this browser.</p>
        <Link href="/search" className="button button-primary">Find options to save</Link>
      </div>
    );
  }

  return (
    <div className="saved-list">
      {items.map(({ saved, item }) => (
        <article key={saved.id} className="saved-row">
          <div>
            <span className="saved-type">{isResource(item) ? "Community resource" : "Cheaper alternative"}</span>
            <h2>{isResource(item) ? item.organizationName : item.title}</h2>
            <p>{item.description}</p>
            {isResource(item) ? (
              <p className="saved-meta"><MapPin aria-hidden="true" size={16} /> {item.location.city}, {item.location.state}</p>
            ) : (
              <p className="saved-meta">About {formatCurrency(calculateMonthlySavings(item))} estimated monthly savings</p>
            )}
          </div>
          <div className="saved-actions">
            {isResource(item) ? <Link href={`/resources/${item.id}`} className="text-action">View <ExternalLink aria-hidden="true" size={16} /></Link> : null}
            <button type="button" className="text-action danger-action" onClick={() => remove(saved)}><Trash2 aria-hidden="true" size={16} /> Remove</button>
          </div>
        </article>
      ))}
    </div>
  );
}
