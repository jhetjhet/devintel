"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderProps = {
  repo_name: string | null;
  commit_hash: string | null;
  branch: string | null;
  overall_score: number | null;
  overall_verdict: string | null;
  scanned_at: string | null;
};

export function Header({
  repo_name,
  commit_hash,
  branch,
  overall_score,
  overall_verdict,
  scanned_at,
}: HeaderProps) {
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string | null>(null);

  useEffect(() => {
    if (scanned_at) {
      const date = new Date(scanned_at);
      setLastAnalysisTime(date.toLocaleString());
    }
  }, [scanned_at]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <LayoutDashboard className="text-primary" />
          Dev. Intelligence
        </h1>
        <p className="text-white/40 mt-1">
          Repo: <span className="text-primary">{repo_name ?? "—"}</span> •{" "}
          Branch: <span className="text-white/60">{branch ?? "—"}</span> •{" "}
          Commit:{" "}
          <span className="text-white/60 font-mono text-xs">
            {commit_hash?.slice(0, 7) ?? "—"}
          </span>
        </p>
        {scanned_at && (
          <p className="text-white/20 text-xs mt-0.5">
            Last analyzed: {lastAnalysisTime}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-white/50 hover:text-primary text-xs font-mono font-bold uppercase tracking-widest transition-all"
        >
          <Plus size={12} />
          Run New Audit
        </Link>
        {overall_verdict && (
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase">
            {overall_verdict}
          </span>
        )}
        {overall_score !== null && (
          <div className="text-right">
            <div className="text-3xl font-black text-white">
              {overall_score}
            </div>
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
              Health Score
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
