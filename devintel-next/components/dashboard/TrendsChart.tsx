import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, XAxis, Tooltip, Area } from 'recharts';
import { cn } from "@/lib/utils";

interface TrendsChartProps {
  trendData: Array<{ day: string, debt: number, score: number }>;
  activeMetric: 'debt' | 'score';
  setActiveMetric: (metric: 'debt' | 'score') => void;
}

export function TrendsChart({ trendData, activeMetric, setActiveMetric }: TrendsChartProps) {
  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest">Growth Metrics</CardTitle>
          <CardDescription className="text-xs mt-1 text-white/30 italic">Differential analysis against previous commit (7d4f912)</CardDescription>
        </div>
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setActiveMetric('debt')}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-bold transition-all",
              activeMetric === 'debt' ? "bg-primary text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            Debt
          </button>
          <button 
            onClick={() => setActiveMetric('score')}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-bold transition-all",
              activeMetric === 'score' ? "bg-primary text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            Score
          </button>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--foreground)', opacity: 0.4, fontSize: 10, fontFamily: 'JetBrains Mono' }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={activeMetric === 'debt' ? "var(--secondary)" : "var(--primary)"} 
              fillOpacity={1} 
              fill={activeMetric === 'debt' ? "url(#colorDebt)" : "url(#colorScore)"} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
