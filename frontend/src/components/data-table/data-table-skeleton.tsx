import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import styles from "./data-table-skeleton.module.css";

type DataTableSkeletonProps = {
  columnCount: number;
  rowCount?: number;
};

export function DataTableSkeleton({ columnCount, rowCount = 8 }: DataTableSkeletonProps) {
  return (
    <>
      <div className={styles.desktop}>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className={styles.headSkeleton} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className={styles.cellSkeleton} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={styles.mobile}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton className={styles.lineHalf} />
            <Skeleton className={styles.lineThreeQuarter} />
            <Skeleton className={styles.lineTwoThird} />
          </div>
        ))}
      </div>
    </>
  );
}
