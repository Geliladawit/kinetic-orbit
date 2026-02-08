import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Mail, Zap, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const InboxUpload = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [textContent, setTextContent] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleSubmit = () => {
    if (textContent.trim() || uploaded) {
      // Simulate injection animation
      setUploaded(true);
      setTimeout(() => {
        setUploaded(false);
        setTextContent("");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-card mb-4"
            >
              <Sparkles className="w-7 h-7 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground">Inject Knowledge</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Upload meeting transcripts or paste emails to feed the knowledge graph
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass-card rounded-xl mb-6 w-fit mx-auto">
            {[
              { id: "upload" as const, label: "Upload File", icon: FileText },
              { id: "paste" as const, label: "Paste Content", icon: Mail },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="upload-tab"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass-panel rounded-2xl p-8 text-center border-2 border-dashed transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  setUploaded(true);
                  setTimeout(() => setUploaded(false), 3000);
                }}
              >
                <AnimatePresence mode="wait">
                  {uploaded ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="py-4"
                    >
                      <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                      <p className="text-sm font-semibold text-success">Injected into The Orbit</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Processing knowledge nodes...
                      </p>
                      <div className="flex justify-center mt-3">
                        <div className="h-1 w-32 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Upload
                        className={`w-10 h-10 mx-auto mb-4 ${
                          dragOver ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-sm font-medium text-foreground">
                        Drop meeting transcript here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports .txt, .md, .pdf, .docx
                      </p>
                      <button className="mt-4 glass-card rounded-lg px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                        Browse Files
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel rounded-2xl p-6"
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste email thread, meeting notes, or any organizational communication here..."
                  className="w-full h-48 bg-transparent border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 font-mono"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {textContent.length} characters · ~{Math.ceil(textContent.split(/\s+/).filter(Boolean).length / 100)} knowledge nodes
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={!textContent.trim()}
                    className="flex items-center gap-2 glass-card rounded-lg px-5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-primary/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Inject into Orbit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default InboxUpload;
