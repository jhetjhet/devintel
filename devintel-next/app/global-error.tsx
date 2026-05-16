"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center px-6 bg-surface">
        <main className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            A critical error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Reload
          </button>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-muted-foreground break-words">
              {error.message}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
