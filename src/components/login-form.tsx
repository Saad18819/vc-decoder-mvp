"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock, Mail, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { setSession } from "@/lib/auth-session";

const inputClass = cn(
  "h-10 w-full min-w-0 rounded-lg border border-[#333335] bg-[#111113]/60 pl-9 pr-2.5 text-[15px] text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground/70",
  "focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
);

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // MVP: no backend — brief delay then continue to app
    window.setTimeout(() => {
      setLoading(false);
      const id = email.trim() || "Signed in";
      setSession(id);
      router.push("/");
    }, 600);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#08080A] px-4 py-10 md:px-6 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-10 flex w-full max-w-md items-center justify-between"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#333335] bg-[#161618]/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Scale className="size-3.5 text-[#3B82F6]" aria-hidden />
          Secure access
        </span>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Sign in to{" "}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              Decoder
            </span>
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Use your workspace email. This MVP UI demo continues to the analyzer
            after sign-in—wire your auth provider when you are ready.
          </p>
        </div>

        <Card className="border-[#333335] bg-[#1A1A1E]/90 shadow-xl shadow-black/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="size-4 text-[#3B82F6]" />
              Credentials
            </CardTitle>
            <CardDescription>
              Encrypted connection recommended for real term sheet data in
              production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password" className="text-muted-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#3B82F6] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to your organization&apos;s data handling
          policies.{" "}
          <Link href="/" className="text-[#3B82F6] hover:underline">
            Skip to analyzer
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
