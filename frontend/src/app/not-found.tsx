import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Button asChild>
          <Link href={routes.admin.root}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
