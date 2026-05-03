"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import styles from "./error.module.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          An unexpected error occurred. Try again, or refresh the page if this keeps happening.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
