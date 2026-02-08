import { StatsBar } from "@/components/StatsBar";
import { OrbitGraph } from "@/components/OrbitGraph";
import { LivePulseFeed } from "@/components/LivePulseFeed";
import { motion } from "framer-motion";

const Dashboard = () => {
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
          <OrbitGraph />
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
