import { type ReactNode } from "react";

export type DataTableColumn<TRow, TSortField extends string> = {
  /** Stable id used for keys; also used as `data-column` for tests. */
  id: string;
  /** Header label. */
  header: ReactNode;
  /** Cell renderer. Receives the full row. */
  cell: (row: TRow) => ReactNode;
  /** If provided, header is clickable and toggles sort. */
  sortField?: TSortField;
  /** Per-column className (applied to both <th> and <td>). */
  className?: string;
  /** Header className override (for narrow numeric columns, etc). */
  headerClassName?: string;
  /** When responsive cards collapse, this label sits before the value. */
  mobileLabel?: ReactNode;
  /** Hide this column from the responsive card layout. */
  hideOnMobile?: boolean;
};