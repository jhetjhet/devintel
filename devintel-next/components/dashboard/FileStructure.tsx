import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layers, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FileHealthEntry, ArchitecturalRecommendation } from '@/types/repository';

interface FileStructureProps {
  file_health_entries: FileHealthEntry[];
  architectural_recommendations: ArchitecturalRecommendation[];
}

export function FileStructure({ file_health_entries, architectural_recommendations }: FileStructureProps) {
  return (
    <Card className="bg-surface border-white/5">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest">Health-Coded File Structure</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {file_health_entries.map((folder, i) => (
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
                <div className="flex justify-between text-[12px] font-mono text-white/40 mb-1">
                  <span>HEALTH</span>
                  <span className={cn(
                    (folder.health_score ?? 0) > 80 ? "text-secondary" :
                    (folder.health_score ?? 0) > 60 ? "text-warning" : "text-destructive"
                  )}>{folder.health_score ?? '—'}%</span>
                </div>
                <Progress value={folder.health_score ?? 0} className="h-1 bg-white/5" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[12px] text-white/20 uppercase font-mono">{folder.file_count ?? 0} objects</span>
                <ChevronRight size={14} className="text-white/0 group-hover:text-white/40 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Recommendations */}
        {architectural_recommendations.length > 0 && (
          <div className="mt-12 bg-black/20 rounded-2xl border border-white/5 p-6">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle size={14} />
              Architectural Recommendations
            </h3>
            <div className="space-y-3">
              {architectural_recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-start gap-4 hover:border-primary/40 transition-colors">
                  <div className="w-8 h-8 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary font-mono font-bold text-xs">#{rec.rank}</div>
                  <p className="text-xs text-white/60 leading-relaxed">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
