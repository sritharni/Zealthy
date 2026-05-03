import { redirect } from "next/navigation";
import { CalendarDays, LayoutDashboard, Pill } from "lucide-react";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app";
import { routes } from "@/config/routes";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { PortalNavLink } from "@/features/portal/components/portal-nav-link";
import { getPatientSession } from "@/lib/auth/session";

import styles from "./layout.module.css";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getPatientSession();
  if (!session) {
    redirect(routes.home);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.identity}>
            <div className={styles.brandPill}>
              {APP_CONFIG.shortName}
            </div>
            <div>
              <p className="font-medium tracking-tight">{session.firstName} {session.lastName}</p>
              <p className="text-sm text-muted-foreground">{session.email}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Badge variant="outline">Patient Portal</Badge>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <PortalNavLink href={routes.portal.dashboard} icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </PortalNavLink>
          <PortalNavLink href={routes.portal.appointments} icon={<CalendarDays className="h-4 w-4" />}>
            Appointments
          </PortalNavLink>
          <PortalNavLink href={routes.portal.prescriptions} icon={<Pill className="h-4 w-4" />}>
            Prescriptions
          </PortalNavLink>
        </aside>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
