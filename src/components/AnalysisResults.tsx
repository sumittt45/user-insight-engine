import { AnalysisResult } from "@/lib/analysis-engine";
import { InsightCard } from "./InsightCard";
import { SeverityBadge, SentimentBadge } from "./SeverityBadge";
import { motion } from "framer-motion";
import {
  AlertTriangle, Heart, Brain, Eye, Users, Lightbulb,
  FileText, Quote, TrendingUp, Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from "recharts";

interface Props {
  result: AnalysisResult;
}

const CHART_COLORS = [
  "hsl(0, 72%, 51%)",
  "hsl(38, 92%, 50%)",
  "hsl(200, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

export function AnalysisResults({ result }: Props) {
  const painChartData = result.pain_points.map(p => ({
    name: p.issue.split(" ")[0],
    fullName: p.issue,
    count: parseInt(p.frequency) || 1,
  }));

  const emotionRadarData = result.emotional_patterns.map(e => ({
    emotion: e.emotion,
    intensity: e.intensity === "High" ? 3 : e.intensity === "Medium" ? 2 : 1,
  }));

  const sentimentPieData = [
    { name: "Positive", value: result.emotional_patterns.filter(e => e.sentiment === "positive").length, color: "hsl(160, 60%, 45%)" },
    { name: "Negative", value: result.emotional_patterns.filter(e => e.sentiment === "negative").length, color: "hsl(0, 72%, 51%)" },
    { name: "Neutral", value: result.emotional_patterns.filter(e => e.sentiment === "neutral").length, color: "hsl(220, 10%, 55%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-surface rounded-lg p-6 border-l-4 border-l-accent">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</h3>
              <p className="text-foreground/90 leading-relaxed text-sm">{result.executive_summary}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Pain Points", value: result.pain_points.length, icon: <AlertTriangle className="h-4 w-4" />, color: "text-danger" },
          { label: "Emotions", value: result.emotional_patterns.length, icon: <Heart className="h-4 w-4" />, color: "text-accent" },
          { label: "Biases", value: result.cognitive_biases.length, icon: <Eye className="h-4 w-4" />, color: "text-info" },
          { label: "Actions", value: result.recommendations.length, icon: <Target className="h-4 w-4" />, color: "text-success" },
        ].map((m, i) => (
          <div key={i} className="glass-surface rounded-lg p-4 text-center">
            <div className={`flex justify-center mb-1 ${m.color}`}>{m.icon}</div>
            <div className="text-2xl font-bold font-mono">{m.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {painChartData.length > 0 && (
          <InsightCard title="Pain Point Frequency" icon={<TrendingUp className="h-4 w-4" />} delay={0.15} accentColor="hsl(0, 72%, 51%)">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={painChartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 25%, 9%)", border: "1px solid hsl(220, 20%, 16%)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {painChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </InsightCard>
        )}

        {emotionRadarData.length > 0 && (
          <InsightCard title="Emotion Radar" icon={<Heart className="h-4 w-4" />} delay={0.2} accentColor="hsl(38, 92%, 50%)">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={emotionRadarData}>
                  <PolarGrid stroke="hsl(220, 20%, 20%)" />
                  <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
                  <Radar dataKey="intensity" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </InsightCard>
        )}

        {sentimentPieData.length > 0 && (
          <InsightCard title="Sentiment Split" icon={<Brain className="h-4 w-4" />} delay={0.25} accentColor="hsl(160, 60%, 45%)">
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {sentimentPieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 25%, 9%)", border: "1px solid hsl(220, 20%, 16%)", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col gap-1">
                {sentimentPieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </InsightCard>
        )}
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pain Points */}
        <InsightCard title="Pain Points" icon={<AlertTriangle className="h-4 w-4" />} delay={0.3} accentColor="hsl(0, 72%, 51%)">
          <div className="space-y-3">
            {result.pain_points.map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.issue}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{p.frequency}</span>
                    <SeverityBadge severity={p.severity} />
                  </div>
                </div>
                {p.quotes.map((q, qi) => (
                  <div key={qi} className="flex items-start gap-1.5 text-xs text-muted-foreground pl-2 border-l border-border">
                    <Quote className="h-3 w-3 mt-0.5 shrink-0 text-accent/50" />
                    <span className="italic line-clamp-2">"{q}"</span>
                  </div>
                ))}
                {i < result.pain_points.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Emotional Patterns */}
        <InsightCard title="Emotional Patterns" icon={<Heart className="h-4 w-4" />} delay={0.35} accentColor="hsl(340, 75%, 55%)">
          <div className="space-y-3">
            {result.emotional_patterns.map((e, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{e.emotion}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{e.intensity}</Badge>
                    <SentimentBadge sentiment={e.sentiment} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-2 border-l border-border italic line-clamp-1">
                  "{e.trigger}"
                </p>
                {i < result.emotional_patterns.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Behavioral Themes */}
        <InsightCard title="Behavioral Themes" icon={<Users className="h-4 w-4" />} delay={0.4} accentColor="hsl(200, 70%, 50%)">
          <div className="space-y-3">
            {result.behavioral_themes.map((t, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{t.theme}</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">{t.user_segment}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                {i < result.behavioral_themes.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Cognitive Biases */}
        <InsightCard title="Cognitive Biases Detected" icon={<Eye className="h-4 w-4" />} delay={0.45} accentColor="hsl(280, 65%, 60%)">
          {result.cognitive_biases.length > 0 ? (
            <div className="space-y-3">
              {result.cognitive_biases.map((b, i) => (
                <div key={i}>
                  <span className="text-sm font-medium">{b.bias}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.evidence}</p>
                  <p className="text-xs text-warning mt-0.5">⚠ {b.impact}</p>
                  {i < result.cognitive_biases.length - 1 && <Separator className="mt-2" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No significant cognitive biases detected in this dataset.</p>
          )}
        </InsightCard>
      </div>

      {/* Personas */}
      <InsightCard title="Generated Personas" icon={<Users className="h-4 w-4" />} delay={0.5} accentColor="hsl(38, 92%, 50%)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.personas.map((p, i) => (
            <div key={i} className="bg-surface-sunken rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">{p.name}</h4>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Goals</span>
                <ul className="mt-1 space-y-0.5">
                  {p.goals.map((g, gi) => (
                    <li key={gi} className="text-xs text-foreground/80 flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-success" /> {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Frustrations</span>
                <ul className="mt-1 space-y-0.5">
                  {p.frustrations.map((f, fi) => (
                    <li key={fi} className="text-xs text-foreground/80 flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-danger" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border pt-2">
                <Quote className="h-3 w-3 text-accent/50 mb-1" />
                <p className="text-xs italic text-muted-foreground">"{p.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>

      {/* Recommendations */}
      <InsightCard title="Recommendations" icon={<Lightbulb className="h-4 w-4" />} delay={0.55} accentColor="hsl(160, 60%, 45%)">
        <div className="space-y-3">
          {result.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-surface-sunken text-xs font-mono font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{r.action}</span>
                  <SeverityBadge severity={r.priority} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px] font-mono">{r.category}</Badge>
                  <span>{r.expected_impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>
    </div>
  );
}
