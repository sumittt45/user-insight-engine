export interface AnalysisResult {
  pain_points: { issue: string; frequency: string; severity: "high" | "medium" | "low"; quotes: string[] }[];
  emotional_patterns: { emotion: string; intensity: string; trigger: string; sentiment: "positive" | "negative" | "neutral" }[];
  behavioral_themes: { theme: string; description: string; user_segment: string }[];
  cognitive_biases: { bias: string; evidence: string; impact: string }[];
  personas: { name: string; role: string; goals: string[]; frustrations: string[]; quote: string }[];
  recommendations: { priority: "high" | "medium" | "low"; category: string; action: string; expected_impact: string }[];
  executive_summary: string;
}

function extractSentences(text: string): string[] {
  return text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 10);
}

const PAIN_KEYWORDS = [
  { keywords: ["slow", "loading", "wait", "lag", "performance"], issue: "Performance & Speed Issues" },
  { keywords: ["confus", "unclear", "hard to find", "lost", "where"], issue: "Navigation & Discoverability" },
  { keywords: ["bug", "crash", "error", "broken", "doesn't work", "fail"], issue: "Reliability & Bugs" },
  { keywords: ["price", "expensive", "cost", "pay", "subscription"], issue: "Pricing Concerns" },
  { keywords: ["support", "help", "response", "contact", "ticket"], issue: "Customer Support Quality" },
  { keywords: ["design", "ugly", "outdated", "look", "ui", "interface"], issue: "UI/UX Design Quality" },
  { keywords: ["feature", "missing", "need", "wish", "want", "should"], issue: "Missing Features" },
  { keywords: ["mobile", "phone", "app", "responsive"], issue: "Mobile Experience" },
];

const EMOTION_KEYWORDS = [
  { keywords: ["frustrat", "annoyed", "angry", "hate", "terrible"], emotion: "Frustration", sentiment: "negative" as const },
  { keywords: ["confus", "unclear", "don't understand", "complicated"], emotion: "Confusion", sentiment: "negative" as const },
  { keywords: ["love", "great", "amazing", "awesome", "best"], emotion: "Delight", sentiment: "positive" as const },
  { keywords: ["trust", "reliable", "secure", "safe", "depend"], emotion: "Trust", sentiment: "positive" as const },
  { keywords: ["disappoint", "expected", "letdown", "underwhelm"], emotion: "Disappointment", sentiment: "negative" as const },
  { keywords: ["easy", "simple", "intuitive", "smooth"], emotion: "Satisfaction", sentiment: "positive" as const },
];

const BIAS_PATTERNS = [
  { keywords: ["always", "never", "every time", "constantly"], bias: "Frequency Illusion", impact: "Users may overstate issue frequency" },
  { keywords: ["used to", "before", "old version", "previous"], bias: "Status Quo Bias", impact: "Resistance to change may skew feedback" },
  { keywords: ["everyone", "nobody", "all users", "we all"], bias: "False Consensus Effect", impact: "Individual opinions projected as group sentiment" },
  { keywords: ["first time", "initial", "when i started"], bias: "Primacy Effect", impact: "First impressions disproportionately shape perception" },
  { keywords: ["just now", "recently", "last time", "today"], bias: "Recency Bias", impact: "Recent experiences weighted more heavily" },
];

