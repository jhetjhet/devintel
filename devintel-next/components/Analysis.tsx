"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Terminal, BrainCircuit, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Repository, RepositorySchema } from "@/types/api";
import { useRouter } from "next/navigation";
import useAnalysisSocket from "@/hooks/useAnalysisSocket";
import { finalizeAnalysis } from "@/app/actions/evaluate";

interface AnalysisProps {
  repositoryId: string;
  force?: boolean;
}

export function Analysis({ repositoryId }: AnalysisProps) {
  const router = useRouter();

  const [repository, setRepository] = useState<Repository | null>(null);

  const [isFinalizing, startFinalizeAnalysisTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);

  const { progress, auditLogs } = useAnalysisSocket(
    repository?.id,
    () => {
      startFinalizeAnalysisTransition(async () => {
        const response = await finalizeAnalysis(repositoryId);

        if (response.success) {
          router.push(
            `/dashboard/${response.data.repository_id}/${response.data.analysis_run_id}`,
          );
        }
      });
    },
    (data) => {
      // TODO: display error in UI
      console.error("Analysis error:", data);
    },
  );

  useEffect(() => {
    async function fetchRepository() {
      const response = await fetch(`/fast-api/repositories/${repositoryId}`);

      if (!response.ok) {
        console.error(
          "Failed to fetch repository data:",
          await response.text(),
        );
        return;
      }

      const data = await response.json();

      const dataRes = RepositorySchema.safeParse(data);

      if (!dataRes.success) {
        console.error("Invalid repository data format:", dataRes.error);
        return;
      }

      setRepository(dataRes.data);
    }

    fetchRepository();
  }, [repositoryId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [auditLogs]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-12 text-center"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-24 h-24 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex items-center justify-center text-primary"
          >
            <BrainCircuit size={40} className="glow-primary" />
          </motion.div>
          <div className="absolute inset-0 bg-primary/20 blur-[40px] -z-10 rounded-full" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Systematic Decomposition...
          </h2>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest">
            Constructing Architecture Graph
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[12px] font-mono text-white/40 mb-2">
            <span>PROGRESSIVE ANALYSIS</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/5" />
        </div>

        <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <Terminal size={14} className="text-white/20" />
            <span className="text-[12px] font-mono text-white/20 uppercase tracking-widest">
              Worker Logs
            </span>
          </div>
          <ScrollArea className="h-32 pr-4">
            {auditLogs.map((auditLog, i) => (
              <div
                key={i}
                className="text-[12px] font-mono text-white/60 mb-1 flex gap-3"
              >
                <span className="text-white/20 flex-shrink-0">
                  [{new Date(auditLog.timestamp).toLocaleTimeString()}]
                </span>
                <span
                  className={
                    i === auditLogs.length - 1
                      ? "text-primary transition-all glow-primary"
                      : ""
                  }
                >
                  {i === auditLogs.length - 1 && "> "}
                  {auditLog.message}
                </span>
              </div>
            ))}
            <div ref={scrollRef} />
          </ScrollArea>
        </div>

        <div className="flex justify-center gap-12 mt-12">
          {[
            { icon: <Activity size={16} />, label: "Complexity" },
            { icon: <BrainCircuit size={16} />, label: "Dependencies" },
            { icon: <Terminal size={16} />, label: "Types" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 opacity-20"
            >
              <div className="p-3 bg-white/5 rounded-xl text-white">
                {item.icon}
              </div>
              <span className="text-[12px] font-mono text-white uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {isFinalizing && (
          <div className="flex items-center gap-2 justify-center mt-12 text-primary">
            <Activity size={16} className="animate-spin" />
            <span className="text-sm font-mono uppercase tracking-widest">
              Finalizing Analysis...
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
