import { Card, CardContent } from "@/components/ui/card";

type HealthScoreCardProps = {
  overall_score: number | null;
  technical_debt_score: number | null;
  confidence: number | null;
  total_findings: number | null;
};

export default function HealthScoreCard({
  overall_score,
  technical_debt_score,
  confidence,
  total_findings,
}: HealthScoreCardProps) {
  return (
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
              strokeDashoffset={440 - (440 * (overall_score ?? 0)) / 100}
              strokeLinecap="round"
              className="text-primary glow-primary"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">
              {overall_score ?? "—"}
            </span>
            <span className="text-[12px] text-white/40 uppercase font-mono tracking-widest">
              Health
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-center">
          <div>
            <div className="text-xs text-warning font-bold">
              {technical_debt_score ?? "—"}
            </div>
            <div className="text-[12px] text-white/40 uppercase font-mono">
              Tech Debt
            </div>
          </div>
          <div className="w-[1px] bg-white/10" />
          <div>
            <div className="text-xs text-primary font-bold">
              {total_findings ?? "—"}
            </div>
            <div className="text-[12px] text-white/40 uppercase font-mono">
              Findings
            </div>
          </div>
          <div className="w-[1px] bg-white/10" />
          <div>
            <div className="text-xs text-secondary font-bold">
              {confidence !== null ? `${Math.round(confidence * 100)}%` : "—"}
            </div>
            <div className="text-[12px] text-white/40 uppercase font-mono">
              Confidence
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
