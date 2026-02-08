import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  KnowledgeNode,
  KnowledgeEdge,
  TruthLedgerEntry,
  ConflictTicket,
  ExtractionResult,
} from "@/types/knowledge";
import * as store from "@/services/knowledgeStore";
import { extractKnowledge } from "@/services/openaiExtractor";
import { auditDecisions } from "@/services/auditor";
import { calculateBlastRadius } from "@/services/dispatcher";
import { toast } from "@/hooks/use-toast";

interface KnowledgeContextValue {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  truthLedger: TruthLedgerEntry[];
  conflicts: ConflictTicket[];
  newNodeIds: Set<string>;
  isProcessing: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  processText: (text: string) => Promise<void>;
  clearNewNodeHighlights: () => void;
}

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>(store.getNodes);
  const [edges, setEdges] = useState<KnowledgeEdge[]>(store.getEdges);
  const [truthLedger, setTruthLedger] = useState<TruthLedgerEntry[]>(store.getTruthLedger);
  const [conflicts, setConflicts] = useState<ConflictTicket[]>(store.getConflicts);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKeyState] = useState(store.getApiKey);

  const setApiKey = useCallback((key: string) => {
    store.saveApiKey(key);
    setApiKeyState(key);
  }, []);

  const clearNewNodeHighlights = useCallback(() => {
    setNewNodeIds(new Set());
  }, []);

  const processText = useCallback(
    async (text: string) => {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your OpenAI API key in Settings first.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        // STEP 1: THE EXTRACTOR — Call OpenAI
        toast({ title: "🧠 Extractor Active", description: "Analyzing text with GPT-4o..." });
        const extraction = await extractKnowledge(text, apiKey);

        // Convert extracted nodes to KnowledgeNodes
        const now = Date.now();
        const createdNodes: KnowledgeNode[] = extraction.nodes.map((n, i) => ({
          id: `node-${now}-${i}`,
          label: n.label,
          type: n.type,
          metadata: n.metadata || {},
          status: "confirmed",
          createdAt: now,
        }));

        // Build a label → id map for edge resolution
        const allNodes = [...store.getNodes(), ...createdNodes];
        const labelToId = new Map<string, string>();
        for (const n of allNodes) {
          labelToId.set(n.label.toLowerCase(), n.id);
        }

        // Convert edges, resolving labels to IDs
        const createdEdges: KnowledgeEdge[] = extraction.edges
          .map((e, i) => ({
            id: `edge-${now}-${i}`,
            source_id: labelToId.get(e.source.toLowerCase()) || "",
            target_id: labelToId.get(e.target.toLowerCase()) || "",
            relation_type: e.relation_type,
          }))
          .filter((e) => e.source_id && e.target_id);

        // Save to store
        const mergedNodes = store.addNodes(createdNodes);
        const mergedEdges = store.addEdges(createdEdges);

        // Track new node IDs for pulse animation
        const addedIds = new Set(createdNodes.map((n) => n.id));
        setNewNodeIds(addedIds);

        // Auto-clear highlights after 8 seconds
        setTimeout(() => setNewNodeIds(new Set()), 8000);

        setNodes(mergedNodes);
        setEdges(mergedEdges);

        // STEP 2: THE AUDITOR — Check for contradictions
        if (extraction.decisions.length > 0) {
          const auditResult = auditDecisions(extraction.decisions, store.getTruthLedger());

          const updatedLedger = store.addTruthEntries(auditResult.confirmedEntries);
          setTruthLedger(updatedLedger);

          if (auditResult.conflicts.length > 0) {
            const updatedConflicts = store.addConflicts(auditResult.conflicts);
            setConflicts(updatedConflicts);
            store.markNodesContested(auditResult.contestedNodeLabels);
            setNodes(store.getNodes());

            toast({
              title: "⚠️ Conflict Detected",
              description: `${auditResult.conflicts.length} contradiction(s) flagged. Check the Truth Ledger.`,
            });
          }

          // STEP 3: THE DISPATCHER — Calculate blast radius
          const changedIds = createdNodes.map((n) => n.id);
          const blastResult = calculateBlastRadius(changedIds, store.getNodes(), store.getEdges());

          if (blastResult.affectedNodes.length > 0) {
            toast({
              title: "📡 Blast Radius Calculated",
              description: blastResult.summary,
            });
          }
        }

        toast({
          title: "✅ Knowledge Injected",
          description: `Added ${createdNodes.length} nodes and ${createdEdges.length} edges to the Orbit.`,
        });
      } catch (error: any) {
        console.error("Extraction failed:", error);
        toast({
          title: "Extraction Failed",
          description: error.message || "Could not process the text. Check your API key.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [apiKey]
  );

  return (
    <KnowledgeContext.Provider
      value={{
        nodes,
        edges,
        truthLedger,
        conflicts,
        newNodeIds,
        isProcessing,
        apiKey,
        setApiKey,
        processText,
        clearNewNodeHighlights,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

const FALLBACK: KnowledgeContextValue = {
  nodes: [],
  edges: [],
  truthLedger: [],
  conflicts: [],
  newNodeIds: new Set(),
  isProcessing: false,
  apiKey: "",
  setApiKey: () => {},
  processText: async () => {},
  clearNewNodeHighlights: () => {},
};

export function useKnowledge() {
  const ctx = useContext(KnowledgeContext);
  return ctx ?? FALLBACK;
}
