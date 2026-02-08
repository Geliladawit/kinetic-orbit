import type {
  TruthLedgerEntry,
  ConflictTicket,
  ExtractionResult,
} from "@/types/knowledge";

/**
 * THE AUDITOR — Searches the truth_ledger for contradictions.
 * If a new decision conflicts with an existing entry, it flags the node as
 * "contested" (Amber) and creates a Conflict Ticket.
 */
export function auditDecisions(
  newDecisions: ExtractionResult["decisions"],
  existingLedger: TruthLedgerEntry[]
): {
  confirmedEntries: TruthLedgerEntry[];
  conflicts: ConflictTicket[];
  contestedNodeLabels: string[];
} {
  const confirmedEntries: TruthLedgerEntry[] = [];
  const conflicts: ConflictTicket[] = [];
  const contestedNodeLabels: string[] = [];

  for (const decision of newDecisions) {
    const statement = decision.statement.toLowerCase();

    // Find potential contradictions by looking for entries about the same topic
    const potentialConflicts = existingLedger.filter((entry) => {
      const existing = entry.statement.toLowerCase();
      // Check if they discuss the same subject but differ in content
      const sharedWords = getSharedKeywords(existing, statement);
      const areSimilarTopic = sharedWords.length >= 2;
      const areDifferent = existing !== statement;
      return areSimilarTopic && areDifferent && entry.status === "Confirmed";
    });

    if (potentialConflicts.length > 0) {
      // Conflict detected
      for (const existing of potentialConflicts) {
        const ticket: ConflictTicket = {
          id: `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          existingStatement: existing.statement,
          newStatement: decision.statement,
          nodeId: existing.id,
          createdAt: Date.now(),
        };
        conflicts.push(ticket);
        contestedNodeLabels.push(decision.source);
      }

      // Still add the new entry but as Conflicting
      confirmedEntries.push({
        id: `truth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        statement: decision.statement,
        version: 1,
        status: "Conflicting",
        source_link: decision.source,
        createdAt: Date.now(),
      });
    } else {
      // No conflict — confirm
      confirmedEntries.push({
        id: `truth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        statement: decision.statement,
        version: 1,
        status: "Confirmed",
        source_link: decision.source,
        createdAt: Date.now(),
      });
    }
  }

  return { confirmedEntries, conflicts, contestedNodeLabels };
}

/**
 * Extract meaningful keywords (skip common stop words)
 */
function getSharedKeywords(a: string, b: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "and", "but", "or", "nor", "not", "so", "yet",
    "both", "either", "neither", "each", "every", "all", "any", "few",
    "more", "most", "other", "some", "such", "no", "only", "own", "same",
    "than", "too", "very", "just", "that", "this", "it", "its", "we",
    "they", "them", "their", "our", "your", "my", "his", "her",
  ]);

  const wordsA = a.split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const wordsB = new Set(b.split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w)));

  return wordsA.filter((w) => wordsB.has(w));
}
