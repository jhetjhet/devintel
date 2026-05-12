import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FullAuditReport } from '@/types/schemas';

interface FileStructureProps {
  report: FullAuditReport;
}

export function FileStructure({ report }: FileStructureProps) {
  return (
    <Card className="bg-surface border-white/5">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest">Health-Coded File Structure</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {report.deterministic_report.file_structure_health.map((folder, i) => (
            <div key={i} className="p-4 border border-white/5 bg-black/20 rounded-xl hover:bg-black/40 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <Layers className={cn(
                  folder.status === 'excellent' ? "text-secondary" : 
                  folder.status === 'good' ? "text-primary" : 
                  folder.status === 'warning' ? "text-warning" : "text-destructive"
                )} size={20} />
                <span className="text-sm font-mono font-bold text-white/80">{folder.path}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
                    <span>HEALTH</span>
                    <span className={cn(
                      folder.health_score > 80 ? "text-secondary" : 
                      folder.health_score > 60 ? "text-warning" : "text-destructive"
                    )}>{folder.health_score}%</span>
                </div>
                <Progress value={folder.health_score} className="h-1 bg-white/5" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] text-white/20 uppercase font-mono">{folder.file_count} objects</span>
                <ChevronRight size={14} className="text-white/0 group-hover:text-white/40 transition-all" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Top Risky Entities */}
        <div className="mt-12 bg-black/20 rounded-2xl border border-white/5 p-6">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle size={14} />
                High Risk Architectural Entities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.deterministic_report.top_risky_entities.map((entity, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center gap-4 hover:border-primary/40 transition-colors">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-mono font-bold text-xs">#{entity.rank}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{entity.name}</div>
                        <div className="text-[10px] text-white/40 truncate font-mono">{entity.file}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-warning">{entity.pain_score}</div>
                        <div className="text-[8px] text-white/20 uppercase font-mono">Pain</div>
                    </div>
                  </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
