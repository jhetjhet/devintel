"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { login, register } from "@/app/actions/authentication";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setIsLoading(true);

    if (mode === "signup") {
      const response = await register({
        full_name: fullName,
        email,
        password,
      });

      if (!response.success) {
        setErrorMessage(response.error.message || "Unable to register.");
        setIsLoading(false);
        return;
      }

      const loginResponse = await login({ email, password });

      if (!loginResponse.success) {
        setErrorMessage(loginResponse.error.message || "Account created, but sign in failed.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setPassword("");
      onClose();
      return;
    }

    const response = await login({ email, password });

    if (!response.success) {
      setErrorMessage(response.error.message || "Invalid email or password.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setPassword("");
    onClose();
  };

  const toggleMode = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  const closeModal = () => {
    setErrorMessage(null);
    setPassword("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      return;
    }

    if (initialMode === "signin") {
      setFullName("");
    }
  }, [isOpen, initialMode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={closeModal}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {mode === "signin" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  {mode === "signin"
                    ? "Sign in to continue your audits"
                    : "Start your journey with us today"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* <div className="space-y-4 mb-8 relative z-10">
              <button
                type="button"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 flex items-center justify-center gap-3 text-white text-sm font-bold transition-all group"
              >
                <Github size={18} className="text-white/60 group-hover:text-white" />
                Continue with GitHub
              </button>
              <button
                type="button"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 flex items-center justify-center gap-3 text-white text-sm font-bold transition-all group"
              >
                <Chrome size={18} className="text-white/60 group-hover:text-white" />
                Continue with Google
              </button>
            </div>

            <div className="relative mb-8 z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono tracking-widest">
                <span className="bg-surface px-4 text-white/20">or email</span>
              </div>
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {mode === "signup" && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                  />
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-destructive">{errorMessage}</p>
              )}

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-white/40 text-sm relative z-10">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => toggleMode("signup")}
                    className="text-primary font-bold hover:underline"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => toggleMode("signin")}
                    className="text-primary font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
