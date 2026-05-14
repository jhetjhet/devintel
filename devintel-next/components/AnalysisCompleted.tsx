"use client";

import { motion } from "motion/react";
import { CheckCircle2, RotateCw, Eye, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AnalysisCompletedProps = {
  repositoryId: string;
  commitHash: string;
};

export function AnalysisCompleted({
  repositoryId,
  commitHash,
}: AnalysisCompletedProps) {
  const router = useRouter();

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
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
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
        <div className="p-5 bg-[#0f172a] border border-secondary/20 rounded-2xl mb-6 space-y-3">
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              router.push(`/dashboard/${repositoryId}?commit_hash=${commitHash}`)
            }
            className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/90 text-black font-bold text-sm rounded-xl transition-all duration-200"
          >
            <Eye size={16} />
            View Report
          </button>

          <button
            onClick={() => router.push(`/analysis/${repositoryId}`)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 transition-colors"
          >
            <RotateCw size={16} />
            Run Again
          </button>
        </div>

        <p className="text-[11px] text-white/20 text-center mt-5 leading-relaxed">
          Running analysis again will only apply if there is a new commit.
          Historical reports are preserved for comparison.
        </p>
      </motion.div>
    </div>
  );
}
