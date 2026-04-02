"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getEmailInitial, getSession, type AuthSession } from "@/lib/auth-session";

export function SiteHeaderNav() {
  const [auth, setAuth] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    function sync() {
      setAuth(getSession());
    }
    sync();
    window.addEventListener("tsd-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tsd-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (auth === undefined) {
    return (
      <nav className="fixed right-0 top-0 z-50 flex h-[52px] items-center px-4 md:px-6" />
    );
  }

  if (auth) {
    return (
      <nav className="fixed right-0 top-0 z-50 flex items-center gap-2 px-4 py-4 md:gap-3 md:px-6">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/profile"
            aria-label="Account"
            title="Account"
            className="inline-flex size-9 items-center justify-center rounded-full border border-[#3B82F6]/45 bg-[#161618]/90 text-sm font-semibold text-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.12)] backdrop-blur transition-colors hover:border-[#3B82F6]/70 hover:bg-[#1A1A1E]"
          >
            {getEmailInitial(auth.email)}
          </Link>
        </motion.div>
      </nav>
    );
  }

  return (
    <nav className="fixed right-0 top-0 z-50 flex items-center gap-2 px-4 py-4 md:gap-3 md:px-6">
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/login"
          className="inline-flex rounded-lg border border-[#3B82F6]/45 bg-[#161618]/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-[0_0_0_1px_rgba(59,130,246,0.12)] backdrop-blur transition-colors hover:border-[#3B82F6]/70 hover:bg-[#1A1A1E]"
        >
          Sign in
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/signup"
          className="inline-flex rounded-lg border border-[#333335] bg-[#161618]/80 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-[#3B82F6]/40 hover:bg-[#1A1A1E]"
        >
          Sign up
        </Link>
      </motion.div>
    </nav>
  );
}
