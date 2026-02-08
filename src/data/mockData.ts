export interface GraphNode {
  id: string;
  name: string;
  type: "project" | "person" | "decision";
  group: string;
  val: number;
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;
  label?: string;
}

export interface PulseAlert {
  id: string;
  type: "overlap" | "conflict" | "insight" | "velocity";
  title: string;
  description: string;
  impact: number;
  timestamp: Date;
  sources: string[];
}

export interface TruthEntry {
  id: string;
  key: string;
  value: string;
  confidence: number;
  lastUpdated: Date;
  updatedBy: string;
  category: string;
  history: { value: string; date: Date; author: string }[];
}

export const graphNodes: GraphNode[] = [
  // Projects (large)
  { id: "p1", name: "Project Atlas", type: "project", group: "engineering", val: 28, description: "Core platform migration" },
  { id: "p2", name: "Campaign Horizon", type: "project", group: "marketing", val: 24, description: "Q2 brand campaign" },
  { id: "p3", name: "Project Nexus", type: "project", group: "product", val: 22, description: "Integration framework" },
  { id: "p4", name: "Revenue Engine", type: "project", group: "sales", val: 20, description: "Sales pipeline overhaul" },

  // People (medium)
  { id: "h1", name: "Sarah Chen", type: "person", group: "leadership", val: 16, description: "CEO" },
  { id: "h2", name: "Marcus Rivera", type: "person", group: "engineering", val: 14, description: "VP Engineering" },
  { id: "h3", name: "Priya Patel", type: "person", group: "marketing", val: 14, description: "Head of Marketing" },
  { id: "h4", name: "James Wu", type: "person", group: "product", val: 13, description: "Product Director" },
  { id: "h5", name: "Elena Kowalski", type: "person", group: "design", val: 12, description: "Design Lead" },
  { id: "h6", name: "David Kim", type: "person", group: "sales", val: 12, description: "VP Sales" },
  { id: "h7", name: "Aisha Johnson", type: "person", group: "engineering", val: 11, description: "Senior Engineer" },
  { id: "h8", name: "Tom Bradley", type: "person", group: "marketing", val: 10, description: "Content Strategist" },

  // Decisions (small)
  { id: "d1", name: "Launch Date: June 1", type: "decision", group: "leadership", val: 8, description: "Approved by exec team" },
  { id: "d2", name: "Migrate to K8s", type: "decision", group: "engineering", val: 7, description: "Infrastructure decision" },
  { id: "d3", name: "Rebrand Colors", type: "decision", group: "marketing", val: 6, description: "Pending design review" },
  { id: "d4", name: "API v3 Spec", type: "decision", group: "product", val: 7, description: "Finalized" },
  { id: "d5", name: "Budget +20%", type: "decision", group: "leadership", val: 6, description: "Q2 budget increase" },
];

export const graphLinks: GraphLink[] = [
  // CEO connections
  { source: "h1", target: "p1", strength: 0.9, label: "sponsors" },
  { source: "h1", target: "p2", strength: 0.7, label: "reviews" },
  { source: "h1", target: "d1", strength: 0.95, label: "decided" },
  { source: "h1", target: "d5", strength: 0.9, label: "approved" },
  { source: "h1", target: "h2", strength: 0.8, label: "reports" },
  { source: "h1", target: "h3", strength: 0.75, label: "reports" },
  { source: "h1", target: "h6", strength: 0.7, label: "reports" },

  // Engineering
  { source: "h2", target: "p1", strength: 0.95, label: "leads" },
  { source: "h2", target: "d2", strength: 0.9, label: "decided" },
  { source: "h2", target: "h7", strength: 0.85, label: "manages" },
  { source: "h7", target: "p1", strength: 0.9, label: "builds" },
  { source: "h7", target: "d4", strength: 0.7, label: "contributed" },

  // Marketing
  { source: "h3", target: "p2", strength: 0.95, label: "leads" },
  { source: "h3", target: "d3", strength: 0.85, label: "proposed" },
  { source: "h8", target: "p2", strength: 0.8, label: "executes" },
  { source: "h8", target: "h3", strength: 0.75, label: "reports" },

  // Product
  { source: "h4", target: "p3", strength: 0.9, label: "leads" },
  { source: "h4", target: "d4", strength: 0.85, label: "defined" },
  { source: "h4", target: "p1", strength: 0.6, label: "advises" },
  { source: "h5", target: "p3", strength: 0.7, label: "designs" },
  { source: "h5", target: "d3", strength: 0.8, label: "reviews" },

  // Sales
  { source: "h6", target: "p4", strength: 0.9, label: "leads" },
  { source: "h6", target: "d1", strength: 0.6, label: "informed" },

  // Cross-functional links
  { source: "p1", target: "p3", strength: 0.7, label: "depends on" },
  { source: "p2", target: "d1", strength: 0.8, label: "blocked by" },
  { source: "p4", target: "d1", strength: 0.65, label: "aligned to" },
  { source: "d2", target: "p1", strength: 0.85, label: "enables" },
  { source: "d3", target: "p2", strength: 0.75, label: "impacts" },
];

