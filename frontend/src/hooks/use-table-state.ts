"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/http/pagination";

export type SortDirection = "asc" | "desc";

export type TableState<TSortField extends string> = {
  q: string;
  page: number;
  pageSize: PageSize;
  sort: TSortField;
  dir: SortDirection;
};

export type TableStateUpdate<TSortField extends string> = Partial<TableState<TSortField>>;

type Options<TSortField extends string> = {
  defaultSort: TSortField;
  defaultDir?: SortDirection;
  allowedSortFields: readonly TSortField[];
};

const isPageSize = (value: number): value is PageSize =>
  (PAGE_SIZE_OPTIONS as readonly number[]).includes(value);

/**
 * URL-synced table state for paginated, searchable, sortable lists.
 *
 * - Source of truth is the URL — back/forward, refresh, and copy/paste all
 *   work as expected.
 * - `setState` accepts a partial; any change to filters resets `page` to 1
 *   so users never get stranded on an empty page.
 */
export function useTableState<TSortField extends string>({
  defaultSort,
  defaultDir = "asc",
  allowedSortFields,
}: Options<TSortField>): {
  state: TableState<TSortField>;
  setState: (update: TableStateUpdate<TSortField>) => void;
  toggleSort: (field: TSortField) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const state = useMemo<TableState<TSortField>>(() => {
    const rawSort = params.get("sort");
    const sort = (allowedSortFields as readonly string[]).includes(rawSort ?? "")
      ? (rawSort as TSortField)
      : defaultSort;

    const rawDir = params.get("dir");
    const dir: SortDirection = rawDir === "desc" ? "desc" : rawDir === "asc" ? "asc" : defaultDir;

    const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
    const rawPageSize = Number(params.get("pageSize") ?? DEFAULT_PAGE_SIZE);
    const pageSize: PageSize = isPageSize(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE;

    return {
      q: params.get("q") ?? "",
      page,
      pageSize,
      sort,
      dir,
    };
  }, [allowedSortFields, defaultDir, defaultSort, params]);

  const setState = useCallback(
    (update: TableStateUpdate<TSortField>) => {
      const next = new URLSearchParams(params.toString());
      const resetsPage =
        update.q !== undefined ||
        update.pageSize !== undefined ||
        update.sort !== undefined ||
        update.dir !== undefined;

      const merged: TableState<TSortField> = {
        ...state,
        ...update,
        page: resetsPage ? 1 : (update.page ?? state.page),
      };

      assignParam(next, "q", merged.q, "");
      assignParam(next, "page", String(merged.page), "1");
      assignParam(next, "pageSize", String(merged.pageSize), String(DEFAULT_PAGE_SIZE));
      assignParam(next, "sort", merged.sort, defaultSort);
      assignParam(next, "dir", merged.dir, defaultDir);

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [defaultDir, defaultSort, params, pathname, router, state],
  );

  const toggleSort = useCallback(
    (field: TSortField) => {
      const sameField = state.sort === field;
      setState({
        sort: field,
        dir: sameField ? (state.dir === "asc" ? "desc" : "asc") : "asc",
      });
    },
    [setState, state.dir, state.sort],
  );

  return { state, setState, toggleSort };
}

function assignParam(
  target: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string,
): void {
  if (value === "" || value === defaultValue) {
    target.delete(key);
    return;
  }
  target.set(key, value);
}