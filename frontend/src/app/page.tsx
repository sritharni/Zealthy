import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarClock, HeartPulse, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <div className={styles.eyebrow}>Zealthy Patient Portal</div>
          <div className={styles.headingGroup}>
            <h1 className={styles.title}>
              A modern patient platform designed for a seamless, real-world healthcare experience.
            </h1>
            <p className={styles.subtitle}>
              Review upcoming care, medication refills, and your health profile in one place.
              Admins can manage the full EMR at the separate staff workspace.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <FeatureCard
              icon={<CalendarClock className={styles.featureIcon} />}
              title="Smart scheduling"
              description="Recurring appointments are projected automatically for the next 3 months."
            />
            <FeatureCard
              icon={<HeartPulse className={styles.featureIcon} />}
              title="Medication tracking"
              description="Refill plans and active prescriptions stay visible to both staff and patients."
            />
            <FeatureCard
              icon={<ShieldCheck className={styles.featureIcon} />}
              title="Secure access"
              description="Patients can securely sign in and stay logged in safely."
            />
          </div>

          <div className={styles.cta}>
            <Button asChild variant="outline">
              <Link href={routes.admin.root}>
                Open admin EMR
                <ArrowRight className={styles.ctaIcon} />
              </Link>
            </Button>
            <p className={styles.ctaNote}>
              Demo portal credentials are seeded for <code>mark@some-email-provider.net</code> and{" "}
              <code>lisa@some-email-provider.net</code> with password <code>Password123!</code>.
            </p>
          </div>
        </section>

        <section>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className={styles.featureCard}>
      <CardHeader className={styles.featureHeader}>
        <div className={styles.featureIconWrap}>{icon}</div>
        <CardTitle className={styles.featureTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={styles.featureDescription}>{description}</p>
      </CardContent>
    </Card>
  );
}
