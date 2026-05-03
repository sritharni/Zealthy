import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./form-section.module.css";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn(styles.root, className)}>
      <div className={styles.headingGroup}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <div className={styles.fields}>{children}</div>
    </section>
  );
}
