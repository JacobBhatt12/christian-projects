import {
  ReactFlow,
  type Edge,
  type Node,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { lambOfGodJourney } from "../data/lambOfGod";
import StopNode from "./StopNode";

const nodeTypes = { stop: StopNode };

interface JourneyGraphProps {
  visited: Set<string>;
  onOpen: (id: string) => void;
}

const X_GAP = 260;

export default function JourneyGraph({ visited, onOpen }: JourneyGraphProps) {
  const nodes: Node[] = useMemo(
    () =>
      lambOfGodJourney.map((stop, i) => ({
        id: stop.id,
        type: "stop",
        position: { x: i * X_GAP, y: i % 2 === 0 ? 0 : 90 },
        data: { stop, visited: visited.has(stop.id), onOpen },
        draggable: false,
      })),
    [visited, onOpen],
  );

  const edges: Edge[] = useMemo(
    () =>
      lambOfGodJourney.slice(1).map((stop, i) => {
        const prev = lambOfGodJourney[i];
        return {
          id: `${prev.id}-${stop.id}`,
          source: prev.id,
          target: stop.id,
          type: "smoothstep",
          className: "thread-edge",
          style: { stroke: "#171717", strokeWidth: 1.5 },
        };
      }),
    [],
  );

  return (
    <div className="h-[420px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll={false}
        zoomOnPinch
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
