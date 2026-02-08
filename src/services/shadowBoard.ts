import type { GraphNode, GraphLink } from "@/data/mockData";

export interface ShadowSimulationResult {
  brokenNodeIds: string[];
  orphanedNodeIds: string[];
  deconflictionMemo: {
    stakeholders: { name: string; reason: string }[];
    summary: string;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
}

export async function simulateDecision(
  hypothetical: string,
  nodes: GraphNode[],
  links: GraphLink[]
): Promise<ShadowSimulationResult> {
  const response = await fetch("http://localhost:3001/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hypothetical,
      nodes,
      edges: links,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error || `API error: ${response.status}`
    );
  }

  const data = await response.json();
  return data;
}
