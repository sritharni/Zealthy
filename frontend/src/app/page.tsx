import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/config/routes";
import { getPatientSession } from "@/lib/auth/session";
import { LoginForm } from "@/features/auth/components/login-form";

import styles from "./page.module.css";

export default async function HomePage() {
  const session = await getPatientSession();
  if (session) {
    redirect(routes.portal.dashboard);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1 className={styles.title}>ZEALTHY</h1>
          <p className={styles.tagline}>
            A modern patient platform for seamless, real-world healthcare.
          </p>
        </section>

        <section className={styles.formSection}>
          <LoginForm />
          <p className={styles.note}>
            Demo credentials · <code>mark@some-email-provider.net</code> ·{" "}
            <code>Password123!</code>
          </p>
          <Link href={routes.admin.root} className={styles.adminLink}>
            Open admin EMR
            <ArrowRight className={styles.adminLinkIcon} aria-hidden />
          </Link>
        </section>
      </div>
    </main>
  );
}
