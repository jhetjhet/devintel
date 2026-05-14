"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AnalysisRunSummary } from "@/types/repository";
import { Bug } from "lucide-react";

interface FindingsSmellsTrendProps {
  runs: AnalysisRunSummary[];
}

export function FindingsSmellsTrend({ runs }: FindingsSmellsTrendProps) {
  const trendData = [...runs]
    .sort(
      (a, b) =>
        new Date(a.scanned_at ?? a.created_at).getTime() -
        new Date(b.scanned_at ?? b.created_at).getTime(),
    )
    .slice(-12)
    .map((run) => {
      const d = new Date(run.scanned_at ?? run.created_at);
      return {
        date:     `${d.getMonth() + 1}/${d.getDate()}`,
        Findings: run.total_findings ?? 0,
        Smells:   run.total_smells   ?? 0,
      };
    });

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <Bug size={16} className="text-warning" />
          Findings &amp; Smells Trend
        </CardTitle>
        <CardDescription className="text-[10px] text-white/30 italic">
          Code issues detected over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 text-sm font-mono">
            No historical runs yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                cursor={{ stroke: "rgba(255,255,255,0.05)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }}
              />
              <Line
                type="monotone"
                dataKey="Findings"
                stroke="#d4a017"
                strokeWidth={2}
                dot={{ r: 3, fill: "#d4a017" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Smells"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#38bdf8" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
