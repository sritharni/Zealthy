"use client";

import { type ReactNode } from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortButton } from "@/components/data-table/data-table-sort-button";
import { type DataTableColumn } from "@/components/data-table/types";
import { ErrorState } from "@/components/feedback/error-state";
import { Spinner } from "@/components/feedback/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type PageSize } from "@/lib/http/pagination";
import { cn } from "@/lib/utils";

import styles from "./data-table.module.css";

type DataTableProps<TRow, TSortField extends string> = {
  getRowId: (row: TRow) => string;
  columns: DataTableColumn<TRow, TSortField>[];
  rows: TRow[] | undefined;

  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  sort: TSortField;
  direction: "asc" | "desc";

  isLoading: boolean;
  isFetching: boolean;
  error: unknown;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  onSortChange: (field: TSortField) => void;
  onRetry?: () => void;

  onRowClick?: (row: TRow) => void;

  emptyState: ReactNode;
};

export function DataTable<TRow, TSortField extends string>({
  getRowId,
  columns,
  rows,
  page,
  pageSize,
  total,
  totalPages,
  sort,
  direction,
  isLoading,
  isFetching,
  error,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRetry,
  onRowClick,
  emptyState,
}: DataTableProps<TRow, TSortField>) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isLoading || rows === undefined) {
    return <DataTableSkeleton columnCount={columns.length} rowCount={pageSize} />;
  }

  if (rows.length === 0) {
    return <>{emptyState}</>;
  }

  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <div className={styles.root}>
      <div className={styles.tableArea}>
        {isFetching ? (
          <div className={styles.spinner}>
            <Spinner />
          </div>
        ) : null}

        <div className={styles.desktop}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(column.className, column.headerClassName)}
                  >
                    {column.sortField ? (
                      <DataTableSortButton
                        field={column.sortField}
                        activeField={sort}
                        direction={direction}
                        onToggle={onSortChange}
                      >
                        {column.header}
                      </DataTableSortButton>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && styles.rowClickable)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul className={styles.mobile}>
          {rows.map((row) => (
            <li key={getRowId(row)}>
              <button
                type="button"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                disabled={!onRowClick}
                className={cn(styles.mobileItem, onRowClick && styles.mobileItemClickable)}
              >
                <dl className={styles.dl}>
                  {mobileColumns.map((column, idx) => (
                    <div
                      key={column.id}
                      className={cn(styles.dlRow, idx === 0 && styles.dlRowFirst)}
                    >
                      <dt className={styles.dt}>{column.mobileLabel ?? column.header}</dt>
                      <dd className={cn(styles.dd, idx === 0 && styles.ddFirst)}>
                        {column.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
