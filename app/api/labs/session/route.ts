import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Sandbox } from "@vercel/sandbox";
import { getLabUser } from "@/lib/lab-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_SANDBOX_ENABLED !== "true") {
    return NextResponse.json(
      { error: "The Linux lab is not enabled on this deployment yet." },
      { status: 503 },
    );
  }

  const user = await getLabUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to start a lab." }, { status: 401 });
  }

  try {
    const active = await Sandbox.list({ tags: { owner: user.id }, limit: 5 });
    for await (const candidate of active) {
      if (candidate.currentSession().status === "running") {
        return NextResponse.json({ sandboxName: candidate.name, reused: true });
      }
    }

    const name = `cyberlearn-${user.id}-${randomUUID().slice(0, 12)}`;
    const sandbox = await Sandbox.create({
      name,
      image: "vercel/sandbox/universal",
      resources: { vcpus: 1 },
      timeout: 45 * 60 * 1000,
      persistent: false,
      networkPolicy: "deny-all",
      tags: { app: "cyberlearn", course: "linux-fundamentals", owner: user.id },
    });

    await sandbox.runCommand("mkdir", ["-p", "/vercel/sandbox/student/work"]);
    return NextResponse.json({
      sandboxName: sandbox.name,
    });
  } catch (error) {
    console.error("Unable to start CyberLearn sandbox", error);
    return NextResponse.json(
      { error: "We couldn't start your Linux lab. Please try again shortly." },
      { status: 502 },
    );
  }
}
