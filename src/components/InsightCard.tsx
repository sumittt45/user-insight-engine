import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  accentColor?: string;
}

export function InsightCard({ title, icon, children, delay = 0, accentColor }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="glass-surface h-full overflow-hidden group hover:border-accent/30 transition-colors duration-300">
        <div
          className="h-0.5 w-full"
          style={{ background: accentColor || "hsl(var(--accent))" }}
        />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
            <span className="text-accent">{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  );
}
