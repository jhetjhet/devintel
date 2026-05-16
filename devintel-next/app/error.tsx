"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error happened. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-border text-foreground hover:bg-muted transition"
          >
            Return home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-muted-foreground break-words">
            {error.message}
          </p>
        )}
      </div>
    </main>
  );
}
