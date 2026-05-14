"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnalysisDependency } from "@/types/repository";
import { Package } from "lucide-react";

interface DependenciesHealthProps {
  dependencies: AnalysisDependency[];
}

const SEGMENTS = [
  { key: "healthy", label: "Up to date", fill: "#38bdf8" },
  { key: "outdated", label: "Outdated",   fill: "#f59e0b" },
  { key: "unused",   label: "Unused",     fill: "#ef4444" },
];

export function DependenciesHealth({ dependencies }: DependenciesHealthProps) {
  const outdatedCount = dependencies.filter((d) => d.is_outdated && !d.is_unused).length;
  const unusedCount   = dependencies.filter((d) => d.is_unused).length;
  const healthyCount  = dependencies.length - outdatedCount - unusedCount;

  const data = [
    { key: "healthy",  label: "Up to date", value: healthyCount, fill: "#38bdf8" },
    { key: "outdated", label: "Outdated",   value: outdatedCount, fill: "#f59e0b" },
    { key: "unused",   label: "Unused",     value: unusedCount,  fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <Package size={16} className="text-primary" />
          Dependencies Health
        </CardTitle>
        <CardDescription className="text-[10px] text-white/30 italic">
          {dependencies.length} total dependencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dependencies.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-white/30 text-sm font-mono">
            No dependencies found
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [`${value}`, name]}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {SEGMENTS.map(({ key, label, fill }) => {
                const entry = data.find((d) => d.key === key);
                const count = entry?.value ?? 0;
                const pct = dependencies.length > 0 ? Math.round((count / dependencies.length) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fill }} />
                    <span className="text-white/50 text-xs font-mono flex-1">{label}</span>
                    <span className="text-white/80 text-xs font-mono font-bold">{count}</span>
                    <span className="text-white/30 text-[10px] font-mono w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
              <div className="border-t border-white/5 pt-2 mt-1">
                <span className="text-white/30 text-[10px] font-mono">
                  {outdatedCount + unusedCount} need attention
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
