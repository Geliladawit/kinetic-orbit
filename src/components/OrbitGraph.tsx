import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { graphNodes as mockNodes, graphLinks as mockLinks } from "@/data/mockData";
import type { GraphNode } from "@/data/mockData";
import { motion } from "framer-motion";
import { useKnowledge } from "@/contexts/KnowledgeContext";

const NODE_COLORS: Record<string, string> = {
  project: "#00e5ff",
  person: "#b366ff",
  decision: "#ffab00",
  // Map DB types to same colors
  Project: "#00e5ff",
  Person: "#b366ff",
  Decision: "#ffab00",
};

const GROUP_COLORS: Record<string, string> = {
  engineering: "#00e5ff",
  marketing: "#ff6b9d",
  product: "#b366ff",
  leadership: "#ffab00",
  design: "#66ffcc",
  sales: "#ff8a65",
  extracted: "#00e5ff",
};

export function OrbitGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const { nodes: knowledgeNodes, edges: knowledgeEdges, newNodeIds } = useKnowledge();

  // Track animation time for pulsing
  const animTimeRef = useRef(0);
  useEffect(() => {
    let frame: number;
    const tick = () => {
      animTimeRef.current = Date.now();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Merge mock data with extracted knowledge nodes/edges
  const graphData = useMemo(() => {
    const convertedNodes: GraphNode[] = knowledgeNodes.map((kn) => ({
      id: kn.id,
      name: kn.label,
      type: kn.type.toLowerCase() as "project" | "person" | "decision",
      group: "extracted",
      val: kn.type === "Project" ? 20 : kn.type === "Person" ? 14 : 8,
      description: kn.metadata?.context || kn.metadata?.role || `Extracted ${kn.type}`,
    }));

    const allNodes = [...mockNodes.map((n) => ({ ...n })), ...convertedNodes];

    // Build id set for edge validation
    const nodeIds = new Set(allNodes.map((n) => n.id));

    const convertedLinks = knowledgeEdges
      .filter((ke) => nodeIds.has(ke.source_id) && nodeIds.has(ke.target_id))
      .map((ke) => ({
        source: ke.source_id,
        target: ke.target_id,
        strength: 0.7,
        label: ke.relation_type,
      }));

    const allLinks = [...mockLinks.map((l) => ({ ...l })), ...convertedLinks];

    return { nodes: allNodes, links: allLinks };
  }, [knowledgeNodes, knowledgeEdges]);

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D) => {
      const { x, y, type, name, val, id } = node as GraphNode & { x: number; y: number };
      if (x == null || y == null || !isFinite(x) || !isFinite(y)) return;
      const size = Math.sqrt(val) * 2;
      const color = NODE_COLORS[type] || "#00e5ff";
      const isNew = newNodeIds.has(id);

      // Pulse animation for new nodes
      if (isNew) {
        const t = (Date.now() % 1500) / 1500;
        const pulseSize = size * (2.5 + Math.sin(t * Math.PI * 2) * 1.5);
        const pulseAlpha = 0.3 + Math.sin(t * Math.PI * 2) * 0.2;

        const pulseGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        pulseGradient.addColorStop(0, color + Math.round(pulseAlpha * 255).toString(16).padStart(2, "0"));
        pulseGradient.addColorStop(1, color + "00");
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
        ctx.fillStyle = pulseGradient;
        ctx.fill();
      }

      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
      gradient.addColorStop(0, color + "40");
      gradient.addColorStop(1, color + "00");
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Main node shape
      ctx.beginPath();
      if (type === "project") {
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + size * Math.cos(angle);
          const py = y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (type === "decision") {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
      } else {
        ctx.arc(x, y, size, 0, 2 * Math.PI);
      }

      ctx.fillStyle = isNew ? color + "60" : color + "30";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isNew ? 2.5 : 1.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, isNew ? 3 : 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.font = `${type === "project" ? "bold " : ""}${type === "decision" ? 8 : 9}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isNew ? "#ffffff" : "#e0e8f0";
      ctx.fillText(name, x, y + size + 4);
    },
    [newNodeIds]
  );

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;
    if (!start || !end || typeof start === "string" || typeof end === "string") return;
    if (!isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) return;

    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    const sourceColor = GROUP_COLORS[start.group] || "#00e5ff";
    const targetColor = GROUP_COLORS[end.group] || "#00e5ff";

    gradient.addColorStop(0, sourceColor + "40");
    gradient.addColorStop(0.5, sourceColor + "18");
    gradient.addColorStop(1, targetColor + "40");

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = link.strength * 1.5;
    ctx.stroke();
  }, []);

  const handleNodeHover = useCallback((node: any, prevNode: any) => {
    if (node) {
      setHoveredNode(node as GraphNode);
      setTooltipPos({ x: node.x || 0, y: node.y || 0 });
    } else {
      setHoveredNode(null);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => "#00e5ff40"}
        backgroundColor="rgba(0,0,0,0)"
        onNodeHover={handleNodeHover}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTicks={100}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      {/* New nodes indicator */}
      {newNodeIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-4 right-4 z-10 glass-card rounded-lg px-3 py-2 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-primary">
            +{newNodeIds.size} new nodes pulsing
          </span>
        </motion.div>
      )}

      {/* Tooltip */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none z-50 glass-card rounded-lg px-3 py-2 max-w-[200px]"
          style={{
            left: "50%",
            top: 16,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
            />
            <span className="text-sm font-medium text-foreground">{hoveredNode.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{hoveredNode.description}</p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {hoveredNode.type} · {hoveredNode.group}
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        {[
          { type: "project", label: "Project", shape: "⬡" },
          { type: "person", label: "Person", shape: "●" },
          { type: "decision", label: "Decision", shape: "◆" },
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span style={{ color: NODE_COLORS[item.type] }}>{item.shape}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
