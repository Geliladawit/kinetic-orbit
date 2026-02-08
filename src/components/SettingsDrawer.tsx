import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Key, Check, X, Eye, EyeOff } from "lucide-react";
import { useKnowledge } from "@/contexts/KnowledgeContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SettingsDrawer() {
  const { apiKey, setApiKey } = useKnowledge();
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(localKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isValid = localKey.trim().startsWith("sk-");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
          {!apiKey && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="glass-panel border-l border-border/50 w-[380px]">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            KINETIC Settings
          </SheetTitle>
          <SheetDescription>
            Configure your AI brain connection
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Key className="w-3.5 h-3.5 text-primary" />
              OpenAI API Key
            </label>
            <p className="text-xs text-muted-foreground">
              Used for GPT-4o extraction. Stored in your browser only.
            </p>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {localKey && !isValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="w-3 h-3" /> Key should start with "sk-"
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={!localKey.trim()}
              className="w-full flex items-center justify-center gap-2 glass-card rounded-lg px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-primary/20"
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div
                    key="saved"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success">Saved</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Save API Key
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Status */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">Connection Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  apiKey ? "bg-success animate-pulse" : "bg-destructive"
                }`}
              />
              <span className="text-xs text-muted-foreground font-mono">
                {apiKey ? "BRAIN ONLINE — GPT-4o" : "BRAIN OFFLINE — No API Key"}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p>🔒 Your API key is stored in localStorage only.</p>
            <p>🧠 The Extractor uses GPT-4o to parse transcripts.</p>
            <p>⚖️ The Auditor checks for truth conflicts automatically.</p>
            <p>📡 The Dispatcher calculates blast radius for changes.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
