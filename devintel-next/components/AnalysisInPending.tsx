"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import { AlertCircle, Zap, RotateCw, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { finalizeAnalysis } from "@/app/actions/evaluate";
import { Button } from "./ui/button";
import useAudit from "@/hooks/useAudit";

interface AnalysisInProgressProps {
  repositoryId: string;
  commitHash: string;
}

export function AnalysisInPending({
  repositoryId,
  commitHash,
}: AnalysisInProgressProps) {
  const router = useRouter();

  const [finalizeAnalysisIsPending, startFinalizeAnalysisTransition] =
    useTransition();

  const [error, setError] = useState<string | null>(null);

  const {
    error: auditError,
    auditIsPending,
    analysisRes,
    initiateAudit,
  } = useAudit();

  const handleFinalize = () => {
    startFinalizeAnalysisTransition(async () => {
      const response = await finalizeAnalysis(repositoryId);

      if (!response.success) {
        setError(response.error.message);
      } else {
        router.push(
          `/dashboard/${response.data.repository_id}/${response.data.analysis_run_id}`,
        );
      }
    });
  };

  useEffect(() => {
    if (!analysisRes) return;

    router.push(`/analysis/${analysisRes.repository_id}/progress`);
  }, [analysisRes]);

  useEffect(() => {
    setError(auditError);
  }, [auditError]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 md:p-12">
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
        <div className="p-5 bg-[var(--color-surface)] border border-warning/20 rounded-2xl mb-6 space-y-3">
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
          <Button
            variant="primary"
            size="md"
            disabled={finalizeAnalysisIsPending || auditIsPending}
            onClick={handleFinalize}
          >
            <Zap
              size={16}
              className={finalizeAnalysisIsPending ? "animate-pulse" : ""}
            />
            {finalizeAnalysisIsPending ? "Finalizing..." : "Finalize Results"}
          </Button>

          <Button
            variant="ghost"
            size="md"
            disabled={auditIsPending}
            onClick={() => initiateAudit(repositoryId, true)}
          >
            <RotateCw size={16} />
            Run Again
          </Button>
        </div>

        <p className="text-[12px] text-white/20 text-center mt-5 leading-relaxed">
          Running analysis again will start fresh — the current cached result
          will remain available until it expires.
        </p>
      </motion.div>
    </div>
  );
}
