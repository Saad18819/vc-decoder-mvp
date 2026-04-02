"use client";

import { useRouter } from "next/navigation";
import { setSession } from "@/lib/auth-session";

export function SignupContinueButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        setSession("New workspace member");
        router.push("/");
      }}
      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#3B82F6] text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
    >
      Go to Term Sheet Decoder
    </button>
  );
}
