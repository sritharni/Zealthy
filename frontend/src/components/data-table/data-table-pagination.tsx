"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PageSize } from "@/lib/http/pagination";

import styles from "./data-table-pagination.module.css";

type DataTablePaginationProps = {
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (_pageSize: PageSize) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange: _onPageSizeChange,
}: DataTablePaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={styles.root}>
      <p className={styles.summary}>
        {total === 0
          ? "No results"
          : `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()}`}
      </p>
      <div className={styles.controls}>
        <div className={styles.pager}>
          <Button
            variant="outline"
            size="icon"
            className={styles.pagerButton}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className={styles.icon} />
          </Button>
          <span className={styles.pagerLabel}>
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className={styles.pagerButton}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className={styles.icon} />
          </Button>
        </div>
      </div>
    </div>
  );
}
