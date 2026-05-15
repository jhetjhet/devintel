import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, PlayCircle, Share2, Copy } from 'lucide-react';

interface RefactorLabProps {
  diff: {
    header: string;
    reasoning: string;
    before: string;
    after: string;
  };
}

export function RefactorLab({ diff }: RefactorLabProps) {
  return (
    <Card className="bg-surface border-white/5 border-none shadow-none ring-0">
      <CardHeader className="p-0 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary" />
              Intelligence Suggestion: SRP Extraction
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-white/30">{diff.header}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl mb-6">
            <p className="text-xs leading-relaxed text-white/60">{diff.reasoning}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-mono text-destructive uppercase font-bold tracking-widest">Legacy (Monolithic)</span>
                 <span className="text-[10px] font-mono text-white/20 tracking-widest">v1.2.4</span>
              </div>
              <div className="relative group">
                <button className="absolute top-4 right-4 p-2 bg-black/40 rounded-lg text-white/0 group-hover:text-white/40 transition-all">
                  <Copy size={14} />
                </button>
                <div className="h-[250px] overflow-y-auto custom-scrollbar bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[11px] leading-relaxed text-white/40 whitespace-pre">
                  {diff.before}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-mono text-secondary uppercase font-bold tracking-widest">Refactored (Modular)</span>
                 <span className="text-[10px] font-mono text-secondary/40 tracking-widest">PROPOSED</span>
              </div>
              <div className="relative group">
                <button className="absolute top-4 right-4 p-2 bg-secondary/10 rounded-lg text-white/0 group-hover:text-secondary transition-all">
                  <Copy size={14} />
                </button>
                <div className="h-[250px] overflow-y-auto custom-scrollbar bg-secondary/5 rounded-2xl border border-secondary/20 p-4 font-mono text-[11px] leading-relaxed text-white/80 whitespace-pre">
                  {diff.after}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
