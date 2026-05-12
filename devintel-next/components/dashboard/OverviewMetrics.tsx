import { Card, CardContent } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FullAuditReport } from '@/types/schemas';

interface OverviewMetricsProps {
  report: FullAuditReport;
  radarData: Array<{ subject: string, A: number, fullMark: number }>;
}

export function OverviewMetrics({ report, radarData }: OverviewMetricsProps) {
  return (
    <>
      <Card className="bg-surface border-white/5 relative overflow-hidden group">
        <div className="scanning-line" />
        <CardContent className="pt-6 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/5"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * report.llm_insights.overall_score) / 100}
                strokeLinecap="round"
                className="text-primary glow-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{report.llm_insights.overall_score}</span>
              <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Health</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 text-center">
            <div>
              <div className="text-xs text-secondary font-bold">+{report.llm_insights.growth_pts} pts</div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Growth Pts</div>
            </div>
            <div className="w-[1px] bg-white/10" />
            <div>
              <div className="text-xs text-warning font-bold">{report.llm_insights.overall_verdict}</div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Verdict</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-white/5 col-span-1 md:col-span-2 lg:col-span-3">
        <CardContent className="h-full pt-6">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', opacity: 0.4, fontSize: 10 }} />
              <Radar
                name="Intelligence"
                dataKey="A"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
