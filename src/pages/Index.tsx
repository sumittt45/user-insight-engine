import { useState } from "react";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { analyzeUserFeedback, AnalysisResult } from "@/lib/analysis-engine";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setResult(null);
    // Simulate processing delay for UX
    await new Promise((r) => setTimeout(r, 1500));
    const analysis = analyzeUserFeedback(text);
    setResult(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">InsightEngine</h1>
              <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                AI-Powered UX Research
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs text-muted-foreground font-mono">v1.0</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            User Behavior <span className="text-gradient-accent">Insight Generator</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Paste raw feedback, surveys, or interview transcripts. Get structured pain points,
            emotional patterns, personas, and actionable recommendations — instantly.
          </p>
        </motion.div>

        <AnalysisInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

        {/* Analyzing state */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-12"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Brain className="h-5 w-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Analyzing feedback patterns…</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Detecting sentiment · Clustering themes · Building personas
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisResults result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          InsightEngine · AI-Powered UX Research Automation
        </div>
      </footer>
    </div>
  );
};

export default Index;