export const pulseAlerts: PulseAlert[] = [
  {
    id: "a1",
    type: "overlap",
    title: "Engineering ↔ Marketing Collision",
    description: "Decision 'Launch Date: June 1' in Engineering is impacting Marketing — 85% overlap in dependent tasks.",
    impact: 85,
    timestamp: new Date(Date.now() - 120000),
    sources: ["Project Atlas", "Campaign Horizon"],
  },
  {
    id: "a2",
    type: "conflict",
    title: "Truth Conflict Detected",
    description: "API v3 Spec shows conflicting timelines between Product and Engineering teams.",
    impact: 72,
    timestamp: new Date(Date.now() - 300000),
    sources: ["Project Nexus", "Project Atlas"],
  },
  {
    id: "a3",
    type: "velocity",
    title: "Knowledge Velocity Spike",
    description: "Information flow between Sarah Chen and Marcus Rivera increased 340% in the last 24h.",
    impact: 90,
    timestamp: new Date(Date.now() - 600000),
    sources: ["Sarah Chen", "Marcus Rivera"],
  },
  {
    id: "a4",
    type: "insight",
    title: "Alignment Opportunity",
    description: "Design Lead Elena and Product Director James share 92% context overlap on Project Nexus.",
    impact: 45,
    timestamp: new Date(Date.now() - 900000),
    sources: ["Elena Kowalski", "James Wu"],
  },
  {
    id: "a5",
    type: "overlap",
    title: "Budget Decision Ripple",
    description: "Budget +20% decision is propagating through 4 projects and affecting 6 team members.",
    impact: 68,
    timestamp: new Date(Date.now() - 1500000),
    sources: ["Revenue Engine", "Campaign Horizon"],
  },
];

export const truthEntries: TruthEntry[] = [
  {
    id: "t1",
    key: "Launch Date",
    value: "June 1, 2026",
    confidence: 94,
    lastUpdated: new Date(Date.now() - 86400000),
    updatedBy: "Sarah Chen",
    category: "Timeline",
    history: [
      { value: "June 1, 2026", date: new Date(Date.now() - 86400000), author: "Sarah Chen" },
      { value: "May 15, 2026", date: new Date(Date.now() - 604800000), author: "Marcus Rivera" },
      { value: "July 1, 2026", date: new Date(Date.now() - 2592000000), author: "James Wu" },
    ],
  },
  {
    id: "t2",
    key: "Infrastructure",
    value: "Kubernetes (AWS EKS)",
    confidence: 88,
    lastUpdated: new Date(Date.now() - 172800000),
    updatedBy: "Marcus Rivera",
    category: "Technical",
    history: [
      { value: "Kubernetes (AWS EKS)", date: new Date(Date.now() - 172800000), author: "Marcus Rivera" },
      { value: "Docker Swarm", date: new Date(Date.now() - 1296000000), author: "Aisha Johnson" },
    ],
  },
  {
    id: "t3",
    key: "Brand Colors",
    value: "Under Review — 3 Proposals",
    confidence: 42,
    lastUpdated: new Date(Date.now() - 43200000),
    updatedBy: "Elena Kowalski",
    category: "Design",
    history: [
      { value: "Under Review — 3 Proposals", date: new Date(Date.now() - 43200000), author: "Elena Kowalski" },
      { value: "Existing palette retained", date: new Date(Date.now() - 864000000), author: "Priya Patel" },
    ],
  },
  {
    id: "t4",
    key: "API Version",
    value: "v3.2.1 (Finalized)",
    confidence: 96,
    lastUpdated: new Date(Date.now() - 259200000),
    updatedBy: "James Wu",
    category: "Technical",
    history: [
      { value: "v3.2.1 (Finalized)", date: new Date(Date.now() - 259200000), author: "James Wu" },
      { value: "v3.1.0 (Draft)", date: new Date(Date.now() - 1728000000), author: "Aisha Johnson" },
      { value: "v2.8.0", date: new Date(Date.now() - 5184000000), author: "Marcus Rivera" },
    ],
  },
  {
    id: "t5",
    key: "Q2 Budget",
    value: "$2.4M (+20% approved)",
    confidence: 91,
    lastUpdated: new Date(Date.now() - 345600000),
    updatedBy: "Sarah Chen",
    category: "Finance",
    history: [
      { value: "$2.4M (+20% approved)", date: new Date(Date.now() - 345600000), author: "Sarah Chen" },
      { value: "$2.0M (proposed)", date: new Date(Date.now() - 2160000000), author: "David Kim" },
    ],
  },
  {
    id: "t6",
    key: "Target Market",
    value: "Enterprise B2B SaaS (100-500 employees)",
    confidence: 78,
    lastUpdated: new Date(Date.now() - 518400000),
    updatedBy: "David Kim",
    category: "Strategy",
    history: [
      { value: "Enterprise B2B SaaS (100-500 employees)", date: new Date(Date.now() - 518400000), author: "David Kim" },
      { value: "Mid-market B2B", date: new Date(Date.now() - 3456000000), author: "Priya Patel" },
    ],
  },
];

export const stats = {
  knowledgeVelocity: 847,
  velocityTrend: 12.4,
  truthConflicts: 3,
  conflictsTrend: -1,
  alignmentScore: 76,
  alignmentTrend: 4.2,
  activeNodes: graphNodes.length,
  activeLinks: graphLinks.length,
};
