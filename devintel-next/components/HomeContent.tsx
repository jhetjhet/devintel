"use client";

import { ArrowRight, Terminal } from "lucide-react";
import HomeIconCards from "./home/HomeIconCards";
import HomeHeader from "./home/HomeHeader";
import { motion } from "motion/react";
import { analyzeRepo } from "@/app/actions/evaluate";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function HomeContent() {
  const router = useRouter();

  const [repoUrl, setRepoUrl] = useState("");

  const [analyzeRepoPending, startAnalyzeRepoTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startAnalyzeRepoTransition(async () => {
      const response = await analyzeRepo(repoUrl);

      if (response.success) {
        console.log("Repository Analysis Result:", response.data);
        router.push(`/analysis/${response.data.id}`);
      } else {
        console.error("Error analyzing repository:", response.error);
      }
    });
  }

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
    >
      <div className="space-y-8">
        <HomeHeader />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
              {/* <Github size={20} /> */}
            </div>
            <input
              type="text"
              name="repo_url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="github.com/org/repo"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={analyzeRepoPending}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-[0.98]"
          >
            {analyzeRepoPending ? "Analyzing..." : "Analyze Repository"}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] flex items-center gap-3">
          <Terminal size={12} />
          Trusted by internal architecture guilds
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <HomeIconCards />
      </div>
    </motion.div>
  );
}
