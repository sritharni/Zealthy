"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/http/api-error";
import { cn } from "@/lib/utils";

import styles from "./error-state.module.css";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
};

function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn(styles.root, className)} role="alert">
      <div className={styles.iconWrap}>
        <AlertTriangle className={styles.icon} aria-hidden />
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>Something went wrong</h3>
        <p className={styles.description}>{describeError(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
