"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { AlertCircle, Zap, RotateCw, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { finalizeAnalysis, startAudit } from "@/app/actions/evaluate";

interface AnalysisInProgressProps {
  repositoryId: string;
  commitHash: string;
}

export function AnalysisInPending({
  repositoryId,
  commitHash,
}: AnalysisInProgressProps) {
  const router = useRouter();
  
  const [finalizeAnalysisIsPending, startFinalizeAnalysisTransition] = useTransition();
  const [auditIsPending, startAuditTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleFinalize = () => {
    startFinalizeAnalysisTransition(async () => {
      const response = await finalizeAnalysis(repositoryId);

      if (!response.success) {
        setError(response.error.message);
      } else {
        router.push(`/dashboard/${response.data.repository_id}?analysis_run_id=${response.data.analysis_run_id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#05070d] flex items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={12}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Home
        </Link>

        {/* Icon + title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="text-warning" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Result Awaiting Finalization
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              An analysis was run but not yet persisted
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="p-5 bg-[#0f172a] border border-warning/20 rounded-2xl mb-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-warning shrink-0" />
            <span className="text-xs font-mono text-warning uppercase tracking-widest">
              Status
            </span>
          </div>
          <ul className="space-y-2 text-sm text-white/60 leading-relaxed">
            <li>
              An analysis result has been generated for this repository but{" "}
              <span className="text-white/90">has not been finalized</span> — it
              has not been persisted to the database yet.
            </li>
            <li>
              The cached result will be{" "}
              <span className="text-warning">lost if not completed</span>.
              Finalize now to save it permanently.
            </li>
          </ul>
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-white/20 uppercase tracking-widest block mb-0.5">
                Repository
              </span>
              <span className="text-white/60">
                {repositoryId.slice(0, 8)}...
              </span>
            </div>
            <div>
              <span className="text-white/20 uppercase tracking-widest block mb-0.5">
                Commit
              </span>
              <span className="text-white/60">
                {commitHash?.slice(0, 7) ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-xs text-destructive mb-4 px-1">{error}</p>}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleFinalize}
            disabled={finalizeAnalysisIsPending}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all duration-200 group"
          >
            <Zap size={16} className={finalizeAnalysisIsPending ? "animate-pulse" : ""} />
            {finalizeAnalysisIsPending ? "Finalizing..." : "Finalize Results"}
          </button>

          <button
            onClick={() => {
              startAuditTransition(async () => {
                const respose = await startAudit(repositoryId, true);
                
                if (!respose.success) {
                  console.error("Failed to start audit:", respose.error);
                  return;
                }

                router.push(`/analysis/${respose.data?.repository_id}/progress`);
              });
            }}
            disabled={finalizeAnalysisIsPending}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold text-sm rounded-xl border border-white/10 transition-colors"
          >
            <RotateCw size={16} />
            Run Again
          </button>
        </div>

        <p className="text-[11px] text-white/20 text-center mt-5 leading-relaxed">
          Running analysis again will start fresh — the current cached result
          will remain available until it expires.
        </p>
      </motion.div>
    </div>
  );
}
