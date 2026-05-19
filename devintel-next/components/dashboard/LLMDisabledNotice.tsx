import { BrainCircuit, Info } from "lucide-react";

type LLMDisabledNoticeProps = {
  with_llm: boolean | null;
};

export function LLMDisabledNotice({ with_llm }: LLMDisabledNoticeProps) {
  if (with_llm) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-8 rounded-xl border border-warning/20 bg-warning/5">
      <span className="mt-0.5 shrink-0 text-warning">
        <BrainCircuit size={16} />
      </span>
      <div className="space-y-0.5">
        <p className="text-warning text-xs font-mono uppercase tracking-widest font-bold">
          AI Analysis Unavailable
        </p>
        <p className="text-white/50 text-xs leading-relaxed">
          This report was generated without LLM-assisted analysis. Sections
          that rely on AI reasoning — including refactor suggestions, growth
          insights, and confidence scores — are not available. Enable AI
          Analysis on your account to unlock the full report.
        </p>
      </div>
      <span className="mt-0.5 shrink-0 text-white/20">
        <Info size={14} />
      </span>
    </div>
  );
}
