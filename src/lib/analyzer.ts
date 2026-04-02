import OpenAI from "openai";

export type VerdictTone = "danger" | "safe" | "neutral";

export type VerdictCard = {
  title: string;
  impact: string;
  counterOffer: string;
  tone: VerdictTone;
};

export type NegotiationTip = {
  title: string;
  body: string;
};

export type AnalysisResult = {
  riskScore: number;
  riskLabel: "Low" | "Moderate" | "Elevated" | "High";
  highRiskFlagged: boolean;
  matchedFlags: string[];
  summary: string;
  verdicts: VerdictCard[];
  negotiationTips: NegotiationTip[];
  analysisSource: "gemini" | "openai" | "heuristic";
};

/** True when "participating" appears but not as part of "non-participating". */
export function hasBareParticipating(text: string): boolean {
  const withoutNp = text.replace(/non[- ]?participating/gi, "");
  return /\bparticipating\b/i.test(withoutNp);
}

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Deterministic score in [15, 25] for non-participating preference clauses. */
function nonParticipatingBand(text: string): number {
  return 15 + (Math.abs(text.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 11);
}

/**
 * Applies keyword rules to any base score (heuristic start or LLM output).
 * - Non-participating (without 2x/3x) → risk in 15–25
 * - Participating (bare) → floor 70+
 * - 1x (without bare participating) → cap low
 * - 2x / 3x / full ratchet → high floors
 */
export function applyKeywordRules(text: string, baseScore: number): number {
  let s = clampScore(baseScore);
  const hasNP = /non[- ]?participating/i.test(text);
  const bareP = hasBareParticipating(text);
  const has2x = /\b2x\b/i.test(text);
  const has3x = /\b3x\b/i.test(text);
  const has1x = /\b1x\b/i.test(text);
  const ratchet = /full\s*ratchet/i.test(text);

  if (has2x) s = Math.max(s, 78);
  if (has3x) s = Math.max(s, 82);
  if (ratchet) s = Math.max(s, 82);

  if (hasNP && !has2x && !has3x) {
    s = nonParticipatingBand(text);
  } else if (bareP) {
    s = Math.max(s, 72);
  }

  if (has1x && !bareP) {
    s = Math.min(s, 25);
  }

  if (hasNP && !has2x && !has3x) {
    s = Math.min(25, Math.max(15, s));
  }

  return clampScore(s);
}

/** Signals for UI and high-risk badges (does not treat non-participating alone as danger). */
export function detectHighRiskFlags(text: string): {
  flagged: boolean;
  matches: string[];
} {
  const matches: string[] = [];
  if (/non[- ]?participating/i.test(text)) {
    matches.push("Non-participating preference");
  }
  if (hasBareParticipating(text)) {
    matches.push("Participating preferred");
  }
  if (/\b1x\b/i.test(text)) matches.push("1x multiple");
  if (/\b2x\b/i.test(text)) matches.push("2x multiple");
  if (/\b3x\b/i.test(text)) matches.push("3x multiple");
  if (/full\s*ratchet/i.test(text)) matches.push("Full ratchet");

  const flagged =
    hasBareParticipating(text) ||
    /\b2x\b|\b3x\b/i.test(text) ||
    /full\s*ratchet/i.test(text);

  return { flagged, matches };
}

function scoreToLabel(score: number): AnalysisResult["riskLabel"] {
  if (score < 30) return "Low";
  if (score < 55) return "Moderate";
  if (score < 75) return "Elevated";
  return "High";
}

const LLM_SYSTEM = `You are an expert venture capital term sheet advisor. Analyze the pasted clause(s) for founder-friendly vs investor-heavy terms.

Important: Distinguish "non-participating" preferred (generally market-standard, lower founder risk) from "participating" preferred (often worse for founders). A 1x non-participating liquidation preference is typically lower risk than 2x/3x or participating structures.

Respond with ONLY valid JSON (no markdown) matching this shape:
{
  "riskScore": number (0-100, higher = worse for founders),
  "summary": string (2 sentences max),
  "verdicts": Array<{ "title": string, "impact": string, "counterOffer": string, "tone": "danger" | "safe" | "neutral" }> (1-4 items),
  "negotiationTips": Array<{ "title": string, "body": string }> (3-5 short plain-English tips)
}

Tone: "danger" for red flags, "safe" for balanced/favorable, "neutral" for context.
Be specific to the text. If the clause is empty or nonsense, still return a conservative assessment.`;

type LlmJson = {
  riskScore?: number;
  summary?: string;
  verdicts?: VerdictCard[];
  negotiationTips?: NegotiationTip[];
};

function extractJsonFromModelText(raw: string): string {
  const t = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  if (fenced) return fenced[1].trim();
  return t;
}

function mergeParsedJsonIntoResult(
  parsed: LlmJson,
  text: string
): Pick<AnalysisResult, "riskScore" | "summary" | "verdicts" | "negotiationTips"> {
  const rawScore = clampScore(Number(parsed.riskScore) || 50);
  const mergedScore = applyKeywordRules(text, rawScore);
  return {
    riskScore: mergedScore,
    summary: String(parsed.summary ?? "").trim() || "Analysis complete.",
    verdicts: normalizeVerdicts(parsed.verdicts),
    negotiationTips: normalizeTips(parsed.negotiationTips),
  };
}

function normalizeVerdicts(v: unknown): VerdictCard[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const tone =
        o.tone === "danger" || o.tone === "safe" || o.tone === "neutral"
          ? o.tone
          : "neutral";
      return {
        title: String(o.title ?? "Assessment"),
        impact: String(o.impact ?? ""),
        counterOffer: String(o.counterOffer ?? ""),
        tone,
      };
    })
    .filter(Boolean) as VerdictCard[];
}

