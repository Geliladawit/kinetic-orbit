import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Check, Server, ServerOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SettingsDrawer() {
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [saved, setSaved] = useState(false);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
          {serverStatus === 'offline' && (
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

          {/* Server Status */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-foreground">Server Connection</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    serverStatus === 'online' 
                      ? "bg-success animate-pulse" 
                      : serverStatus === 'checking'
                      ? "bg-warning animate-pulse"
                      : "bg-destructive"
                  }`}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {serverStatus === 'online' 
                    ? "BRAIN ONLINE — GPT-4o" 
                    : serverStatus === 'checking'
                    ? "CHECKING CONNECTION"
                    : "BRAIN OFFLINE — Server Down"
                  }
                </span>
              </div>
              <button
                onClick={checkServerStatus}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Refresh
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Server: http://localhost:3001
            </p>
          </div>

          {/* Info */}
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p>🔒 API key is securely stored on the backend server.</p>
            <p>🧠 The Extractor uses GPT-4o to parse transcripts.</p>
            <p>⚖️ The Auditor checks for truth conflicts automatically.</p>
            <p>📡 The Dispatcher calculates blast radius for changes.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
