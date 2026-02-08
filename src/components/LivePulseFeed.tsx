import { motion, AnimatePresence } from "framer-motion";
import { pulseAlerts } from "@/data/mockData";
import type { PulseAlert } from "@/data/mockData";
import { Zap, AlertTriangle, Lightbulb, Activity, Radio } from "lucide-react";

const ALERT_CONFIG: Record<string, { icon: React.ElementType; accentClass: string }> = {
  overlap: { icon: Radio, accentClass: "text-accent" },
  conflict: { icon: AlertTriangle, accentClass: "text-destructive" },
  velocity: { icon: Zap, accentClass: "text-primary" },
  insight: { icon: Lightbulb, accentClass: "text-success" },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ImpactBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-destructive"
      : value >= 60
        ? "bg-accent"
        : value >= 40
          ? "bg-primary"
          : "bg-success";

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
        Impact
      </span>
      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400">{value}%</span>
    </div>
  );
}

function AlertCard({ alert, index }: { alert: PulseAlert; index: number }) {
  const config = ALERT_CONFIG[alert.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-lg p-3 hover:border-primary/20 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 ${config.accentClass}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {alert.title}
            </h4>
            <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
              {timeAgo(alert.timestamp)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {alert.description}
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {alert.sources.map((source) => (
              <span
                key={source}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-slate-400"
              >
                {source}
              </span>
            ))}
          </div>
          <ImpactBar value={alert.impact} />
        </div>
      </div>
    </motion.div>
  );
}

export function LivePulseFeed() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="relative">
          <Activity className="w-4 h-4 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse-ring" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Live Pulse</h3>
        <span className="text-[10px] font-mono text-primary ml-auto">
          {pulseAlerts.length} ACTIVE
        </span>
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        <AnimatePresence>
          {pulseAlerts.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
