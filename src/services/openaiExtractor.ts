import type { ExtractionResult } from "@/types/knowledge";

const SYSTEM_PROMPT = `You are an organizational intelligence extractor for a knowledge graph engine called KINETIC. Analyze the provided text (meeting transcript, email, or communication) and extract structured information.

Return ONLY a valid JSON object with this exact structure:
{
  "nodes": [
    { "label": "Entity Name", "type": "Person|Project|Decision", "metadata": { "role": "...", "context": "..." } }
  ],
  "edges": [
    { "source": "Source Label", "target": "Target Label", "relation_type": "depends_on|manages|decided|sponsors|reports_to|leads|builds|reviews|blocks|enables|impacts" }
  ],
  "decisions": [
    { "statement": "Clear statement of the decision", "source": "Who made or communicated it" }
  ]
}

Rules:
- "type" must be exactly one of: "Person", "Project", "Decision"
- Extract all people/stakeholders as Person nodes (include role in metadata)
- Extract all projects, initiatives, or workstreams as Project nodes
- Extract all decisions, conclusions, or commitments as Decision nodes
- Identify relationships/dependencies between entities as edges
- Use the "relation_type" values listed above — pick the most accurate one
- For decisions, extract the core statement and who proposed/decided it
- Be thorough but avoid duplicates
- Do NOT wrap the JSON in markdown code fences — return raw JSON only`;

export async function extractKnowledge(
  text: string,
  apiKey: string
): Promise<ExtractionResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this text and extract organizational entities and relationships:\n\n${text}`,
        },
      ],
      temperature: 0.2,
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

  // Parse the JSON response, stripping any markdown fences
  const cleaned = content.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
  const parsed: ExtractionResult = JSON.parse(cleaned);

  // Validate structure
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid extraction format returned from AI");
  }

  return parsed;
}
