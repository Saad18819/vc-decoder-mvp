"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clearSession,
  getEmailInitial,
  getSession,
  type AuthSession,
} from "@/lib/auth-session";

export function ProfileClient() {
  const router = useRouter();
  const [session, setS] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    setS(getSession());
  }, []);

  function signOut() {
    clearSession();
    router.push("/");
  }

  if (session === undefined) {
    return (
      <div className="mx-auto max-w-md py-12 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="mx-auto max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Sign in
        </Link>
        <Card className="border-[#333335] bg-[#1A1A1E]/90">
          <CardHeader className="px-5 pt-5 sm:px-6">
            <CardTitle>Not signed in</CardTitle>
            <CardDescription>
              Sign in to view your profile, or continue using the analyzer as a
              guest.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB]"
            >
              Sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Decoder
      </Link>
      <Card className="border-[#333335] bg-[#1A1A1E]/90">
        <CardHeader className="px-5 pt-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-[#333335] bg-[#161618] text-lg font-semibold text-[#3B82F6]">
              {getEmailInitial(session.email)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base font-medium leading-snug">
                {session.email}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#333335] bg-[#111113]/60 text-sm font-medium text-foreground transition-colors hover:border-[#EF4444]/40 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
