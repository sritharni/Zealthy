import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import styles from "./separator.module.css";

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        styles.separator,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        className,
      )}
      {...props}
    />
  );
}
