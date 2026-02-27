import { Badge } from "@/components/ui/badge";

const severityConfig = {
  high: "bg-danger-subtle text-danger border-danger/20",
  medium: "bg-warning-subtle text-warning border-warning/20",
  low: "bg-info-subtle text-info border-info/20",
};

export function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider ${severityConfig[severity]}`}>
      {severity}
    </Badge>
  );
}

const sentimentConfig = {
  positive: "bg-success-subtle text-success border-success/20",
  negative: "bg-danger-subtle text-danger border-danger/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function SentimentBadge({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider ${sentimentConfig[sentiment]}`}>
      {sentiment}
    </Badge>
  );
}
