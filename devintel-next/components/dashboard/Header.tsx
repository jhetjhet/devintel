"use client";

import { AnalysisRunDetail, RepositoryDetails } from "@/types/repository";
import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderProps = {
  repositoryDetails: RepositoryDetails;
  reportDetails: AnalysisRunDetail;
};

export function Header({ repositoryDetails, reportDetails }: HeaderProps) {
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string | null>(null);

  useEffect(() => {
    if (reportDetails.scanned_at) {
      const date = new Date(reportDetails.scanned_at);
      setLastAnalysisTime(date.toLocaleString());
    }
  }, [reportDetails.scanned_at]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <LayoutDashboard className="text-primary" />
          Dev. Intelligence
        </h1>
        <p className="text-white/40 mt-1">
          Repo:{" "}
          <span className="text-primary">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={repositoryDetails.repo_url}
            >
              {repositoryDetails.repo_name}
            </Link>
          </span>{" "}
          Commit:{" "}
          <span className="text-white/60 font-mono text-xs">
            {reportDetails.commit_hash?.slice(0, 7) ?? "—"}
          </span>
        </p>
        {reportDetails.scanned_at && (
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
        {reportDetails.overall_verdict && (
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase">
            {reportDetails.overall_verdict}
          </span>
        )}
        {reportDetails.overall_score !== null && (
          <div className="text-right">
            <div className="text-3xl font-black text-white">
              {reportDetails.overall_score}
            </div>
            <div className="text-[12px] text-white/40 uppercase font-mono tracking-widest">
              Health Score
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
