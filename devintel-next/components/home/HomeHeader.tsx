"use client";

import { motion } from "motion/react";
import { Activity } from "lucide-react";

export default function HomeHeader() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"
      >
        <Activity size={28} />
      </motion.div>
      <h1 className="text-5xl font-black text-white tracking-tight leading-[0.9]">
        Dev. <span className="text-primary italic">Intelligence</span>
      </h1>
      <p className="text-white/40 text-lg leading-relaxed max-w-md">
        AI powered code intelligence for modern repositories. Surface hotspots,
        track technical debt, and uncover security risks automatically.
      </p>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Supports</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">JS / TS</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">Python</span>
      </div>
    </div>
  );
}
