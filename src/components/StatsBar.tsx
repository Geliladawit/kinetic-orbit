import { motion } from "framer-motion";
import { Activity, AlertTriangle, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { stats } from "@/data/mockData";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  accentClass: string;
}

function StatCard({ title, value, trend, icon, accentClass }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 flex-1 min-w-[180px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={accentClass}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-2xl font-bold font-mono ${accentClass}`}>{value}</span>
        <div className="flex items-center gap-0.5 text-xs">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          <span className={isPositive ? "text-success" : "text-destructive"}>
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsBar() {
  return (
    <div className="flex gap-3 flex-wrap">
      <StatCard
        title="Knowledge Velocity"
        value={stats.knowledgeVelocity}
        trend={stats.velocityTrend}
        icon={<Zap className="w-4 h-4" />}
        accentClass="text-primary"
      />
      <StatCard
        title="Truth Conflicts"
        value={stats.truthConflicts}
        trend={stats.conflictsTrend}
        icon={<AlertTriangle className="w-4 h-4" />}
        accentClass="text-accent"
      />
      <StatCard
        title="Alignment Score"
        value={`${stats.alignmentScore}%`}
        trend={stats.alignmentTrend}
        icon={<Activity className="w-4 h-4" />}
        accentClass="text-primary"
      />
    </div>
  );
}
