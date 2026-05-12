import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TimelineHistory } from '@/types/schemas';

interface AuditHistoryProps {
  history: TimelineHistory;
}

export function AuditHistory({ history }: AuditHistoryProps) {
  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
          <History size={16} className="text-primary" />
          Intelligence Timeline (Selection Mode)
        </CardTitle>
        <CardDescription className="text-[10px] text-white/30 italic">Select a point in architectural history to compare snapshots.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-white/40 uppercase">
                <th className="pb-3 pr-4">Commit Hash</th>
                <th className="pb-3 pr-4">Audit Date</th>
                <th className="pb-3 pr-4 text-center">Health Score</th>
                <th className="pb-3 pr-4 text-center">Tech Debt</th>
                <th className="pb-3 text-right">Status Verdict</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {history.map((row, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 relative">
                  <td className="py-4 pr-4 font-mono text-primary font-bold relative">
                     <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-0 bg-primary group-hover:h-2/3 transition-all rounded-full" />
                     {row.commit_hash}
                  </td>
                  <td className="py-4 pr-4 text-white/60">{new Date(row.timestamp).toLocaleDateString()}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-white tracking-widest">{row.score}</span>
                      <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", row.score > 80 ? "bg-secondary" : "bg-primary")} 
                          style={{ width: `${row.score}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                     <span className={cn(
                       "font-mono font-bold",
                       row.technical_debt < 30 ? "text-secondary" : row.technical_debt < 40 ? "text-warning" : "text-destructive"
                     )}>
                       {row.technical_debt}%
                     </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold border",
                      row.score > 80 ? "bg-secondary/10 text-secondary border-secondary/20" : 
                      row.score > 70 ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-white/40 border-white/10"
                    )}>
                      {row.score > 80 ? 'Production Ready' : row.score > 70 ? 'Stable' : 'Audit Required'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
