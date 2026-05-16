"use client";

import { motion } from "motion/react";
import { CheckCircle2, RotateCw, Eye, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { startAudit } from "@/app/actions/evaluate";
import { AnalysisStatusResponse } from "@/types/repository";
import { Button } from "./ui/button";
import useAudit from "@/hooks/useAudit";

type AnalysisCompletedProps = {
  analysisStatus: AnalysisStatusResponse;
};

export function AnalysisCompleted({ analysisStatus }: AnalysisCompletedProps) {
  const router = useRouter();

  const { error, auditIsPending, analysisRes, initiateAudit } = useAudit();

  useEffect(() => {
    if (!analysisRes) return;

    router.push(`/analysis/${analysisRes.repository_id}/progress`);
  }, [analysisRes]);

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
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-secondary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Report Already Generated
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              A finalized report exists for this commit
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="p-5 bg-[var(--color-surface)] border border-secondary/20 rounded-2xl mb-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-secondary shrink-0" />
            <span className="text-xs font-mono text-secondary uppercase tracking-widest">
              Report Status
            </span>
          </div>
          <ul className="space-y-2 text-sm text-white/60 leading-relaxed">
            <li>
              This repository at the{" "}
              <span className="text-white/90">same commit hash</span> already
              has a fully processed and persisted analysis report.
            </li>
            <li>
              You can view the existing report, or run a new analysis —{" "}
              <span className="text-white/90">
                previous results will not be overridden
              </span>
              .
            </li>
          </ul>
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-white/20 uppercase tracking-widest block mb-0.5">
                Same-Commit Runs
              </span>
              <span className="text-white/60">
                {analysisStatus.analysis_run_count}
              </span>
            </div>
            <div>
              <span className="text-white/20 uppercase tracking-widest block mb-0.5">
                Commit
              </span>
              <span className="text-white/60">
                {analysisStatus.commit_hash.slice(0, 7) ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-xs text-destructive mb-4 px-1">{error}</p>}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/dashboard/${analysisStatus.repository_id}/${analysisStatus.recent_analysis_run?.id}`}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/90 text-black font-bold text-sm rounded-xl transition-all duration-200"
          >
            <Eye size={16} />
            View Report
          </Link>

          <Button
            variant="ghost"
            size="md"
            disabled={auditIsPending}
            onClick={() => initiateAudit(analysisStatus.repository_id, true)}
          >
            <RotateCw size={16} />
            {auditIsPending ? "Running New Analysis..." : "Run New Analysis"}
          </Button>
        </div>

        <p className="text-[12px] text-white/20 text-center mt-5 leading-relaxed">
          Running analysis again will only apply if there is a new commit.
          Historical reports are preserved for comparison.
        </p>
      </motion.div>
    </div>
  );
}
