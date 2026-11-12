import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { Sandbox } from "@vercel/sandbox";
import { getLabUser } from "@/lib/lab-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

const ROOT = "/vercel/sandbox/student";
const ALLOWED = new Set(["ls", "pwd", "whoami", "uname", "id", "date", "mkdir", "touch", "cat", "head", "wc", "stat", "file", "chmod"]);

function insideWorkspace(candidate: string) {
  const relative = path.relative(ROOT, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_SANDBOX_ENABLED !== "true") {
    return NextResponse.json({ error: "The Linux lab is not enabled on this deployment yet." }, { status: 503 });
  }
  const user = await getLabUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in to use the lab." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.sandboxName === "string" ? body.sandboxName : "";
  const prefix = `cyberlearn-${user.id}-`;
  if (!name.startsWith(prefix) || name.length > 100) {
    return NextResponse.json({ error: "Invalid lab session." }, { status: 400 });
  }

  const commandLine = typeof body?.command === "string" ? body.command.trim() : "";
  if (!commandLine || commandLine.length > 200 || /[;&|<>$()`\\\\\n\r]/.test(commandLine)) {
    return NextResponse.json({ error: "Enter one simple Linux command. Shell operators are disabled in this training room." }, { status: 400 });
  }

  const parts = commandLine.match(/"[^"]*"|'[^']*'|[^\s]+/g) ?? [];
  const program = parts.shift() ?? "";
  const args = parts.map((part) => part.replace(/^["']|["']$/g, ""));
  const requestedCwd = typeof body?.cwd === "string" ? body.cwd : ROOT;
  const cwd = path.resolve(ROOT, requestedCwd);
  if (!insideWorkspace(cwd)) return NextResponse.json({ error: "That directory is outside your lab workspace." }, { status: 400 });

  try {
    const sandbox = await Sandbox.get({ name });
    if (program === "help") {
      return NextResponse.json({ output: "Available commands: pwd, ls, cd, whoami, uname, id, date, mkdir, touch, cat, head, wc, stat, file, clear, help", cwd });
    }
    if (program === "clear") return NextResponse.json({ output: "", clear: true, cwd });
    if (program === "echo") return NextResponse.json({ output: args.join(" "), cwd });
    if (program === "cd") {
      const next = path.resolve(cwd, args[0] || ROOT);
      if (!insideWorkspace(next)) return NextResponse.json({ error: "You can only move around inside your student workspace.", cwd }, { status: 400 });
      const check = await sandbox.runCommand({ cmd: "test", args: ["-d", next], cwd, timeoutMs: 3000 });
      if (check.exitCode !== 0) return NextResponse.json({ error: `cd: no such directory: ${args[0] || ""}`, cwd }, { status: 400 });
      return NextResponse.json({ output: "", cwd: next });
    }
    if (!ALLOWED.has(program)) {
      return NextResponse.json({ error: `Command not available in this introductory room: ${program}. Type help to see allowed commands.`, cwd }, { status: 400 });
    }

    const result = await sandbox.runCommand({ cmd: program, args, cwd, timeoutMs: 7000 });
    const stdout = await result.stdout();
    const stderr = await result.stderr();
    return NextResponse.json({
      output: (stdout + (stderr ? `\n${stderr}` : "")).slice(0, 10000),
      exitCode: result.exitCode,
      cwd,
    });
  } catch (error) {
    console.error("CyberLearn lab command failed", error);
    return NextResponse.json({ error: "The lab command could not be completed. Try restarting the lab." }, { status: 502 });
  }
}
