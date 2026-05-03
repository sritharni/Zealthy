import { Skeleton } from "@/components/ui/skeleton";
import { PatientDetailSkeleton } from "@/features/patients/components/patient-detail-skeleton";

import shared from "../_shared.module.css";

export default function Loading() {
  return (
    <div className={shared.stack}>
      <Skeleton className={shared.skeletonBack} />
      <PatientDetailSkeleton />
    </div>
  );
}
