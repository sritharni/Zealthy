import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import styles from "./textarea.module.css";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(styles.textarea, className)} {...props} />;
});
