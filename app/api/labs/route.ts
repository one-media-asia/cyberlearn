import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL || "https://labs-api.onemedia.asia";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/labs`, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Labs service is temporarily unavailable." }, { status: 502 });
  }
}
