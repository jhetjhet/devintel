"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RepositoryDetails } from "@/types/repository";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { AuditHistory } from "./dashboard/AuditHistory";
import { useRouter } from "next/navigation";
import { fetchReports } from "@/lib/api.client";

function tail(str: string, n: number) {
  str = String(str); // safely coerce values
  if (str.length <= n) return str;
  return `...${str.slice(-n)}`;
}

type ReportsPageContentsProps = {
  repoAnalysis: RepositoryDetails[];
};

export default function ReportsPageContents({
  repoAnalysis,
}: ReportsPageContentsProps) {
  const router = useRouter();

  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const {
    data: repoReports,
    isLoading: repoReportsLoading,
    error: repoReportsError,
  } = useSWR(selectedRepoId ? `reports-${selectedRepoId}` : null, () =>
    fetchReports(selectedRepoId!),
  );

  if (!repoAnalysis || repoAnalysis.length === 0) {
    return (
      <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            Repository List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10 text-white/20 text-xs font-mono uppercase tracking-widest">
            No repositories found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="bg-surface border-white/5 col-span-1 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            Repository List
            <span className="ml-auto text-white/20 text-[12px]">
              ({repoAnalysis.length})
            </span>
          </CardTitle>
          <CardDescription className="text-[12px] text-white/30 italic">
            All repositories you have analyzed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto min-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            <div className="w-full min-w-[700px]">
              <table className="table-fixed w-full">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[35%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-white/5 text-[12px] font-mono text-white/40 uppercase">
                    <th className="text-left pb-3">Name</th>
                    <th className="text-left pb-3">Repo</th>
                    <th className="text-left pb-3">Last Commit</th>
                    <th className="text-left pb-3">Last Scanned</th>
                    <th className="text-left pb-3">Reports</th>
                  </tr>
                </thead>
              </table>

              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                <table className="table-fixed w-full">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[35%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                  <tbody className="text-xs">
                    {repoAnalysis.map((repo, i) => (
                      <tr
                        key={repo.id ?? i}
                        onClick={() => setSelectedRepoId(repo.id)}
                        className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 relative"
                      >
                        <td className="pl-4 py-4 font-mono text-primary font-bold relative">
                          {repo.repo_name ?? "Unknown Repository"}
                        </td>
                        <td>
                          <Link
                            href={repo.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-primary/80 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {tail(repo.repo_url, 36)}
                          </Link>
                        </td>
                        <td>{repo.latest_commit_hash?.slice(0, 7) ?? "—"}</td>
                        <td>
                          {repo.last_scanned_at
                            ? new Date(
                                repo.last_scanned_at,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{repo.report_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedRepoId && (
        <div className="flex items-center justify-center h-48 text-white/20 text-sm font-mono uppercase tracking-widest">
          Select a repository to view its reports
        </div>
      )}
      {selectedRepoId && (
        <div className="mt-8">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              Audit History for{" "}
              {repoAnalysis.find((r) => r.id === selectedRepoId)?.repo_name ??
                "Unknown Repository"}
            </h2>
            <p className="text-white/40 text-sm mb-4">
              All past analysis runs for this repository.
            </p>
          </div>
          <AuditHistory
            runs={repoReports ?? []}
            isLoading={repoReportsLoading}
            onReportSelect={(report) => {
              router.push(`/dashboard/${selectedRepoId}/${report.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