export function analyzeUserFeedback(rawText: string): AnalysisResult {
  const sentences = extractSentences(rawText);
  const lowerText = rawText.toLowerCase();

  // Pain points
  const pain_points = PAIN_KEYWORDS
    .map(p => {
      const matchingSentences = sentences.filter(s =>
        p.keywords.some(k => s.toLowerCase().includes(k))
      );
      if (matchingSentences.length === 0) return null;
      return {
        issue: p.issue,
        frequency: `${matchingSentences.length} mention${matchingSentences.length > 1 ? "s" : ""}`,
        severity: (matchingSentences.length >= 3 ? "high" : matchingSentences.length >= 2 ? "medium" : "low") as "high" | "medium" | "low",
        quotes: matchingSentences.slice(0, 2),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.severity === "high" ? 1 : 0) - (a!.severity === "high" ? 1 : 0)) as AnalysisResult["pain_points"];

  // Emotional patterns
  const emotional_patterns = EMOTION_KEYWORDS
    .map(e => {
      const matches = sentences.filter(s => e.keywords.some(k => s.toLowerCase().includes(k)));
      if (matches.length === 0) return null;
      return {
        emotion: e.emotion,
        intensity: matches.length >= 3 ? "High" : matches.length >= 2 ? "Medium" : "Low",
        trigger: matches[0] || "",
        sentiment: e.sentiment,
      };
    })
    .filter(Boolean) as AnalysisResult["emotional_patterns"];

  // Behavioral themes
  const behavioral_themes: AnalysisResult["behavioral_themes"] = [];
  if (lowerText.includes("power user") || lowerText.includes("advanced") || lowerText.includes("shortcut"))
    behavioral_themes.push({ theme: "Power User Optimization", description: "Users seek efficiency and advanced workflows", user_segment: "Advanced Users" });
  if (lowerText.includes("first time") || lowerText.includes("new") || lowerText.includes("beginner") || lowerText.includes("onboard"))
    behavioral_themes.push({ theme: "Onboarding Friction", description: "New users struggle with initial setup and learning curve", user_segment: "New Users" });
  if (lowerText.includes("team") || lowerText.includes("collaborat") || lowerText.includes("share") || lowerText.includes("together"))
    behavioral_themes.push({ theme: "Collaboration Needs", description: "Users want better team workflows and sharing capabilities", user_segment: "Team Users" });
  if (lowerText.includes("custom") || lowerText.includes("configur") || lowerText.includes("personali") || lowerText.includes("setting"))
    behavioral_themes.push({ theme: "Customization Desire", description: "Users want more control over their experience", user_segment: "All Users" });

  if (behavioral_themes.length === 0) {
    behavioral_themes.push(
      { theme: "Efficiency Seeking", description: "Users prioritize speed and streamlined workflows", user_segment: "All Users" },
      { theme: "Feature Exploration", description: "Users actively discover and request new capabilities", user_segment: "Engaged Users" }
    );
  }

  // Cognitive biases
  const cognitive_biases = BIAS_PATTERNS
    .map(b => {
      const found = sentences.some(s => b.keywords.some(k => s.toLowerCase().includes(k)));
      if (!found) return null;
      return { bias: b.bias, evidence: `Keywords detected: ${b.keywords.filter(k => lowerText.includes(k)).join(", ")}`, impact: b.impact };
    })
    .filter(Boolean) as AnalysisResult["cognitive_biases"];

  // Personas
  const negativeCount = emotional_patterns.filter(e => e.sentiment === "negative").length;
  const positiveCount = emotional_patterns.filter(e => e.sentiment === "positive").length;

  const personas: AnalysisResult["personas"] = [
    {
      name: "Alex the Advocate",
      role: positiveCount > negativeCount ? "Enthusiastic power user" : "Frustrated loyalist",
      goals: ["Get work done efficiently", "Help improve the product", "Share with team"],
      frustrations: pain_points.slice(0, 2).map(p => p.issue),
      quote: sentences[0] || "I use this daily but there's room to grow.",
    },
    {
      name: "Jordan the Explorer",
      role: "Curious newcomer evaluating options",
      goals: ["Understand the product quickly", "Compare with alternatives", "Find value fast"],
      frustrations: ["Steep learning curve", ...pain_points.slice(0, 1).map(p => p.issue)],
      quote: sentences[Math.floor(sentences.length / 2)] || "I just want it to be straightforward.",
    },
  ];

  // Recommendations
  const recommendations: AnalysisResult["recommendations"] = pain_points.slice(0, 3).map((p, i) => ({
    priority: (i === 0 ? "high" : i === 1 ? "medium" : "low") as "high" | "medium" | "low",
    category: p.issue,
    action: `Address ${p.issue.toLowerCase()} based on ${p.frequency} of user feedback`,
    expected_impact: p.severity === "high" ? "Significant improvement in user satisfaction" : "Moderate positive impact on user experience",
  }));

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "medium",
      category: "General UX",
      action: "Conduct deeper user interviews to uncover specific pain points",
      expected_impact: "Better understanding of user needs for targeted improvements",
    });
  }

  const executive_summary = `Analysis of user feedback reveals ${pain_points.length} key pain point${pain_points.length !== 1 ? "s" : ""} and ${emotional_patterns.length} distinct emotional pattern${emotional_patterns.length !== 1 ? "s" : ""}. ${
    negativeCount > positiveCount
      ? "Overall sentiment skews negative, suggesting urgent attention to core issues."
      : positiveCount > negativeCount
        ? "Overall sentiment is positive, with targeted areas for improvement."
        : "Sentiment is mixed, indicating both strengths and areas needing attention."
  } ${pain_points.length > 0 ? `The most critical issue is "${pain_points[0].issue}" with ${pain_points[0].frequency}.` : ""} ${cognitive_biases.length > 0 ? `${cognitive_biases.length} cognitive bias${cognitive_biases.length > 1 ? "es were" : " was"} detected, which should be considered when interpreting results.` : ""} Two user personas were identified to guide product strategy.`;

  return { pain_points, emotional_patterns, behavioral_themes, cognitive_biases, personas, recommendations, executive_summary };
}
