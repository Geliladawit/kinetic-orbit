import { useState, useCallback } from "react";
import { StatsBar } from "@/components/StatsBar";
import { OrbitGraph } from "@/components/OrbitGraph";
import { LivePulseFeed } from "@/components/LivePulseFeed";
import { ShadowBoardModal } from "@/components/ShadowBoardModal";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [shadowBrokenIds, setShadowBrokenIds] = useState<Set<string>>(new Set());
  const [shadowOrphanedIds, setShadowOrphanedIds] = useState<Set<string>>(new Set());

  const handleSimulationResult = useCallback((brokenIds: string[], orphanedIds: string[]) => {
    setShadowBrokenIds(new Set(brokenIds));
    setShadowOrphanedIds(new Set(orphanedIds));
  }, []);

  const handleClearShadow = useCallback(() => {
    setShadowBrokenIds(new Set());
    setShadowOrphanedIds(new Set());
  }, []);

  const hasShadow = shadowBrokenIds.size > 0 || shadowOrphanedIds.size > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-5 pb-3"
      >
        <StatsBar />
      </motion.div>

      {/* Main content */}
      <div className="flex flex-1 gap-4 px-6 pb-5 min-h-0">
        {/* Orbit Graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 glass-panel rounded-2xl overflow-hidden relative"
        >
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              The Orbit — Knowledge Graph
            </span>
          </div>

          {/* Shadow Board controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <ShadowBoardModal
              onSimulationResult={handleSimulationResult}
              onClear={handleClearShadow}
            />
          </div>

          {/* Shadow mode indicator */}
          {hasShadow && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-14 right-4 z-10 rounded-lg border border-border bg-background/90 px-3 py-2 flex items-center gap-2"
            >
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {shadowBrokenIds.size} broken
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {shadowOrphanedIds.size} orphaned
                </span>
              </div>
            </motion.div>
          )}

          <OrbitGraph
            shadowBrokenIds={shadowBrokenIds}
            shadowOrphanedIds={shadowOrphanedIds}
          />
        </motion.div>

        {/* Live Pulse Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-[320px] glass-panel rounded-2xl p-4 overflow-hidden flex flex-col shrink-0"
        >
          <LivePulseFeed />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
