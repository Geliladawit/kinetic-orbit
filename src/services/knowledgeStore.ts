import type {
  KnowledgeNode,
  KnowledgeEdge,
  TruthLedgerEntry,
  ConflictTicket,
} from "@/types/knowledge";

const STORAGE_KEYS = {
  nodes: "kinetic_nodes",
  edges: "kinetic_edges",
  truthLedger: "kinetic_truth_ledger",
  conflicts: "kinetic_conflicts",
  apiKey: "kinetic_openai_api_key",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Nodes ---
export function getNodes(): KnowledgeNode[] {
  return load<KnowledgeNode[]>(STORAGE_KEYS.nodes, []);
}

export function saveNodes(nodes: KnowledgeNode[]): void {
  save(STORAGE_KEYS.nodes, nodes);
}

export function addNodes(newNodes: KnowledgeNode[]): KnowledgeNode[] {
  const existing = getNodes();
  const existingLabels = new Set(existing.map((n) => n.label.toLowerCase()));
  const deduped = newNodes.filter(
    (n) => !existingLabels.has(n.label.toLowerCase())
  );
  const merged = [...existing, ...deduped];
  saveNodes(merged);
  return merged;
}

// --- Edges ---
export function getEdges(): KnowledgeEdge[] {
  return load<KnowledgeEdge[]>(STORAGE_KEYS.edges, []);
}

export function saveEdges(edges: KnowledgeEdge[]): void {
  save(STORAGE_KEYS.edges, edges);
}

export function addEdges(newEdges: KnowledgeEdge[]): KnowledgeEdge[] {
  const existing = getEdges();
  const existingKeys = new Set(
    existing.map((e) => `${e.source_id}|${e.target_id}|${e.relation_type}`)
  );
  const deduped = newEdges.filter(
    (e) => !existingKeys.has(`${e.source_id}|${e.target_id}|${e.relation_type}`)
  );
  const merged = [...existing, ...deduped];
  saveEdges(merged);
  return merged;
}

// --- Truth Ledger ---
export function getTruthLedger(): TruthLedgerEntry[] {
  return load<TruthLedgerEntry[]>(STORAGE_KEYS.truthLedger, []);
}

export function saveTruthLedger(entries: TruthLedgerEntry[]): void {
  save(STORAGE_KEYS.truthLedger, entries);
}

export function addTruthEntries(
  newEntries: TruthLedgerEntry[]
): TruthLedgerEntry[] {
  const existing = getTruthLedger();
  const merged = [...existing, ...newEntries];
  saveTruthLedger(merged);
  return merged;
}

// --- Conflicts ---
export function getConflicts(): ConflictTicket[] {
  return load<ConflictTicket[]>(STORAGE_KEYS.conflicts, []);
}

export function addConflicts(tickets: ConflictTicket[]): ConflictTicket[] {
  const existing = getConflicts();
  const merged = [...existing, ...tickets];
  save(STORAGE_KEYS.conflicts, merged);
  return merged;
}

// --- API Key ---
export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEYS.apiKey, key);
}

// --- Mark contested nodes ---
export function markNodesContested(labels: string[]): void {
  const nodes = getNodes();
  const labelSet = new Set(labels.map((l) => l.toLowerCase()));
  const updated = nodes.map((n) =>
    labelSet.has(n.label.toLowerCase()) ? { ...n, status: "contested" as const } : n
  );
  saveNodes(updated);
}
