import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#08080A] px-4 text-center text-[#f4f4f5]">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This URL does not exist, or an old dev server is running on this port.
        Open the app from the correct project folder and try again.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-[#333335] bg-[#1A1A1E] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[#3B82F6]/50"
      >
        <ArrowLeft className="size-4" />
        Back to Term Sheet Decoder
      </Link>
    </main>
  );
}
