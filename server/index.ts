import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenAI proxy endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("Invalid extraction format returned from AI");
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Extraction failed:', error);
    res.status(500).json({ 
      error: error.message || "Failed to process text" 
    });
  }
});

// Shadow Board simulation endpoint
app.post('/api/simulate', async (req, res) => {
  try {
    const { hypothetical, nodes, edges } = req.body;
    
    if (!hypothetical || !nodes || !edges) {
      return res.status(400).json({ error: 'Hypothetical decision, nodes, and edges are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const SHADOW_PROMPT = `You are SHADOW BOARD — a strategic simulation engine for an organizational knowledge graph called KINETIC. You analyze hypothetical decisions and determine their impact on organizational graph.

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
    "summary": "A 2-3 sentence executive summary of ripple effects",
    "riskLevel": "low|medium|high|critical"
  }
}

Rules:
- brokenNodeIds: nodes directly invalidated, blocked, or contradicted by decision
- orphanedNodeIds: nodes that lose their key connections and become stranded
- Only include node IDs that actually exist in provided graph
- stakeholders: every Person node who is connected to broken/orphaned nodes — they NEED to know
- riskLevel: based on how many nodes are affected and how central they are
- Be thorough but precise — don't flag nodes that are genuinely unaffected
- Do NOT wrap JSON in markdown code fences — return raw JSON only`;

    const graphContext = JSON.stringify(
      {
        nodes: nodes.map((n: any) => ({
          id: n.id,
          name: n.name,
          type: n.type,
          group: n.group,
          description: n.description,
        })),
        edges: edges.map((e: any) => ({
          source: typeof e.source === "string" ? e.source : e.source.id,
          target: typeof e.target === "string" ? e.target : e.target.id,
          label: e.label,
          strength: e.strength,
        })),
      },
      null,
      2
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SHADOW_PROMPT },
          {
            role: "user",
            content: `CURRENT KNOWLEDGE GRAPH:\n${graphContext}\n\nHYPOTHETICAL DECISION:\n"${hypothetical}"\n\nAnalyze blast radius of this decision on graph.`,
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
    const parsed = JSON.parse(cleaned);

    // Validate node IDs
    const validIds = new Set(nodes.map((n: any) => n.id));
    parsed.brokenNodeIds = parsed.brokenNodeIds.filter((id: string) => validIds.has(id));
    parsed.orphanedNodeIds = parsed.orphanedNodeIds.filter((id: string) => validIds.has(id));

    res.json(parsed);
  } catch (error: any) {
    console.error('Shadow simulation failed:', error);
    res.status(500).json({ 
      error: error.message || "Failed to run simulation" 
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Kinetic Orbit API server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
