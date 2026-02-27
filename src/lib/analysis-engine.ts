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

// Semantic similarity: normalize words to root forms and check overlap
function normalizeToken(word: string): string {
  return word
    .replace(/ing$/, "")
    .replace(/tion$/, "")
    .replace(/ment$/, "")
    .replace(/ness$/, "")
    .replace(/able$/, "")
    .replace(/ful$/, "")
    .replace(/less$/, "")
    .replace(/ous$/, "")
    .replace(/ive$/, "")
    .replace(/ly$/, "")
    .replace(/ed$/, "")
    .replace(/er$/, "")
    .replace(/es$/, "")
    .replace(/s$/, "");
}

function getTokens(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2);
}

function semanticSimilarity(a: string, b: string): number {
  const tokensA = new Set(getTokens(a).map(normalizeToken));
  const tokensB = new Set(getTokens(b).map(normalizeToken));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  tokensA.forEach(t => { if (tokensB.has(t)) overlap++; });
  return overlap / Math.min(tokensA.size, tokensB.size);
}

function clusterSentences(sentences: string[], threshold = 0.35): string[][] {
  const clusters: string[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < sentences.length; i++) {
    if (assigned.has(i)) continue;
    const cluster = [sentences[i]];
    assigned.add(i);
    for (let j = i + 1; j < sentences.length; j++) {
      if (assigned.has(j)) continue;
      if (semanticSimilarity(sentences[i], sentences[j]) >= threshold) {
        cluster.push(sentences[j]);
        assigned.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

// Infer implicit sentiment signals from sentence structure
function inferSentiment(sentence: string): "positive" | "negative" | "neutral" {
  const lower = sentence.toLowerCase();
  const negativeSignals = ["but", "however", "although", "unfortunately", "wish", "if only", "struggle", "hard", "difficult", "problem", "issue", "can't", "cannot", "won't", "shouldn't", "bad", "worse", "worst", "lack", "poor", "no way", "not good", "not great", "could be better", "needs work", "too much", "too many", "not enough"];
  const positiveSignals = ["thank", "appreciate", "glad", "happy", "enjoy", "pleased", "excellent", "wonderful", "fantastic", "good job", "well done", "perfect", "works well", "impressed", "helpful", "nice", "solid", "clean", "fast", "quick"];

  const negScore = negativeSignals.filter(s => lower.includes(s)).length;
  const posScore = positiveSignals.filter(s => lower.includes(s)).length;

  if (negScore > posScore) return "negative";
  if (posScore > negScore) return "positive";
  return "neutral";
}

const PAIN_KEYWORDS = [
  { keywords: ["slow", "loading", "wait", "lag", "performance", "takes forever", "too long", "speed"], issue: "Performance & Speed Issues" },
  { keywords: ["confus", "unclear", "hard to find", "lost", "where", "navigate", "find", "hidden", "buried"], issue: "Navigation & Discoverability" },
  { keywords: ["bug", "crash", "error", "broken", "doesn't work", "fail", "glitch", "freeze", "stuck", "hang"], issue: "Reliability & Bugs" },
  { keywords: ["price", "expensive", "cost", "pay", "subscription", "billing", "charge", "fee", "worth"], issue: "Pricing Concerns" },
  { keywords: ["support", "help", "response", "contact", "ticket", "resolve", "agent", "wait time", "reply"], issue: "Customer Support Quality" },
  { keywords: ["design", "ugly", "outdated", "look", "ui", "interface", "layout", "visual", "aesthetic", "cluttered"], issue: "UI/UX Design Quality" },
  { keywords: ["feature", "missing", "need", "wish", "want", "should", "add", "include", "implement", "request"], issue: "Missing Features" },
  { keywords: ["mobile", "phone", "app", "responsive", "tablet", "small screen", "touch"], issue: "Mobile Experience" },
  { keywords: ["security", "privacy", "data", "breach", "hack", "protect", "encrypt", "password"], issue: "Security & Privacy Concerns" },
  { keywords: ["document", "docs", "tutorial", "guide", "learn", "how to", "instruction", "manual"], issue: "Documentation & Learning Resources" },
  { keywords: ["integrat", "connect", "api", "plugin", "extension", "third-party", "sync", "import", "export"], issue: "Integration & Compatibility" },
];

const EMOTION_KEYWORDS = [
  { keywords: ["frustrat", "annoyed", "angry", "hate", "terrible", "fed up", "sick of", "ridiculous"], emotion: "Frustration", sentiment: "negative" as const },
  { keywords: ["confus", "unclear", "don't understand", "complicated", "complex", "overwhelming", "lost"], emotion: "Confusion", sentiment: "negative" as const },
  { keywords: ["love", "great", "amazing", "awesome", "best", "fantastic", "wonderful", "excellent"], emotion: "Delight", sentiment: "positive" as const },
  { keywords: ["trust", "reliable", "secure", "safe", "depend", "confident", "consistent"], emotion: "Trust", sentiment: "positive" as const },
  { keywords: ["disappoint", "expected", "letdown", "underwhelm", "let down", "fell short"], emotion: "Disappointment", sentiment: "negative" as const },
  { keywords: ["easy", "simple", "intuitive", "smooth", "seamless", "effortless", "straightforward"], emotion: "Satisfaction", sentiment: "positive" as const },
  { keywords: ["anxious", "worried", "concern", "nervous", "afraid", "scary", "uncertain"], emotion: "Anxiety", sentiment: "negative" as const },
  { keywords: ["excit", "eager", "look forward", "can't wait", "thrilled", "pumped"], emotion: "Excitement", sentiment: "positive" as const },
];

const BIAS_PATTERNS = [
  { keywords: ["always", "never", "every time", "constantly", "without fail"], bias: "Frequency Illusion", impact: "Users may overstate issue frequency" },
  { keywords: ["used to", "before", "old version", "previous", "back when", "the way it was"], bias: "Status Quo Bias", impact: "Resistance to change may skew feedback" },
  { keywords: ["everyone", "nobody", "all users", "we all", "most people", "no one"], bias: "False Consensus Effect", impact: "Individual opinions projected as group sentiment" },
  { keywords: ["first time", "initial", "when i started", "first impression", "right away"], bias: "Primacy Effect", impact: "First impressions disproportionately shape perception" },
  { keywords: ["just now", "recently", "last time", "today", "this week", "latest"], bias: "Recency Bias", impact: "Recent experiences weighted more heavily" },
  { keywords: ["compared to", "unlike", "better than", "worse than", "competitor", "alternative"], bias: "Anchoring Bias", impact: "Comparisons to competitors anchor expectations" },
];

// Implicit behavioral theme inference from sentence patterns
const IMPLICIT_THEME_PATTERNS = [
  { patterns: [/\b(quick|fast|hurry|rush|time|efficient|productive)\b/i], theme: "Efficiency Seeking", description: "Users prioritize speed and streamlined workflows", user_segment: "Productivity-Focused Users" },
  { patterns: [/\b(try|test|experiment|explore|discover|check out|play with)\b/i], theme: "Feature Exploration", description: "Users actively discover and evaluate capabilities", user_segment: "Exploratory Users" },
  { patterns: [/\b(reliable|stable|consistent|depend|count on|trust)\b/i], theme: "Reliability Dependence", description: "Users need predictable, stable experiences", user_segment: "Mission-Critical Users" },
  { patterns: [/\b(automat|workflow|repeat|batch|routine|template|preset)\b/i], theme: "Automation Desire", description: "Users seek to reduce repetitive manual work", user_segment: "Power Users" },
  { patterns: [/\b(compare|switch|migrate|alternative|option|choice)\b/i], theme: "Evaluation Mindset", description: "Users actively compare against alternatives", user_segment: "Evaluating Users" },
  { patterns: [/\b(learn|understand|figure out|how do|how to|tutorial|guide)\b/i], theme: "Learning Orientation", description: "Users invest in understanding the product deeply", user_segment: "Self-Directed Learners" },
  { patterns: [/\b(daily|every day|morning|routine|regular|habit|always use)\b/i], theme: "Habitual Usage", description: "Product is embedded in daily workflows", user_segment: "Daily Active Users" },
  { patterns: [/\b(suggest|recommend|feedback|idea|opinion|vote|survey)\b/i], theme: "Co-Creation Drive", description: "Users want to influence product direction", user_segment: "Engaged Advocates" },
];

export function analyzeUserFeedback(rawText: string): AnalysisResult {
  const sentences = extractSentences(rawText);
  const lowerText = rawText.toLowerCase();
  const clusters = clusterSentences(sentences);

  // Pain points — enhanced with semantic clustering
  const pain_points = PAIN_KEYWORDS
    .map(p => {
      const matchingSentences = sentences.filter(s =>
        p.keywords.some(k => s.toLowerCase().includes(k))
      );
      // Also count clustered sentences that share themes with matched ones
      const clusterBoost = matchingSentences.length > 0
        ? clusters.filter(c => c.some(s => matchingSentences.includes(s))).reduce((sum, c) => sum + c.length, 0) - matchingSentences.length
        : 0;
      const totalMentions = matchingSentences.length + Math.floor(clusterBoost * 0.5);
      if (totalMentions === 0) return null;
      return {
        issue: p.issue,
        frequency: `${totalMentions} mention${totalMentions > 1 ? "s" : ""}`,
        severity: (totalMentions >= 3 ? "high" : totalMentions >= 2 ? "medium" : "low") as "high" | "medium" | "low",
        quotes: matchingSentences.slice(0, 3),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const sevOrder = { high: 3, medium: 2, low: 1 };
      return sevOrder[b!.severity] - sevOrder[a!.severity];
    }) as AnalysisResult["pain_points"];

  // If no explicit pain points, infer from negative-sentiment sentences
  if (pain_points.length === 0) {
    const negativeSentences = sentences.filter(s => inferSentiment(s) === "negative");
    if (negativeSentences.length > 0) {
      const inferredClusters = clusterSentences(negativeSentences, 0.25);
      inferredClusters.slice(0, 3).forEach((cluster, i) => {
        const label = cluster[0].length > 60 ? cluster[0].substring(0, 57) + "..." : cluster[0];
        pain_points.push({
          issue: `Inferred Issue: "${label}"`,
          frequency: `${cluster.length} mention${cluster.length > 1 ? "s" : ""}`,
          severity: (cluster.length >= 3 ? "high" : cluster.length >= 2 ? "medium" : "low") as "high" | "medium" | "low",
          quotes: cluster.slice(0, 2),
        });
      });
    }
  }

  // Emotional patterns — enhanced with implicit inference
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

  // If no explicit emotions, infer from sentiment analysis
  if (emotional_patterns.length === 0) {
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    const sentimentExamples: Record<string, string> = {};
    sentences.forEach(s => {
      const sent = inferSentiment(s);
      sentimentCounts[sent]++;
      if (!sentimentExamples[sent]) sentimentExamples[sent] = s;
    });

    if (sentimentCounts.negative > 0) {
      emotional_patterns.push({
        emotion: "Implicit Dissatisfaction",
        intensity: sentimentCounts.negative >= 3 ? "High" : sentimentCounts.negative >= 2 ? "Medium" : "Low",
        trigger: sentimentExamples.negative || "",
        sentiment: "negative",
      });
    }
    if (sentimentCounts.positive > 0) {
      emotional_patterns.push({
        emotion: "Implicit Approval",
        intensity: sentimentCounts.positive >= 3 ? "High" : sentimentCounts.positive >= 2 ? "Medium" : "Low",
        trigger: sentimentExamples.positive || "",
        sentiment: "positive",
      });
    }
    if (sentimentCounts.neutral > 0 && sentimentCounts.positive === 0 && sentimentCounts.negative === 0) {
      emotional_patterns.push({
        emotion: "Neutral Engagement",
        intensity: "Low",
        trigger: sentimentExamples.neutral || "",
        sentiment: "neutral",
      });
    }
  }

  // Behavioral themes — explicit + implicit inference
  const behavioral_themes: AnalysisResult["behavioral_themes"] = [];

  // Explicit keyword checks
  if (lowerText.includes("power user") || lowerText.includes("advanced") || lowerText.includes("shortcut"))
    behavioral_themes.push({ theme: "Power User Optimization", description: "Users seek efficiency and advanced workflows", user_segment: "Advanced Users" });
  if (lowerText.includes("first time") || lowerText.includes("new") || lowerText.includes("beginner") || lowerText.includes("onboard"))
    behavioral_themes.push({ theme: "Onboarding Friction", description: "New users struggle with initial setup and learning curve", user_segment: "New Users" });
  if (lowerText.includes("team") || lowerText.includes("collaborat") || lowerText.includes("share") || lowerText.includes("together"))
    behavioral_themes.push({ theme: "Collaboration Needs", description: "Users want better team workflows and sharing capabilities", user_segment: "Team Users" });
  if (lowerText.includes("custom") || lowerText.includes("configur") || lowerText.includes("personali") || lowerText.includes("setting"))
    behavioral_themes.push({ theme: "Customization Desire", description: "Users want more control over their experience", user_segment: "All Users" });

  // Implicit behavioral pattern detection via regex
  const existingThemes = new Set(behavioral_themes.map(t => t.theme));
  IMPLICIT_THEME_PATTERNS.forEach(p => {
    if (existingThemes.has(p.theme)) return;
    const matchCount = sentences.filter(s => p.patterns.some(rx => rx.test(s))).length;
    if (matchCount > 0) {
      behavioral_themes.push({ theme: p.theme, description: p.description, user_segment: p.user_segment });
    }
  });

  // Ensure at least 2 themes via cluster-based inference
  if (behavioral_themes.length < 2) {
    const topClusters = clusters
      .filter(c => c.length >= 2)
      .sort((a, b) => b.length - a.length)
      .slice(0, 2 - behavioral_themes.length);

    topClusters.forEach((cluster, i) => {
      const summary = cluster[0].length > 50 ? cluster[0].substring(0, 47) + "..." : cluster[0];
      behavioral_themes.push({
        theme: `Recurring Theme: "${summary}"`,
        description: `${cluster.length} semantically similar statements clustered around this topic`,
        user_segment: "Detected Segment",
      });
    });

    // Final fallback
    while (behavioral_themes.length < 2) {
      const fallbacks = [
        { theme: "Efficiency Seeking", description: "Users prioritize speed and streamlined workflows", user_segment: "All Users" },
        { theme: "Feature Exploration", description: "Users actively discover and request new capabilities", user_segment: "Engaged Users" },
      ];
      const fb = fallbacks.find(f => !existingThemes.has(f.theme));
      if (fb) {
        behavioral_themes.push(fb);
        existingThemes.add(fb.theme);
      } else break;
    }
  }

  // Cognitive biases — enhanced with implicit detection
  const cognitive_biases = BIAS_PATTERNS
    .map(b => {
      const matchedKeywords = b.keywords.filter(k => lowerText.includes(k));
      if (matchedKeywords.length === 0) return null;
      return { bias: b.bias, evidence: `Keywords detected: ${matchedKeywords.join(", ")}`, impact: b.impact };
    })
    .filter(Boolean) as AnalysisResult["cognitive_biases"];

  // Infer biases from patterns if none found
  if (cognitive_biases.length === 0) {
    // Check for extreme/absolute language as implicit bias signal
    const absoluteStatements = sentences.filter(s => /\b(always|never|every|all|none|impossible|definitely|absolutely|completely)\b/i.test(s));
    if (absoluteStatements.length > 0) {
      cognitive_biases.push({
        bias: "Absolutist Thinking",
        evidence: `${absoluteStatements.length} statement${absoluteStatements.length > 1 ? "s" : ""} using absolute language detected`,
        impact: "Extreme language may indicate emotionally-driven rather than balanced feedback",
      });
    }
    // Check for comparison-based reasoning
    const comparisonStatements = sentences.filter(s => /\b(better|worse|more|less|than|compared|versus|vs)\b/i.test(s));
    if (comparisonStatements.length > 0) {
      cognitive_biases.push({
        bias: "Comparative Framing",
        evidence: `${comparisonStatements.length} comparative statement${comparisonStatements.length > 1 ? "s" : ""} found`,
        impact: "Users evaluate features relative to past experience or competitors rather than absolute quality",
      });
    }
  }

  // Personas — enriched with actual data
  const negativeCount = emotional_patterns.filter(e => e.sentiment === "negative").length;
  const positiveCount = emotional_patterns.filter(e => e.sentiment === "positive").length;

  const topFrustrations = pain_points.length > 0
    ? pain_points.slice(0, 2).map(p => p.issue)
    : ["Unmet expectations", "Workflow friction"];

  const personas: AnalysisResult["personas"] = [
    {
      name: "Alex the Advocate",
      role: positiveCount > negativeCount ? "Enthusiastic power user" : "Frustrated loyalist",
      goals: ["Get work done efficiently", "Help improve the product", "Share with team"],
      frustrations: topFrustrations,
      quote: sentences[0] || "I use this daily but there's room to grow.",
    },
    {
      name: "Jordan the Explorer",
      role: "Curious newcomer evaluating options",
      goals: ["Understand the product quickly", "Compare with alternatives", "Find value fast"],
      frustrations: ["Steep learning curve", ...(pain_points.length > 0 ? [pain_points[0].issue] : ["Unclear value proposition"])],
      quote: sentences[Math.floor(sentences.length / 2)] || "I just want it to be straightforward.",
    },
  ];

  // Recommendations — always produce at least 2
  const recommendations: AnalysisResult["recommendations"] = pain_points.slice(0, 3).map((p, i) => ({
    priority: (i === 0 ? "high" : i === 1 ? "medium" : "low") as "high" | "medium" | "low",
    category: p.issue,
    action: `Address ${p.issue.toLowerCase()} based on ${p.frequency} of user feedback`,
    expected_impact: p.severity === "high" ? "Significant improvement in user satisfaction" : "Moderate positive impact on user experience",
  }));

  // Add emotion-driven recommendations
  emotional_patterns
    .filter(e => e.sentiment === "negative" && e.intensity !== "Low")
    .slice(0, 2)
    .forEach(e => {
      if (!recommendations.some(r => r.category.includes(e.emotion))) {
        recommendations.push({
          priority: e.intensity === "High" ? "high" : "medium",
          category: `${e.emotion} Mitigation`,
          action: `Investigate and address triggers of user ${e.emotion.toLowerCase()} in the product experience`,
          expected_impact: "Reduced negative sentiment and improved emotional engagement",
        });
      }
    });

  // Add theme-driven recommendations
  behavioral_themes.slice(0, 2).forEach(t => {
    if (!recommendations.some(r => r.category === t.theme)) {
      recommendations.push({
        priority: "medium",
        category: t.theme,
        action: `Optimize the experience for ${t.user_segment.toLowerCase()} around ${t.theme.toLowerCase()}`,
        expected_impact: "Better alignment with observed user behavior patterns",
      });
    }
  });

  // Ensure minimum 2 recommendations
  if (recommendations.length < 2) {
    const defaults = [
      { priority: "high" as const, category: "User Research", action: "Conduct targeted user interviews to validate inferred patterns", expected_impact: "Stronger evidence base for product decisions" },
      { priority: "medium" as const, category: "Feedback Loop", action: "Implement structured in-app feedback collection to capture richer signals", expected_impact: "Better data quality for ongoing analysis" },
    ];
    defaults.forEach(d => {
      if (recommendations.length < 2 && !recommendations.some(r => r.category === d.category)) {
        recommendations.push(d);
      }
    });
  }

  const executive_summary = `Analysis of user feedback reveals ${pain_points.length} key pain point${pain_points.length !== 1 ? "s" : ""} and ${emotional_patterns.length} distinct emotional pattern${emotional_patterns.length !== 1 ? "s" : ""}. ${
    negativeCount > positiveCount
      ? "Overall sentiment skews negative, suggesting urgent attention to core issues."
      : positiveCount > negativeCount
        ? "Overall sentiment is positive, with targeted areas for improvement."
        : "Sentiment is mixed, indicating both strengths and areas needing attention."
  } ${pain_points.length > 0 ? `The most critical issue is "${pain_points[0].issue}" with ${pain_points[0].frequency}.` : ""} ${cognitive_biases.length > 0 ? `${cognitive_biases.length} cognitive bias${cognitive_biases.length > 1 ? "es were" : " was"} detected, which should be considered when interpreting results.` : ""} ${behavioral_themes.length} behavioral theme${behavioral_themes.length !== 1 ? "s were" : " was"} identified${behavioral_themes.length > 0 ? `, including "${behavioral_themes[0].theme}"` : ""}. Two user personas were generated to guide product strategy, with ${recommendations.length} actionable recommendations prioritized by impact.`;

  return { pain_points, emotional_patterns, behavioral_themes, cognitive_biases, personas, recommendations, executive_summary };
}
