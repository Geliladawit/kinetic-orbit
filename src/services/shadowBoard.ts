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

const SHADOW_PROMPT = `You are the SHADOW BOARD — a strategic simulation engine for an organizational knowledge graph called KINETIC. You analyze hypothetical decisions and determine their impact on the organizational graph.

You will receive:
1. The current knowledge graph (nodes and edges)
2. A hypothetical decision

Your job:
- Identify which nodes would be "broken" (directly impacted/invalidated by this decision)
- Identify which nodes would be "orphaned" (lose their primary connections and become isolated)
- Generate a "Deconfliction Memo" listing every stakeholder who MUST be consulted before this decision is made official

Return ONLY a valid JSON object with this exact structure:
{
  "brokenNodeIds": ["id1", "id2"],
  "orphanedNodeIds": ["id3"],
  "deconflictionMemo": {
    "stakeholders": [
      { "name": "Person Name", "reason": "Why they must be consulted" }
    ],
    "summary": "A 2-3 sentence executive summary of the ripple effects",
    "riskLevel": "low|medium|high|critical"
  }
}

Rules:
- brokenNodeIds: nodes directly invalidated, blocked, or contradicted by the decision
- orphanedNodeIds: nodes that lose their key connections and become stranded
- Only include node IDs that actually exist in the provided graph
- stakeholders: every Person node who is connected to broken/orphaned nodes — they NEED to know
- riskLevel: based on how many nodes are affected and how central they are
- Be thorough but precise — don't flag nodes that are genuinely unaffected
- Do NOT wrap the JSON in markdown code fences — return raw JSON only`;

export async function simulateDecision(
  hypothetical: string,
  nodes: GraphNode[],
  links: GraphLink[],
  apiKey: string
): Promise<ShadowSimulationResult> {
  const graphContext = JSON.stringify(
    {
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        group: n.group,
        description: n.description,
      })),
      edges: links.map((l) => ({
        source: typeof l.source === "string" ? l.source : (l.source as any).id,
        target: typeof l.target === "string" ? l.target : (l.target as any).id,
        label: l.label,
        strength: l.strength,
      })),
    },
    null,
    2
  );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SHADOW_PROMPT },
        {
          role: "user",
          content: `CURRENT KNOWLEDGE GRAPH:\n${graphContext}\n\nHYPOTHETICAL DECISION:\n"${hypothetical}"\n\nAnalyze the blast radius of this decision on the graph.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `OpenAI API error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const cleaned = content.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
  const parsed: ShadowSimulationResult = JSON.parse(cleaned);

  // Validate
  const validIds = new Set(nodes.map((n) => n.id));
  parsed.brokenNodeIds = parsed.brokenNodeIds.filter((id) => validIds.has(id));
  parsed.orphanedNodeIds = parsed.orphanedNodeIds.filter((id) => validIds.has(id));

  return parsed;
}
