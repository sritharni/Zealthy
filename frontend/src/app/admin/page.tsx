import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/feedback/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { PatientTable } from "@/features/patients/components/patient-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Patients",
};

export default function AdminPatientsPage() {
  return (
    <div className={styles.stack}>
      <PageHeader
        title="Patients"
        description="View, search, and manage every patient in the system."
        actions={
          <Button asChild>
            <Link href={routes.admin.patients.new}>
              <Plus className={styles.icon} aria-hidden />
              New patient
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
        <PatientTable />
      </Suspense>
    </div>
  );
}
