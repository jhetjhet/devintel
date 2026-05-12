'use client';

import { motion } from 'motion/react';
import { Search, Terminal, ArrowRight, Activity, Shield, BrainCircuit } from 'lucide-react';

export default function HomeIconCards() {
  return [
    {
      icon: <Search />,
      label: "Hotspot Detection",
      desc: "Identify high-pain files",
    },
    {
      icon: <Shield />,
      label: "Security Guard",
      desc: "Zero-day leak prevention",
    },
    {
      icon: <BrainCircuit />,
      label: "AI Refactor Lab",
      desc: "Automated logic cleaning",
    },
    {
      icon: <Activity />,
      label: "Health Scoring",
      desc: "Deterministic metrics",
    },
  ].map((feat, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.1 }}
      className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors"
    >
      <div className="text-white/40 mb-3">{feat.icon}</div>
      <h3 className="text-sm font-bold text-white mb-1">{feat.label}</h3>
      <p className="text-xs text-white/40">{feat.desc}</p>
    </motion.div>
  ));
}
