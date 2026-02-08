import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { truthEntries } from "@/data/mockData";
import type { TruthEntry } from "@/data/mockData";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Shield,
  GitCommit,
  Search,
  Filter,
} from "lucide-react";

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "text-success bg-success/10 border-success/20"
      : score >= 70
        ? "text-primary bg-primary/10 border-primary/20"
        : score >= 50
          ? "text-accent bg-accent/10 border-accent/20"
          : "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${color}`}>
      <Shield className="w-2.5 h-2.5" />
      {score}%
    </span>
  );
}

function TruthRow({ entry }: { entry: TruthEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="text-muted-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {entry.category}
            </span>
            <span className="text-sm font-semibold text-foreground">{entry.key}</span>
          </div>
          <p className="text-sm text-primary font-mono mt-1">{entry.value}</p>
        </div>
        <ConfidenceBadge score={entry.confidence} />
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Clock className="w-3 h-3" />
          {entry.lastUpdated.toLocaleDateString()}
        </div>
        <span className="text-xs text-muted-foreground">{entry.updatedBy}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <GitCommit className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Commit History</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {entry.history.length} versions
                </span>
              </div>
              <div className="relative pl-4 space-y-3">
                <div className="absolute left-[6.5px] top-1 bottom-1 w-px bg-border" />
                {entry.history.map((h, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div
                      className={`relative z-10 w-3 h-3 rounded-full border-2 ${
                        i === 0
                          ? "bg-primary border-primary"
                          : "bg-background border-muted-foreground/40"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-mono text-foreground">{h.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {h.author} · {h.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TruthLedger = () => {
  const [search, setSearch] = useState("");

  const filtered = truthEntries.filter(
    (e) =>
      e.key.toLowerCase().includes(search.toLowerCase()) ||
      e.value.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground">The Truth Ledger</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Version-controlled organizational truths with confidence scoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-card rounded-lg flex items-center gap-2 px-3 py-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search truths..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-48"
              />
            </div>
            <button className="glass-card rounded-lg p-2 hover:bg-secondary/50 transition-colors">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
          {filtered.map((entry) => (
            <TruthRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TruthLedger;
