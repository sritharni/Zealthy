"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes, apiRoutes } from "@/config/routes";
import { setAccessTokenCookie } from "@/lib/auth/token";
import { apiClient } from "@/lib/http/api-client";

import { LoginSchema, type AuthSession, type LoginInput } from "../schema";
import styles from "./login-form.module.css";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "mark@some-email-provider.net",
      password: "Password123!",
    },
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginInput) => {
      const { data } = await apiClient.post<AuthSession>(apiRoutes.auth.login, values);
      return data;
    },
    onSuccess: (session) => {
      setAccessTokenCookie(session.accessToken);
      toast.success("Welcome back");
      router.push(routes.portal.dashboard);
      router.refresh();
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed");
    }
  });

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <div className={styles.iconWrap}>
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div className={styles.heading}>
          <CardTitle className="text-2xl tracking-tight">Patient sign in</CardTitle>
          <CardDescription>
            Use seeded demo credentials or any patient account created in the admin EMR.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className={styles.form} onSubmit={submit} noValidate>
          <FormField form={form} name="email" label="Email" required>
            <Input type="email" autoComplete="email" />
          </FormField>
          <FormField form={form} name="password" label="Password" required>
            <Input type="password" autoComplete="current-password" />
          </FormField>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            <LogIn className="h-4 w-4" />
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
