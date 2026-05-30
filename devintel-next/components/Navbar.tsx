"use client";

import { AuthUser } from "@/types/auth";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useState, useTransition } from "react";
import { ChartBar, User } from "lucide-react";
import { signOut } from "@/app/actions/authentication";
import { useRouter } from "next/navigation";

type NavbarProps = {
  user: AuthUser | null;
};

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const [signoutPending, startSignoutTransition] = useTransition();

  const openAuth = (mode: "signin" | "signup") => {
    setIsAuthModalOpen(true);
    setAuthMode(mode);
  };

  const handleSignOut = () => {
    startSignoutTransition(async () => {
      await signOut();
    });
  }

  return (
    <nav className="w-full">
      <div className="absolute top-0 right-0 p-8 z-[50]">
        {user && (
          <div className="flex gap-4">
            <Button
              onClick={handleSignOut}
              variant="text"
              size="sm"
              disabled={signoutPending}
            >
              {signoutPending ? "Signing Out..." : "Sign Out"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reports")}
            >
              <ChartBar size={14} />
              Rports
            </Button>
          </div>
        )}

        {!user && (
          <div className="flex gap-4">
            <Button onClick={() => openAuth("signin")} variant="text" size="sm">
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAuth("signup")}
            >
              <User size={14} />
              Get Started
            </Button>
          </div>
        )}
      </div>

      {!user && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </nav>
  );
}
