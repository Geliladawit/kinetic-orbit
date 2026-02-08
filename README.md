# Kinetic Orbit

A sophisticated knowledge management and organizational intelligence system that visualizes and manages organizational knowledge, decisions, and relationships through an interactive graph-based interface.

## 🚀 Features

### 🌐 Knowledge Graph Visualization
- **The Orbit**: Interactive force-directed graph showing relationships between projects, people, and decisions
- Real-time node updates with smooth animations
- Shadow simulation for impact analysis
- Visual feedback for system status

### 📊 Truth Ledger
- Version-controlled organizational truths with confidence scoring
- Complete commit history tracking
- Searchable and filterable truth entries
- Author attribution and timestamp tracking

### 📥 Inbox Upload System
- Drag-and-drop text file upload
- Direct text paste functionality
- AI-powered knowledge extraction using OpenAI
- Real-time processing with visual feedback

### 🔔 Live Pulse Feed
- Real-time alerts for overlaps, conflicts, insights, and velocity changes
- Impact scoring and source tracking
- Automated system notifications

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: TailwindCSS + shadcn/ui components
- **State Management**: React Query + Context API
- **Animations**: Framer Motion
- **Graph Visualization**: react-force-graph-2d
- **AI Processing**: OpenAI API integration
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + TypeScript ESLint

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd kinetic-orbit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Configuration

### OpenAI API Setup

To enable AI-powered knowledge extraction, you'll need to configure your OpenAI API key:

1. Obtain an API key from [OpenAI](https://platform.openai.com/)
2. The application will prompt you to enter the API key when you first try to process text
3. The key is stored locally for future use

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppHeader.tsx   # Main navigation
│   ├── OrbitGraph.tsx  # Knowledge graph visualization
│   ├── StatsBar.tsx    # System statistics
│   └── LivePulseFeed.tsx # Real-time alerts
├── contexts/           # React contexts
│   └── KnowledgeContext.tsx # Global knowledge state
├── data/              # Mock data and types
│   └── mockData.ts    # Sample data structure
├── hooks/             # Custom React hooks
├── pages/             # Main application pages
│   ├── Dashboard.tsx  # Main dashboard
│   ├── TruthLedger.tsx # Truth management
│   └── InboxUpload.tsx # Text processing
├── services/          # Business logic
│   ├── knowledgeStore.ts # Data persistence
│   ├── openaiExtractor.ts # AI processing
│   └── auditor.ts     # Decision auditing
└── types/             # TypeScript type definitions
```

## 🎯 Usage

### Dashboard
- View the interactive knowledge graph
- Monitor system statistics
- Receive real-time pulse alerts
- Access shadow simulation tools

### Truth Ledger
- Browse version-controlled truths
- View confidence scores and history
- Search and filter entries
- Track changes over time

### Inbox
- Upload text files for processing
- Paste text directly for extraction
- Monitor AI processing status
- View extracted knowledge results

## 🧪 Testing

Run the test suite:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build & Deploy

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Data Models

### Knowledge Node
```typescript
interface GraphNode {
  id: string;
  name: string;
  type: "project" | "person" | "decision";
  group: string;
  val: number;
  description?: string;
}
```

### Truth Entry
```typescript
interface TruthEntry {
  id: string;
  key: string;
  value: string;
  confidence: number;
  lastUpdated: Date;
  updatedBy: string;
  category: string;
  history: { value: string; date: Date; author: string }[];
}
```

### Pulse Alert
```typescript
interface PulseAlert {
  id: string;
  type: "overlap" | "conflict" | "insight" | "velocity";
  title: string;
  description: string;
  impact: number;
  timestamp: Date;
  sources: string[];
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

