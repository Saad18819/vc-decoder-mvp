import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupContinueButton } from "@/components/signup-continue-button";

export const metadata: Metadata = {
  title: "Sign up | Term Sheet Decoder",
  description: "Create an account for Term Sheet Decoder.",
};

export default function SignupPage() {
  return (
    <main className="relative min-h-screen bg-[#08080A] px-4 py-10 text-[#f4f4f5] md:px-6 md:py-14">
      <header className="mx-auto mb-10 flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#333335] bg-[#161618]/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Scale className="size-3.5 text-[#3B82F6]" aria-hidden />
          New workspace
        </span>
      </header>
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Create your{" "}
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
            account
          </span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sign up will connect to your auth provider later. For now, continue to
          the analyzer.
        </p>
        <Card className="mt-8 border-[#333335] bg-[#1A1A1E]/90 p-1 text-left shadow-xl backdrop-blur">
          <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
            <CardTitle className="text-lg">Coming soon</CardTitle>
            <CardDescription>
              OAuth or email verification can plug in here without changing the
              decoder UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <SignupContinueButton />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[#3B82F6] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
