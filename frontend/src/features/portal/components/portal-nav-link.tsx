"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./portal-nav-link.module.css";

type Props = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
};

export function PortalNavLink({ href, icon, children }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(styles.link, isActive && styles.linkActive)}
    >
      <span className={cn(styles.iconWrap, isActive && styles.iconWrapActive)}>{icon}</span>
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
