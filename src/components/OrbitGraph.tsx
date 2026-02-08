import { useCallback, useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { graphNodes, graphLinks } from "@/data/mockData";
import type { GraphNode } from "@/data/mockData";
import { motion } from "framer-motion";

const NODE_COLORS: Record<string, string> = {
  project: "#00e5ff",
  person: "#b366ff",
  decision: "#ffab00",
};

const GROUP_COLORS: Record<string, string> = {
  engineering: "#00e5ff",
  marketing: "#ff6b9d",
  product: "#b366ff",
  leadership: "#ffab00",
  design: "#66ffcc",
  sales: "#ff8a65",
};

export function OrbitGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const { x, y, type, name, val } = node as GraphNode & { x: number; y: number };
    const size = Math.sqrt(val) * 2;
    const color = NODE_COLORS[type] || "#00e5ff";

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.arc(x, y, size * 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Main node
    ctx.beginPath();
    if (type === "project") {
      // Hexagon for projects
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (type === "decision") {
      // Diamond for decisions
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
    } else {
      // Circle for people
      ctx.arc(x, y, size, 0, 2 * Math.PI);
    }

    ctx.fillStyle = color + "30";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.font = `${type === "project" ? "bold " : ""}${type === "decision" ? 8 : 9}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#e0e8f0";
    ctx.fillText(name, x, y + size + 4);
  }, []);

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;
    if (!start || !end || typeof start === "string" || typeof end === "string") return;

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
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{
          nodes: graphNodes.map((n) => ({ ...n })),
          links: graphLinks.map((l) => ({ ...l })),
        }}
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
