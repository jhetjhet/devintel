import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisRunSummary } from "@/types/repository";

interface AuditHistoryProps {
  runs: AnalysisRunSummary[];
  isLoading?: boolean;
  onReportSelect?: (report: AnalysisRunSummary) => void;
}

export function AuditHistory({ runs, isLoading = false, onReportSelect }: AuditHistoryProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-primary" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-primary" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10 text-white/20 text-xs font-mono uppercase tracking-widest">
            No history available
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <History size={16} className="text-primary" />
          Analysis History
          <span className="ml-auto text-white/20 text-[12px]">
            ({runs.length})
          </span>
        </CardTitle>
        <CardDescription className="text-[12px] text-white/30 italic">
          Historical analysis snapshots for this repository.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[12px] font-mono text-white/40 uppercase">
                <th className="pb-3 pr-4">Commit</th>
                <th className="pb-3 pr-4">Analyzed Date</th>
                <th className="pb-3 pr-4 text-center">Health Score</th>
                <th className="pb-3 pr-4 text-center">Tech Debt</th>
                <th className="pb-3 text-right">Verdict</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-72 overflow-y-auto min-w-full scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <tbody className="text-xs">
                {runs.map((run, i) => {
                  const score = run.overall_score ?? 0;
                  const techDebt = run.technical_debt_score ?? 0;
                  const date = run.scanned_at ?? run.created_at;

                  return (
                    <tr
                      key={run.id ?? i}
                      onClick={() => onReportSelect?.(run)}
                      className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 relative"
                    >
                      <td className="py-4 pl-4 font-mono text-primary font-bold relative">
                        <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-0 bg-primary group-hover:h-2/3 transition-all rounded-full" />

                        {run.commit_hash?.slice(0, 7) ?? "—"}
                      </td>
                      <td className="text-white/60">
                        {new Date(date).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-white tracking-widest">
                            {score}
                          </span>
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-1000",
                                score > 80
                                  ? "bg-secondary"
                                  : score > 60
                                    ? "bg-primary"
                                    : "bg-destructive",
                              )}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span
                          className={cn(
                            "font-mono font-bold",
                            techDebt < 30
                              ? "text-secondary"
                              : techDebt < 50
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {techDebt}%
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-[12px] font-bold border",
                            score > 80
                              ? "bg-secondary/10 text-secondary border-secondary/20"
                              : score > 70
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-white/5 text-white/40 border-white/10",
                          )}
                        >
                          {score === 0 ? "No Verdict" : run.overall_verdict}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