function dedupeVerdictsByTitle(items: VerdictCard[]): VerdictCard[] {
  const seen = new Set<string>();
  const out: VerdictCard[] = [];
  for (const v of items) {
    const key = v.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function dedupeTipsByTitle(items: NegotiationTip[]): NegotiationTip[] {
  const seen = new Set<string>();
  const out: NegotiationTip[] = [];
  for (const t of items) {
    const key = t.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function normalizeTips(v: unknown): NegotiationTip[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      return {
        title: String(o.title ?? "Tip"),
        body: String(o.body ?? ""),
      };
    })
    .filter(Boolean) as NegotiationTip[];
}

async function analyzeWithOpenAI(
  text: string,
  flags: ReturnType<typeof detectHighRiskFlags>
): Promise<Pick<AnalysisResult, "riskScore" | "summary" | "verdicts" | "negotiationTips"> | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return null;

  const client = new OpenAI({ apiKey: key });
  const userPayload = `Clause text:\n"""${text.slice(0, 12000)}"""\n\nAutomated flags (if any): ${JSON.stringify(flags.matches)}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.35,
    messages: [
      { role: "system", content: LLM_SYSTEM },
      { role: "user", content: userPayload },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;

  let parsed: LlmJson;
  try {
    parsed = JSON.parse(extractJsonFromModelText(raw)) as LlmJson;
  } catch {
    return null;
  }

  return mergeParsedJsonIntoResult(parsed, text);
}

async function analyzeWithGemini(
  text: string,
  flags: ReturnType<typeof detectHighRiskFlags>
): Promise<Pick<
  AnalysisResult,
  "riskScore" | "summary" | "verdicts" | "negotiationTips"
> | null> {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) return null;

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: LLM_SYSTEM,
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
    },
  });

  const userPayload = `Clause text:\n"""${text.slice(0, 12000)}"""\n\nAutomated flags (if any): ${JSON.stringify(flags.matches)}`;

  const result = await model.generateContent(userPayload);
  const raw = result.response.text();
  if (!raw) return null;

  let parsed: LlmJson;
  try {
    parsed = JSON.parse(extractJsonFromModelText(raw)) as LlmJson;
  } catch {
    return null;
  }

  return mergeParsedJsonIntoResult(parsed, text);
}

function heuristicAnalysis(
  text: string,
  flags: ReturnType<typeof detectHighRiskFlags>
): Pick<AnalysisResult, "riskScore" | "summary" | "verdicts" | "negotiationTips"> {
  const trimmed = text.trim();
  let base = 28;
  const verdicts: VerdictCard[] = [];
  const tips: NegotiationTip[] = [];

  if (trimmed.length < 20) {
    base = 40;
    verdicts.push({
      title: "Insufficient detail",
      impact:
        "Short snippets are hard to judge; ambiguous language often hides structure.",
      counterOffer: "Paste the full clause and definitions from the term sheet.",
      tone: "neutral",
    });
  }

  base = applyKeywordRules(text, base);

  if (flags.flagged) {
    verdicts.unshift({
      title: "HIGH RISK — Pattern match",
      impact: `Detected: ${flags.matches.filter((m) => !m.startsWith("Non-participating")).join(", ") || flags.matches.join(", ")}. These structures often shift exit economics toward investors.`,
      counterOffer:
        "Push for 1x non-participating preferred, standard broad-based weighted average anti-dilution, and avoid participation when possible.",
      tone: "danger",
    });
  } else if (/non[- ]?participating/i.test(text)) {
    verdicts.unshift({
      title: "Non-participating preference",
      impact:
        "Non-participating preferred typically takes the better of its preference or conversion to common—not both—often closer to market norms than participating.",
      counterOffer:
        "Confirm 1x and that participation is truly off the table in all exit scenarios.",
      tone: "safe",
    });
  }

  if (/liquidation/i.test(text) && !verdicts.some((v) => /liquidation/i.test(v.title))) {
    verdicts.push({
      title: "Liquidation stack",
      impact:
        "Order and multiples determine who gets paid first and how much before common in an exit.",
      counterOffer:
        "Anchor on 1x non-participating as a baseline; watch for participating language elsewhere.",
      tone: flags.flagged ? "danger" : "neutral",
    });
  }

  if (/anti[- ]?dilution/i.test(text)) {
    verdicts.push({
      title: "Anti-dilution",
      impact:
        "Down-round protection can dilute founders and angels if triggered.",
      counterOffer:
        "Prefer broad-based weighted average; avoid full ratchet unless absolutely necessary.",
      tone: /full\s*ratchet/i.test(text) ? "danger" : "neutral",
    });
  }

  if (/drag[- ]?along/i.test(text)) {
    tips.push({
      title: "Drag-along",
      body: "Ensures minority holders can be required to sell in a qualified exit—check thresholds and carve-outs.",
    });
  }

  if (/vesting/i.test(text)) {
    tips.push({
      title: "Vesting",
      body: "Founder vesting protects the cap table; negotiate acceleration on change of control if appropriate.",
    });
  }

  tips.push(
    {
      title: "Non-participating vs participating",
      body: "Non-participating preferred typically takes the better of its liquidation preference or conversion to common—not both.",
    },
    {
      title: "Lawyer review",
      body: "Use this tool for orientation; have counsel review the full document and definitions.",
    }
  );

  const summary = flags.flagged
    ? "Rule-based scan flagged investor-heavy patterns (participating, multiples, or ratchet)."
    : /non[- ]?participating/i.test(text) && !hasBareParticipating(text)
      ? "Non-participating language detected—score anchored in the 15–25 band absent 2x/3x multiples."
      : trimmed.length < 20
        ? "Add more clause text for a richer assessment."
        : "Analysis uses keyword rules and pattern matching for this clause.";

  return {
    riskScore: base,
    summary,
    verdicts: verdicts.slice(0, 5),
    negotiationTips: tips.slice(0, 6),
  };
}

function applyHighRiskRules(
  base: AnalysisResult,
  flags: ReturnType<typeof detectHighRiskFlags>
): AnalysisResult {
  if (!flags.flagged) {
    return {
      ...base,
      highRiskFlagged: false,
      matchedFlags: flags.matches,
      riskLabel: scoreToLabel(base.riskScore),
    };
  }

  let riskScore = Math.max(base.riskScore, 70);
  riskScore = clampScore(riskScore);

  const hasHighRiskTitle = base.verdicts.some((v) =>
    /high\s*risk/i.test(v.title)
  );
  const verdicts = hasHighRiskTitle
    ? base.verdicts
    : [
        {
          title: "HIGH RISK — Automated flag",
          impact: `Keywords matched: ${flags.matches.join(", ")}. Treat as investor-favorable until counsel confirms otherwise.`,
          counterOffer:
            "Negotiate back to market-standard terms (e.g., 1x non-participating; avoid full ratchet).",
          tone: "danger" as const,
        },
        ...base.verdicts,
      ];

  return {
    ...base,
    riskScore,
    riskLabel: scoreToLabel(riskScore),
    highRiskFlagged: true,
    matchedFlags: flags.matches,
    verdicts: verdicts.slice(0, 6),
  };
}

export async function analyzeTermSheet(text: string): Promise<AnalysisResult> {
  const flags = detectHighRiskFlags(text);

  const gemini = await analyzeWithGemini(text, flags).catch(() => null);
  const openai =
    gemini === null
      ? await analyzeWithOpenAI(text, flags).catch(() => null)
      : null;

  const llm = gemini ?? openai;
  const heuristic = heuristicAnalysis(text, flags);

  const basePick = llm ?? heuristic;
  const analysisSource: AnalysisResult["analysisSource"] = gemini
    ? "gemini"
    : openai
      ? "openai"
      : "heuristic";

  const tipsMerged =
    basePick.negotiationTips.length >= 3
      ? basePick.negotiationTips
      : [...basePick.negotiationTips, ...heuristic.negotiationTips];

  const verdictsMerged = basePick.verdicts.length
    ? basePick.verdicts
    : heuristic.verdicts;

  let result: AnalysisResult = {
    riskScore: basePick.riskScore,
    riskLabel: scoreToLabel(basePick.riskScore),
    highRiskFlagged: flags.flagged,
    matchedFlags: flags.matches,
    summary: basePick.summary,
    verdicts: dedupeVerdictsByTitle(verdictsMerged).slice(0, 6),
    negotiationTips: dedupeTipsByTitle(tipsMerged).slice(0, 6),
    analysisSource,
  };

  result = applyHighRiskRules(result, flags);
  result.riskLabel = scoreToLabel(result.riskScore);
  result.verdicts = dedupeVerdictsByTitle(result.verdicts).slice(0, 6);
  result.negotiationTips = dedupeTipsByTitle(result.negotiationTips).slice(0, 6);
  return result;
}
