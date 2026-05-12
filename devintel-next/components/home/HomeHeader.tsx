'use client';

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
        Repository <br />{" "}
        <span className="text-primary italic">Intelligence</span>
      </h1>
      <p className="text-white/40 text-lg leading-relaxed max-w-md">
        Deep architectural analysis for modern TypeScript repositories. Identify
        hotspots, tech debt, and security leaks in seconds.
      </p>
    </div>
  );
}
