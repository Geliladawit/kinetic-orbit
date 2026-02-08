import type { KnowledgeNode, KnowledgeEdge, BlastRadiusResult } from "@/types/knowledge";

/**
 * THE DISPATCHER — Calculates the "Blast Radius" of a change.
 * Identifies nodes 1-2 degrees away from changed nodes and generates
 * a "Need-to-Know" summary.
 */
export function calculateBlastRadius(
  changedNodeIds: string[],
  allNodes: KnowledgeNode[],
  allEdges: KnowledgeEdge[]
): BlastRadiusResult {
  const affected = new Set<string>();

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  for (const edge of allEdges) {
    if (!adjacency.has(edge.source_id)) adjacency.set(edge.source_id, new Set());
    if (!adjacency.has(edge.target_id)) adjacency.set(edge.target_id, new Set());
    adjacency.get(edge.source_id)!.add(edge.target_id);
    adjacency.get(edge.target_id)!.add(edge.source_id);
  }

  // BFS up to depth 2
  for (const startId of changedNodeIds) {
    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth > 0) affected.add(id); // don't include the source itself

      if (depth < 2) {
        const neighbors = adjacency.get(id) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ id: neighbor, depth: depth + 1 });
          }
        }
      }
    }
  }

  const affectedNodes = allNodes.filter((n) => affected.has(n.id));
  const people = affectedNodes.filter((n) => n.type === "Person");
  const projects = affectedNodes.filter((n) => n.type === "Project");

  let summary = `🔔 Blast Radius: ${affectedNodes.length} node${affectedNodes.length !== 1 ? "s" : ""} affected.`;
  if (people.length > 0) {
    summary += ` Need-to-know: ${people.map((p) => p.label).join(", ")}.`;
  }
  if (projects.length > 0) {
    summary += ` Impacted projects: ${projects.map((p) => p.label).join(", ")}.`;
  }

  return { affectedNodes, summary };
}
