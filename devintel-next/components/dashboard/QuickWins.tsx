import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { QuickWin } from "@/types/repository";

interface QuickWinsProps {
  quick_wins: QuickWin[];
}

export function QuickWins({ quick_wins }: QuickWinsProps) {
  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest">
          Quick Wins & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {quick_wins.map((win, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 border border-white/5 rounded-lg group hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                    {win.title}
                  </h4>
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40",
                      win.impact === "High"
                        ? "text-destructive"
                        : win.impact === "Medium"
                          ? "text-warning"
                          : "text-primary",
                    )}
                  >
                    {win.impact}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 font-mono truncate">
                  {win.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
