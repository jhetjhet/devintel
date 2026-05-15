"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AnalysisRunSummary } from "@/types/repository";
import { ShieldAlert } from "lucide-react";

interface SecurityEvolutionProps {
  runs: AnalysisRunSummary[];
}

export function SecurityEvolution({ runs }: SecurityEvolutionProps) {
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
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        Critical: run.security_critical_count ?? 0,
        High:     run.security_high_count     ?? 0,
        Medium:   run.security_medium_count   ?? 0,
        Low:      run.security_low_count      ?? 0,
      };
    });

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={16} className="text-secondary" />
          Security Evolution
        </CardTitle>
        <CardDescription className="text-[12px] text-white/30 italic">
          Vulnerability counts per analysis run
        </CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 text-sm font-mono">
            No historical runs yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }}
              />
              <Bar dataKey="Critical" stackId="a" fill="#ef4444" />
              <Bar dataKey="High"     stackId="a" fill="#f97316" />
              <Bar dataKey="Medium"   stackId="a" fill="#f59e0b" />
              <Bar dataKey="Low"      stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
