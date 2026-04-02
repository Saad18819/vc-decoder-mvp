import { SiteHeaderNav } from "@/components/site-header-nav";
import { TermSheetDecoder } from "@/components/term-sheet-decoder";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#08080A] text-[#f4f4f5]">
      <SiteHeaderNav />
      <TermSheetDecoder />
    </main>
  );
}
