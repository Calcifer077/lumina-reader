"use client";

import { useEffect } from "react";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
          <AlertTriangle className="h-8 w-8 text-on-error-container" />
        </div>

        <h1 className="font-heading text-headline-md text-on-surface mb-2">
          Something went wrong
        </h1>

        <p className="font-body text-body-md text-on-surface-variant mb-1">
          An unexpected error occurred while loading this page.
        </p>

        {error.digest && (
          <p className="font-label text-label-sm text-outline mb-6">
            Error reference: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-label text-label-md font-medium transition-opacity hover:opacity-90 active:opacity-80"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/library"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-surface-container text-on-surface border border-outline-variant px-5 py-2.5 font-label text-label-md font-medium transition-colors hover:bg-surface-high"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
