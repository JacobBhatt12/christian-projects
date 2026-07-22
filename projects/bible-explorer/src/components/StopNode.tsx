import { Handle, Position } from "@xyflow/react";
import type { JourneyStop } from "../types";

interface StopNodeData {
  stop: JourneyStop;
  visited: boolean;
  onOpen: (id: string) => void;
  [key: string]: unknown;
}

export default function StopNode({ data }: { data: StopNodeData }) {
  const { stop, visited, onOpen } = data;

  return (
    <div className="flex flex-col items-center" style={{ pointerEvents: "auto" }}>
      <div className="mb-2 text-[11px] uppercase tracking-widest text-neutral-400 whitespace-nowrap">
        {stop.era}
      </div>

      <button
        onClick={() => onOpen(stop.id)}
        style={{ pointerEvents: "auto" }}
        className={`nodrag nopan w-44 border bg-white px-4 py-3 text-left transition-colors cursor-pointer
          ${visited ? "border-neutral-800" : "border-neutral-300 hover:border-neutral-500"}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400">
            {String(stop.order).padStart(2, "0")}
          </span>
          {visited && (
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" aria-hidden />
          )}
        </div>
        <div className="mt-1 text-sm font-bold leading-snug text-neutral-900">
          {stop.title}
        </div>
        <div className="mt-1 text-xs text-neutral-500">{stop.reference}</div>
      </button>

      <Handle type="target" position={Position.Left} className="!bg-neutral-400" />
      <Handle type="source" position={Position.Right} className="!bg-neutral-400" />
    </div>
  );
}
