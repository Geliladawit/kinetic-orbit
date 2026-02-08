import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { KnowledgeProvider } from "@/contexts/KnowledgeContext";
import Index from "./pages/Index";
import TruthLedger from "./pages/TruthLedger";
import InboxUpload from "./pages/InboxUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KnowledgeProvider>
          <div className="min-h-screen bg-background relative">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <AppHeader />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/truth-ledger" element={<TruthLedger />} />
                <Route path="/inbox" element={<InboxUpload />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </KnowledgeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
