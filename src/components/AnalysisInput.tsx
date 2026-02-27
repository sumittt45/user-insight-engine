import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, FileText, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_FEEDBACK = `The app is really slow when loading dashboards. I've been waiting 10+ seconds every time.

I love the new reporting feature, it's amazing and saves me hours of work each week.

The navigation is confusing - I can never find where the settings are. It's frustrating.

Price is too expensive compared to alternatives. The subscription model doesn't work for small teams.

Customer support never responds to my tickets. I've been waiting 3 days for a simple question.

The mobile app crashes constantly. Every time I try to upload something, it breaks.

I wish there was a way to collaborate with my team in real-time. We need better sharing features.

As a power user, I need keyboard shortcuts and advanced filtering options.

The UI looks outdated compared to competitors. It needs a modern redesign.

I'm a new user and the onboarding process was terrible. No tutorial, no guidance, just thrown in.

The export feature is missing PDF support. Everyone needs this, it's basic functionality.

I used to love the old version, the new update ruined my workflow completely.

Every time I contact support, they give me generic responses. It's always the same useless reply.

The product is reliable and I trust it with our company data. Security features are great.

Just today the system went down during a critical presentation. This is unacceptable.

The first time I used it, I was completely lost. The initial experience sets a bad tone.

I've been personalizing my dashboard settings but they keep resetting. Very annoying.

The collaboration tools are basic. We need real-time editing like Google Docs.`;

interface AnalysisInputProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export function AnalysisInput({ onAnalyze, isAnalyzing }: AnalysisInputProps) {
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleLoadSample = () => {
    setText(SAMPLE_FEEDBACK);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch {
      // Clipboard access denied
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
        className={`glass-surface transition-all duration-300 ${dragOver ? "ring-2 ring-accent" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Input Feed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handlePaste} className="text-xs gap-1.5">
                <Clipboard className="h-3 w-3" /> Paste
              </Button>
              <label>
                <input type="file" accept=".txt,.csv,.json" className="hidden" onChange={handleFileUpload} />
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5 cursor-pointer">
                  <span><Upload className="h-3 w-3" /> Upload</span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs gap-1.5">
                <FileText className="h-3 w-3" /> Sample Data
              </Button>
            </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste survey responses, interview transcripts, or user feedback here…"
            className="min-h-[200px] bg-surface-sunken border-border/50 font-mono text-sm resize-y placeholder:text-muted-foreground/50"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              {wordCount} words · {text.split(/[.!?\n]+/).filter(s => s.trim().length > 10).length} sentences detected
            </span>
            <Button
              onClick={() => onAnalyze(text)}
              disabled={wordCount < 5 || isAnalyzing}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Analyzing…
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze Feedback
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
