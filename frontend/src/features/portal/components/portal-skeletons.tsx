import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./portal-skeletons.module.css";

export function PortalDashboardSkeleton() {
  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-9 w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />
      </section>

      <div className={styles.summaryGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-3xl">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-12" />
              </div>
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={styles.twoColumnGrid}>
        <Card className="rounded-3xl">
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[90px_1fr] gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-2xl border p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-2xl border p-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function PortalListSkeleton({
  titleWidth = "w-44",
  rows = 4,
  sections = 1,
}: {
  titleWidth?: string;
  rows?: number;
  sections?: number;
}) {
  return (
    <div className={styles.root}>
      <section className={styles.listIntro}>
        <Skeleton className={`h-9 ${titleWidth}`} />
        <Skeleton className="h-4 w-full max-w-md" />
      </section>

      {Array.from({ length: sections }).map((_, sectionIdx) => (
        <Card key={sectionIdx} className="rounded-3xl">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
