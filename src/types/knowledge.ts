export interface KnowledgeNode {
  id: string;
  label: string;
  type: "Person" | "Project" | "Decision";
  metadata: Record<string, any>;
  status?: "confirmed" | "contested";
  createdAt: number;
}

export interface KnowledgeEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
}

export interface TruthLedgerEntry {
  id: string;
  statement: string;
  version: number;
  status: "Confirmed" | "Conflicting";
  source_link: string;
  createdAt: number;
}

export interface ExtractionResult {
  nodes: Omit<KnowledgeNode, "id" | "createdAt">[];
  edges: { source: string; target: string; relation_type: string }[];
  decisions: { statement: string; source: string }[];
}

export interface BlastRadiusResult {
  affectedNodes: KnowledgeNode[];
  summary: string;
}

export interface ConflictTicket {
  id: string;
  existingStatement: string;
  newStatement: string;
  nodeId: string;
  createdAt: number;
}
