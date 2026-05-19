"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Code } from "lucide-react";

interface LanguageFrameworkDistributionProps {
  languages: string[] | null;
  frameworks: string[] | null;
}

const COLORS = [
  "#38bdf8",
  "#d4a017",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
];

export function LanguageFrameworkDistribution({
  languages,
  frameworks,
}: LanguageFrameworkDistributionProps) {
  const allItems = [...(languages ?? []), ...(frameworks ?? [])].filter(
    Boolean,
  );

  const aggregated = Array.from(
    allItems.reduce((map, name) => {
      map.set(name, (map.get(name) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const langSet = new Set(languages ?? []);

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <Code size={16} className="text-secondary" />
          Tech Stack
        </CardTitle>
        <CardDescription className="text-[12px] text-white/30 italic">
          Languages and frameworks detected
        </CardDescription>
      </CardHeader>
      <CardContent>
        {aggregated.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-white/30 text-sm font-mono">
            No tech stack detected
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height={192}>
                <PieChart>
                  <Pie
                    data={aggregated}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {aggregated.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {aggregated.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white/60 text-xs font-mono truncate flex-1">
                    {item.name}
                  </span>
                  <span
                    className="text-[12px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      color: langSet.has(item.name)
                        ? "rgba(56,189,248,0.8)"
                        : "rgba(212,160,23,0.8)",
                      backgroundColor: langSet.has(item.name)
                        ? "rgba(56,189,248,0.1)"
                        : "rgba(212,160,23,0.1)",
                    }}
                  >
                    {langSet.has(item.name) ? "lang" : "fw"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
