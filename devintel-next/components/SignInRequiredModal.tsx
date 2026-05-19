"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface SignInRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export function SignInRequiredModal({
  isOpen,
  onClose,
  onSignIn,
}: SignInRequiredModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                    <ShieldAlert size={18} />
                  </span>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-white/80">
                    Sign In Required
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-2">
                <p className="text-white/60 text-sm leading-relaxed">
                  You need to sign in to analyze repositories and access
                  LLM-assisted code insights.
                </p>
                <p className="text-white/30 text-xs font-mono">
                  Debt, risk &amp; growth signals are available to signed-in users only.
                </p>
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onSignIn}
                  className="flex-1 group"
                >
                  <LogIn
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
