import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { type ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";
import { routes } from "@/config/routes";

import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden>
        <div className={styles.orbOne} />
        <div className={styles.orbTwo} />
        <div className={styles.orbThree} />
        <div className={styles.gridGlow} />
        <div className={styles.lightTrail} />
      </div>
      <AdminNav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function AdminNav() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={routes.admin.root} className={styles.brand}>
          <Stethoscope className={styles.brandIcon} aria-hidden />
          <span>
            {APP_CONFIG.shortName} <span className={styles.brandSuffix}>EMR</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
