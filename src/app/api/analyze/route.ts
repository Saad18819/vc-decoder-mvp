import { NextResponse } from "next/server";
import { analyzeTermSheet } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Provide non-empty clause text in `text`." },
        { status: 400 }
      );
    }
    const result = await analyzeTermSheet(text);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Analysis failed. Try again or check server logs." },
      { status: 500 }
    );
  }
}
