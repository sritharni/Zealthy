import type { Metadata } from "next";
import { type ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";

import "./globals.css";
import styles from "./layout.module.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s · ${APP_CONFIG.shortName}`,
  },
  description: APP_CONFIG.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={styles.body}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
