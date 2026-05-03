"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./data-table-sort-button.module.css";

type Props<TSortField extends string> = {
  field: TSortField;
  activeField: TSortField;
  direction: "asc" | "desc";
  onToggle: (field: TSortField) => void;
  children: ReactNode;
  align?: "left" | "right";
};

export function DataTableSortButton<TSortField extends string>({
  field,
  activeField,
  direction,
  onToggle,
  children,
  align = "left",
}: Props<TSortField>) {
  const isActive = field === activeField;
  const Icon = !isActive ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={cn(styles.button, align === "right" && styles.alignRight)}
      aria-label={`${String(children)}${isActive ? ` sorted ${direction}` : ""}`}
    >
      {children}
      <Icon
        className={cn(styles.icon, isActive ? styles.iconActive : styles.iconInactive)}
        aria-hidden
      />
    </button>
  );
}
