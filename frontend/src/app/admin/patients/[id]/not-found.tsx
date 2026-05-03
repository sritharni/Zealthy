import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import styles from "./not-found.module.css";

export default function PatientNotFound() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Patient not found</h1>
      <p className={styles.description}>
        The patient you’re looking for may have been removed or never existed.
      </p>
      <Button asChild>
        <Link href={routes.admin.root}>Back to patients</Link>
      </Button>
    </div>
  );
}
