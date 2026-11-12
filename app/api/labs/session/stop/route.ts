import { NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { getLabUser } from "@/lib/lab-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_SANDBOX_ENABLED !== "true") {
    return NextResponse.json({ error: "The Linux lab is not enabled." }, { status: 503 });
  }

  const user = await getLabUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.sandboxName === "string" ? body.sandboxName : "";
  const prefix = `cyberlearn-${user.id}-`;
  if (!name.startsWith(prefix) || name.length > 100) {
    return NextResponse.json({ error: "Invalid lab session." }, { status: 400 });
  }

  try {
    const sandbox = await Sandbox.get({ name });
    await sandbox.stop();
    return NextResponse.json({ stopped: true });
  } catch {
    return NextResponse.json({ error: "Unable to stop this lab session." }, { status: 502 });
  }
}
