import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Users, X, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { simulateDecision, type ShadowSimulationResult } from "@/services/shadowBoard";
import { graphNodes as mockNodes, graphLinks as mockLinks } from "@/data/mockData";
import type { GraphNode, GraphLink } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

interface ShadowBoardModalProps {
  onSimulationResult: (brokenIds: string[], orphanedIds: string[]) => void;
  onClear: () => void;
}

const RISK_CONFIG = {
  low: { color: "text-muted-foreground", bg: "bg-muted", label: "LOW RISK" },
  medium: { color: "text-amber-700", bg: "bg-amber-50", label: "MEDIUM RISK" },
  high: { color: "text-orange-700", bg: "bg-orange-50", label: "HIGH RISK" },
  critical: { color: "text-destructive", bg: "bg-red-50", label: "CRITICAL RISK" },
};

export function ShadowBoardModal({ onSimulationResult, onClear }: ShadowBoardModalProps) {
  const [open, setOpen] = useState(false);
  const [hypothesis, setHypothesis] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ShadowSimulationResult | null>(null);

  const handleSimulate = async () => {
    if (!hypothesis.trim()) return;

    setIsSimulating(true);
    setResult(null);

    try {
      // Use mock data for now since we removed useKnowledge
      // In a real implementation, you'd get this from the knowledge context
      const allNodes = mockNodes;
      const allLinks = mockLinks;

      const simResult = await simulateDecision(hypothesis, allNodes, allLinks);
      setResult(simResult);

      // Highlight affected nodes on the graph
      onSimulationResult(simResult.brokenNodeIds, simResult.orphanedNodeIds);

      toast({
        title: "🔮 Shadow Board Complete",
        description: `${simResult.brokenNodeIds.length + simResult.orphanedNodeIds.length} nodes affected. ${simResult.deconflictionMemo.riskLevel.toUpperCase()} risk.`,
      });
    } catch (error: any) {
      console.error("Shadow simulation failed:", error);
      toast({
        title: "Simulation Failed",
        description: error.message || "Could not run simulation. Please check the server connection.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Don't clear result so graph stays highlighted
    }
  };

  const handleReset = () => {
    setResult(null);
    setHypothesis("");
    onClear();
  };

  const riskConfig = result ? RISK_CONFIG[result.deconflictionMemo.riskLevel] : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 font-mono text-xs tracking-wider"
        >
          <Zap className="w-3.5 h-3.5" />
          SIMULATE DECISION
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] bg-background border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide">THE SHADOW BOARD</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                Simulate decisions before they go live
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Hypothetical Decision
            </label>
            <Textarea
              placeholder='e.g. "We are cancelling the API integration" or "Moving launch date to September"'
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="min-h-[80px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground resize-none font-mono text-sm"
              disabled={isSimulating}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSimulate}
              disabled={!hypothesis.trim() || isSimulating}
              className="gap-2 flex-1 font-mono text-xs tracking-wider"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  TRAVERSING GRAPH...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  RUN SIMULATION
                </>
              )}
            </Button>
            {result && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="font-mono text-xs tracking-wider"
              >
                RESET
              </Button>
            )}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Risk Level Banner */}
                {riskConfig && (
                  <div className={`rounded-lg px-4 py-3 border border-border ${riskConfig.bg}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${riskConfig.color}`} />
                      <span className={`text-xs font-mono font-bold tracking-wider ${riskConfig.color}`}>
                        {riskConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-2 leading-relaxed">
                      {result.deconflictionMemo.summary}
                    </p>
                  </div>
                )}

                {/* Affected Nodes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Impact Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span className="text-xs font-mono text-muted-foreground">BROKEN</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{result.brokenNodeIds.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">nodes invalidated</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-mono text-muted-foreground">ORPHANED</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{result.orphanedNodeIds.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">nodes isolated</p>
                    </div>
                  </div>
                </div>

                {/* Deconfliction Memo */}
                {result.deconflictionMemo.stakeholders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Deconfliction Memo — Who to Talk To
                    </h4>
                    <div className="space-y-2">
                      {result.deconflictionMemo.stakeholders.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-lg border border-border bg-muted/20 p-3 flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-foreground">
                              {s.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {s.reason}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
