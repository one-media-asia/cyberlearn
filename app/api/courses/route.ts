import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.ACADEMY_API_URL || "https://api.onemedia.asia";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/academy/courses/`, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Courses service is temporarily unavailable." }, { status: 502 });
  }
}
