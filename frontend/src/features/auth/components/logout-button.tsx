"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiRoutes, routes } from "@/config/routes";
import { clearAccessTokenCookie } from "@/lib/auth/token";
import { apiClient } from "@/lib/http/api-client";
import styles from "./logout-button.module.css";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className={styles.button}
      onClick={async () => {
        await apiClient.post(apiRoutes.auth.logout);
        clearAccessTokenCookie();
        router.push(routes.home);
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
