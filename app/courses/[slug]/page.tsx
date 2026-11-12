"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lesson = { title: string; body: string; task: string; hint: string; check: string };
const linuxLessons: Lesson[] = [
  { title: "Meet the Linux terminal", body: "The terminal lets you communicate with Linux by entering commands. A command usually has a name followed by optional arguments. Start by identifying where you are and which user is running your shell.", task: "Run pwd, whoami and uname -a. Notice how each command answers a different question.", hint: "pwd prints your current working directory. whoami prints the current username.", check: "Which command prints your current working directory?" },
  { title: "Navigate files and directories", body: "Linux organises files in a tree. The root directory is /, and your home directory is where your personal files normally live. ls lists directory contents; cd changes your current directory.", task: "Use ls to inspect the workspace, then move into the work directory and run pwd.", hint: "Try ls -la to include hidden entries. Use cd work to enter the work folder.", check: "Navigate into the work directory." },
  { title: "Create and inspect files", body: "Files can hold text, scripts, configuration and data. mkdir creates directories, touch creates an empty file, and cat displays a file's contents.", task: "Create a directory called notes, create a file called first.txt inside it, then inspect the file.", hint: "Try mkdir notes, then touch notes/first.txt.", check: "Create notes/first.txt in your workspace." },
  { title: "Understand users and permissions", body: "Linux uses users, groups and permission bits to control access. The three basic permission groups are owner, group and others. Read permissions allow viewing; write permissions allow changes; execute permissions allow running a file or entering a directory.", task: "Run id and ls -l. Identify the owner, group and permission string shown for a file.", hint: "In -rw-r--r--, the first character is the file type, followed by owner, group and other permissions.", check: "Use ls -l to inspect a file's permissions." },
  { title: "Essential Linux security habits", body: "Good administrators use least privilege, inspect commands before running them, keep software updated, and avoid piping unknown scripts directly into a privileged shell. Practise safely and keep activity within the authorised environment.", task: "Review the commands you've used. Explain why a normal student account should not need sudo for everyday file tasks.", hint: "Least privilege means using only the access needed for the task, and no more.", check: "Explain the principle of least privilege in your own words." },
];

const courses: Record<string, { title: string; description: string; lessons: Lesson[] }> = {
  "linux-fundamentals": { title: "Linux Fundamentals", description: "Build confidence with the Linux command line, files, directories and permissions.", lessons: linuxLessons },
};

