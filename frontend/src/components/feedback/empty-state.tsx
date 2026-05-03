import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./empty-state.module.css";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.root, className)}>
      {Icon ? (
        <div className={styles.iconWrap}>
          <Icon className={styles.icon} aria-hidden />
        </div>
      ) : null}
      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
