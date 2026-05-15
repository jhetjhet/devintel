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
  ResponsiveContainer,
} from "recharts";
import { RiskyEntity } from "@/types/repository";
import { AlertTriangle } from "lucide-react";

interface RiskyEntitiesChartProps {
  entities: RiskyEntity[];
}

export function RiskyEntitiesChart({ entities }: RiskyEntitiesChartProps) {
  const topEntities = entities
    .filter((e) => e.pain_score !== null && e.name !== null)
    .sort((a, b) => (b.pain_score ?? 0) - (a.pain_score ?? 0))
    .slice(0, 8)
    .map((e) => ({
      name: e.name ?? "Unknown",
      pain_score: e.pain_score ?? 0,
      file_path: e.file_path ?? "",
    }));

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          Top Risky Entities
        </CardTitle>
        <CardDescription className="text-[12px] text-white/30 italic">
          Entities ranked by pain score
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        {topEntities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 text-sm font-mono">
            No risky entities detected
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEntities} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}`, "Pain Score"]}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Bar dataKey="pain_score" fill="var(--warning)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
