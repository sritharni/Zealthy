import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import shared from "../_shared.module.css";

export default function Loading() {
  return (
    <div className={shared.stack}>
      <Skeleton className={shared.skeletonBack} />
      <div className={shared.headingSkeletonGroup}>
        <Skeleton className={shared.skeletonHeading} />
        <Skeleton className={shared.skeletonSubheading} />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className={shared.cardSkeletonHeader} />
        </CardHeader>
        <CardContent className={shared.cardGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={shared.fieldSkeletonGroup}>
              <Skeleton className={shared.fieldLabelSkeleton} />
              <Skeleton className={shared.fieldInputSkeleton} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