function LinuxTerminal({ onCommand }: { onCommand: (command: string, cwd: string, output: string, exitCode: number) => void }) {
  const [sandboxName, setSandboxName] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "stopping" | "error">("idle");
  const [output, setOutput] = useState<string[]>(["CyberLearn Linux Lab", "Private disposable environment · outbound network blocked", "Type help to see available commands.", ""]);
  const [command, setCommand] = useState("");
  const [cwd, setCwd] = useState("/vercel/sandbox/student");
  const [busy, setBusy] = useState(false);

  async function token() {
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    return data.session?.access_token ?? null;
  }

  async function startLab() {
    setStatus("starting");
    const accessToken = await token();
    if (!accessToken) {
      setStatus("error");
      setOutput((lines) => [...lines, "Please sign in before starting a lab."]);
      return;
    }
    try {
      const response = await fetch("/api/labs/session", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start lab.");
      setSandboxName(data.sandboxName);
      setCwd("/vercel/sandbox/student");
      setStatus("ready");
      setOutput((lines) => [...lines, "Isolated Linux environment started.", "Try: pwd", ""]);
    } catch (error) {
      setStatus("error");
      setOutput((lines) => [...lines, error instanceof Error ? error.message : "Unable to start lab."]);
    }
  }

  async function stopLab() {
    if (!sandboxName) return;
    setStatus("stopping");
    const accessToken = await token();
    try {
      await fetch("/api/labs/session/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ sandboxName }),
      });
    } finally {
      setSandboxName("");
      setStatus("idle");
      setOutput((lines) => [...lines, "Lab session stopped."]);
    }
  }

  async function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = command.trim();
    if (!value || !sandboxName || busy) return;
    setCommand("");
    setOutput((lines) => [...lines, `student@cyberlearn:${cwd.replace("/vercel/sandbox/student", "~")}$ ${value}`]);
    if (value === "clear") { setOutput([]); return; }
    setBusy(true);
    try {
      const accessToken = await token();
      const response = await fetch("/api/labs/session/command", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ sandboxName, command: value, cwd }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Command failed.");
      if (data.cwd) setCwd(data.cwd);
      if (data.output) setOutput((lines) => [...lines, ...String(data.output).replace(/\n$/, "").split("\n")]);
      onCommand(value, data.cwd || cwd, String(data.output || ""), Number.isInteger(data.exitCode) ? data.exitCode : 0);
    } catch (error) {
      setOutput((lines) => [...lines, error instanceof Error ? error.message : "Command failed."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="linux-terminal panel">
      <div className="terminal-heading">
        <div><span className="eyebrow">HANDS-ON LAB</span><h2>Linux terminal</h2><p className="subtitle">A separate environment for practical exercises.</p></div>
        <span className={`lab-status ${status}`}>{status === "ready" ? "SANDBOX READY" : status.toUpperCase()}</span>
      </div>
      <div className="terminal-window">
        <div className="terminal-bar"><span className="terminal-dots">● ● ●</span><span>student@cyberlearn: ~/work</span><span>LINUX</span></div>
        <div className="terminal-output" aria-live="polite">{output.map((line, index) => <div key={index}>{line || "\u00a0"}</div>)}</div>
        <form className="terminal-input-row" onSubmit={runCommand}>
          <span>student@cyberlearn:{cwd.replace("/vercel/sandbox/student", "~")}$</span>
          <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder={status === "ready" ? "Enter a command…" : "Start the lab to begin"} disabled={status !== "ready" || busy} aria-label="Terminal command" />
        </form>
      </div>
      <div className="terminal-actions">
        {status === "idle" || status === "error" ? <button className="btn primary" onClick={startLab} disabled={status === "starting"}>{status === "starting" ? "Starting…" : "Start Linux lab"}</button> : <button className="btn" onClick={stopLab} disabled={status !== "ready"}>{status === "stopping" ? "Stopping…" : "Stop lab"}</button>}
        <span className="subtitle">Disposable session · restricted command set · no internet access</span>
      </div>
      {status === "error" && <p className="notice">If this is a preview deployment, the Vercel Sandbox feature may not be enabled yet.</p>}
    </section>
  );
}

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const course = courses[slug] || {
    title: slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    description: "This learning path is being prepared.",
    lessons: linuxLessons,
  };
  const [activeLesson, setActiveLesson] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [labEvidence, setLabEvidence] = useState<Array<{ command: string; cwd: string; output: string; exitCode: number }>>([]);
  const progress = Math.round((completed.length / course.lessons.length) * 100);
  const lesson = course.lessons[activeLesson];

  function checkTask() {
    const successful = labEvidence.filter((item) => item.exitCode === 0);
    const commands = successful.map((item) => item.command.trim().split(/\s+/)[0]);
    const has = (name: string) => commands.includes(name);
    let passed = false;
    let message = "";

    if (activeLesson === 0) {
      passed = has("pwd") && has("whoami") && has("uname");
      message = "Run pwd, whoami and uname -a successfully in the lab.";
    } else if (activeLesson === 1) {
      passed = successful.some((item) => item.command.startsWith("cd ") && item.cwd.endsWith("/work")) &&
        successful.some((item) => item.command === "pwd" && item.output.includes("/work"));
      message = "Use cd work, then run pwd while you are inside the work directory.";
    } else if (activeLesson === 2) {
      passed = has("mkdir") && has("touch") &&
        successful.some((item) => item.command.startsWith("ls notes") && item.output.includes("first.txt"));
      message = "Create notes/first.txt, then use ls notes to show that the file exists.";
    } else if (activeLesson === 3) {
      passed = has("id") && successful.some((item) => item.command.startsWith("ls -l") && /[rwx-]{9}/.test(item.output));
      message = "Run id and ls -l successfully to inspect your identity and file permissions.";
    } else {
      const explanation = answer.toLowerCase();
      passed = explanation.includes("least privilege") &&
        (explanation.includes("only") || explanation.includes("minimum")) &&
        (explanation.includes("access") || explanation.includes("permission"));
      message = "Explain least privilege and why everyday tasks should use only the minimum required access.";
    }

    if (passed) {
      setCompleted((current) => current.includes(activeLesson) ? current : [...current, activeLesson]);
      setFeedback("Challenge passed. Nice work — you've demonstrated the task.");
    } else {
      setFeedback(message + " Josh can give you a hint if you're stuck.");
    }
  }

  return (
    <main className="main course-page">
      <div className="room-topline"><Link className="btn" href="/#courses">← Learning paths</Link><span className="tag">BEGINNER · ROOM 01</span></div>
      <div className="room-hero">
        <div><div className="eyebrow">CYBERLEARN ROOM</div><h1>{course.title}</h1><p className="subtitle">{course.description}</p><div className="room-meta"><span>5 learning tasks</span><span>•</span><span>Practical Linux</span><span>•</span><span>Beginner</span></div></div>
        <div className="room-emblem" aria-hidden="true">⌘</div>
      </div>
      <section className="panel room-progress">
        <div className="section-head"><div><h2>Your room progress</h2><div className="subtitle">{completed.length} of {course.lessons.length} tasks completed</div></div><strong>{progress}%</strong></div>
        <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
      </section>
      <div className="room-layout">
        <aside className="panel lesson-list"><div className="eyebrow">ROOM CONTENTS</div>{course.lessons.map((item, index) => <button key={item.title} className={`lesson-nav ${activeLesson === index ? "selected" : ""}`} onClick={() => { setActiveLesson(index); setShowHint(false); setFeedback(""); }}><span className="lesson-number">{completed.includes(index) ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</aside>
        <section className="lesson-content">
          <article className="panel lesson-card"><div className="eyebrow">TASK {String(activeLesson + 1).padStart(2, "0")} / {String(course.lessons.length).padStart(2, "0")}</div><h2>{lesson.title}</h2><p>{lesson.body}</p><div className="task-box"><div className="eyebrow">YOUR MISSION</div><p>{lesson.task}</p></div><div className="lesson-actions"><button className="btn" onClick={() => setShowHint((value) => !value)}>{showHint ? "Hide hint" : "Need a hint?"}</button><button className="btn primary" onClick={() => setFeedback("Lesson marked as reviewed. Complete the practical task to demonstrate what you learned.")}>Mark lesson reviewed</button></div>{showHint && <div className="hint-box"><strong>Josh's hint</strong><p>{lesson.hint}</p></div>}</article>
          <article className="panel assessment-card"><div className="eyebrow">PROVE YOUR UNDERSTANDING</div><h3>Task check</h3><p className="subtitle">{lesson.check}</p>{activeLesson === 4 && <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Explain the principle of least privilege…" rows={3} />}{activeLesson !== 4 && <p className="notice">This challenge checks successful commands from your Linux lab session. Run the required commands, then check your answer.</p>}<button className="btn primary" onClick={checkTask}>Check my answer</button>{feedback && <p className="assessment-feedback" role="status">{feedback}</p>}</article>
        </section>
      </div>
      {slug === "linux-fundamentals" && <LinuxTerminal onCommand={(command, cwd, output, exitCode) => setLabEvidence((current) => [...current, { command, cwd, output, exitCode }])} />}
      <div className="room-footer"><button className="btn" disabled={activeLesson === 0} onClick={() => { setActiveLesson((value) => value - 1); setShowHint(false); setFeedback(""); }}>Previous task</button><button className="btn primary" disabled={activeLesson === course.lessons.length - 1} onClick={() => { setActiveLesson((value) => value + 1); setShowHint(false); setFeedback(""); }}>Next task →</button></div>
      <p className="notice">Prototype room: lesson completion is currently held in this browser session. Persistent progress and verified assessments will be connected to the CyberLearn room engine before launch.</p>
    </main>
  );
}
