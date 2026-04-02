import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Term Sheet Decoder",
  description:
    "Sign in to Term Sheet Decoder — VC clause intelligence for founders.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-[#08080A] text-[#f4f4f5]">
      <LoginForm />
    </main>
  );
}
