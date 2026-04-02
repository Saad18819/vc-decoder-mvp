"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Copy,
  Check,
  Loader2,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RiskGauge } from "@/components/risk-gauge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AnalysisResult } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

function riskExposureClass(score: number): string {
  if (score < 30) return "text-[#10B981]";
  if (score <= 60) return "text-[#EAB308]";
  return "text-[#EF4444]";
}

function PlainEnglishVerdict({ score }: { score: number }) {
  if (score < 30) {
    return (
      <Alert className="border-[#10B981]/40 bg-[#10B981]/10 text-left [&>svg]:text-[#10B981]">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        <AlertTitle className="text-[#10B981]">Plain-English verdict</AlertTitle>
        <AlertDescription className="text-foreground/90">
          Founder Friendly: This aligns with standard market terms.
        </AlertDescription>
      </Alert>
    );
  }
  if (score > 60) {
    return (
      <Alert
        variant="destructive"
        className="border-[#EF4444]/45 bg-[#EF4444]/10 text-left [&>svg]:text-[#EF4444]"
      >
        <CircleAlert className="size-4 shrink-0" aria-hidden />
        <AlertTitle className="text-[#EF4444]">Plain-English verdict</AlertTitle>
        <AlertDescription className="text-foreground/90">
          Aggressive Terms: These provisions favor the investor significantly.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="border-[#EAB308]/40 bg-[#EAB308]/10 text-left [&>svg]:text-[#EAB308]">
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      <AlertTitle className="text-[#EAB308]">Plain-English verdict</AlertTitle>
      <AlertDescription className="text-foreground/90">
        Mixed terms: Review key provisions with counsel before signing.
      </AlertDescription>
    </Alert>
  );
}

function buildExportText(r: AnalysisResult): string {
  return [
    `Term Sheet Decoder — Snapshot`,
    `Risk index: ${r.riskScore} (${r.riskLabel})`,
    "",
    r.summary,
    "",
    "--- Verdicts ---",
    ...r.verdicts.map(
      (v) =>
        `${v.title}\nImpact: ${v.impact}\nCounter-offer: ${v.counterOffer}`
    ),
    "",
    "--- Negotiation tips ---",
    ...r.negotiationTips.map((t) => `${t.title}: ${t.body}`),
  ].join("\n");
}

const placeholder =
  "Paste your 'Liquidation Preference' clause here… (or Anti-dilution, Board rights, etc.)";

export function TermSheetDecoder() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 160), 420)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  useEffect(() => {
    setCopied(false);
  }, [result]);

  async function runAnalysis() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setResult(data as AnalysisResult);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-6 md:pt-14">
      <header className="mb-12 text-center md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#333335] bg-[#161618]/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Scale className="size-3.5 text-[#3B82F6]" aria-hidden />
          Legal-tech MVP · Term sheet intelligence
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl"
        >
          Venture Capital Term Sheet{" "}
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
            Decoder
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          Paste any clause. Get a risk index, plain-English verdicts, and
          negotiation-ready counter-offers—corporate, calm, and built for
          founders under pressure.
        </motion.p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-[#333335] bg-[#1A1A1E]/90 shadow-xl shadow-black/20 backdrop-blur">
            <CardHeader className="px-5 pt-5 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-4 text-[#3B82F6]" />
                Clause input
              </CardTitle>
              <CardDescription>
                Auto-expanding field. Your text is analyzed server-side; do not
                paste confidential deal terms you cannot share with your model
                provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <Textarea
                ref={taRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="min-h-[160px] resize-none border-[#333335] bg-[#111113]/60 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={runAnalysis}
                  disabled={loading || !text.trim()}
                  className="h-9 bg-[#3B82F6] px-5 text-primary-foreground hover:bg-[#2563EB]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      Analyze clause
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-[#EF4444]">
                  <AlertTriangle className="size-4 shrink-0" />
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.section>

        <aside className="lg:sticky lg:top-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="gauge"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 26 }}
              >
                <Card className="border-[#333335] bg-[#161618]/95 backdrop-blur">
                  <CardHeader className="px-5 pb-2 pt-5 text-center sm:px-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Snapshot
                    </CardTitle>
                    <p
                      className={cn(
                        "font-heading text-2xl font-semibold tracking-tight",
                        riskExposureClass(result.riskScore)
                      )}
                    >
                      {result.riskLabel} exposure
                    </p>
                    {result.highRiskFlagged && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#EF4444]">
                        <AlertTriangle className="size-3" />
                        High risk flagged
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 pb-5 pt-0 sm:px-6">
                    <RiskGauge value={result.riskScore} />
                    <PlainEnglishVerdict score={result.riskScore} />
                    <Progress
                      value={result.riskScore}
                      className="w-full flex-col gap-1 px-0 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-[#2a2a30] [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#10B981] [&_[data-slot=progress-indicator]]:via-[#3B82F6] [&_[data-slot=progress-indicator]]:to-[#EF4444]"
                    />
                    <p className="text-center text-sm leading-relaxed text-muted-foreground">
                      {result.summary}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          buildExportText(result)
                        );
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full border-[#333335] bg-[#111113]/50 hover:bg-[#1A1A1E]"
                    >
                      {copied ? (
                        <>
                          <Check className="size-4 text-[#10B981]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copy snapshot to clipboard
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-dashed border-[#333335] bg-[#161618]/40 p-8 text-center text-sm text-muted-foreground"
              >
                <ShieldCheck className="mx-auto mb-3 size-10 text-[#3B82F6]/60" />
                Run an analysis to see your risk index and structured verdicts
                here.
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-12 space-y-10"
          >
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
                <AlertTriangle className="size-5 text-[#F59E0B]" />
                Verdicts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.verdicts.map((v, i) => (
                  <motion.div
                    key={`${v.title}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i }}
                  >
                    <Card
                      className={`h-full border-[#333335] bg-[#1A1A1E]/90 ${
                        v.tone === "danger"
                          ? "ring-1 ring-[#EF4444]/35"
                          : v.tone === "safe"
                            ? "ring-1 ring-[#10B981]/30"
                            : ""
                      }`}
                    >
                      <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
                        <CardTitle className="text-base leading-snug">
                          {v.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-5 pb-5 text-sm leading-relaxed sm:px-6">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Impact
                          </p>
                          <p className="text-foreground/90">{v.impact}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6]">
                            Counter-offer
                          </p>
                          <p className="text-foreground/90">{v.counterOffer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
                <BookOpen className="size-5 text-[#3B82F6]" />
                Negotiation tips
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.negotiationTips.map((tip, i) => (
                  <motion.div
                    key={`${tip.title}-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Card className="border-[#333335] bg-[#161618]/90">
                      <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
                        <CardTitle className="text-sm font-medium">
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 pt-0 text-sm leading-relaxed text-muted-foreground sm:px-6">
                        {tip.body}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
