import { Card, CardContent } from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { RadarMetric } from "@/types/repository";
import { BrainCircuit } from "lucide-react";

type RadarMetricsCardProps = {
  radar_metrics: RadarMetric[];
};

export default function RadarMetricsCard({ radar_metrics }: RadarMetricsCardProps) {
  const radarData = radar_metrics.map((m) => ({
    subject: m.subject,
    A: m.score,
    fullMark: m.max,
  }));

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-2 lg:col-span-3">
      <CardContent className="h-full pt-6">
        {radarData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] gap-3 text-white/20">
            <BrainCircuit size={32} strokeWidth={1.5} />
            <p className="text-xs font-mono uppercase tracking-widest">
              No intelligence metrics available
            </p>
            <p className="text-[11px] font-mono text-white/15 text-center max-w-48">
              AI-assisted metrics are generated when LLM analysis is enabled
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--foreground)", opacity: 0.4, fontSize: 10 }}
              />
              <Radar
                name="Intelligence"
                dataKey="A"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
