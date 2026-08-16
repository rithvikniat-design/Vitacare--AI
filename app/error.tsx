"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-4xl font-bold text-foreground mb-4">Something went wrong</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error while processing your request. Please try again.
      </p>
      <Button size="lg" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
