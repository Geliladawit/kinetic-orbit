import type { ExtractionResult } from "@/types/knowledge";

export async function extractKnowledge(
  text: string
): Promise<ExtractionResult> {
  const response = await fetch("http://localhost:3001/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error || `API error: ${response.status}`
    );
  }

  const data = await response.json();

  // Validate structure
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error("Invalid extraction format returned from AI");
  }

  return data;
}
