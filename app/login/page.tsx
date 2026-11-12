"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) { setMessage("Supabase is not configured. Check the Vercel environment variables."); return; }
    setBusy(true);
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signin") {
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const destination = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
      router.push(destination);
    } else setMessage("Account request received. Check your email if confirmation is enabled.");
  }

  async function sendPasswordReset() {
    setMessage("");
    if (!supabase) { setMessage("Supabase is not configured. Check the Vercel environment variables."); return; }
    if (!email.trim()) { setMessage("Enter your email address first, then choose Forgot password."); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setBusy(false);
    setMessage(error ? error.message : "If an account exists for that email, a password-reset link will arrive shortly. Check your inbox and spam folder.");
  }

  return <main className="login-wrap"><section className="login-card">
    <Link className="brand" href="/"><span className="brand-mark">C</span> CyberLearn</Link>
    <div className="eyebrow">YOUR LEARNING ACCOUNT</div><h1>{mode === "signin" ? "Welcome back." : "Create your account."}</h1>
    <p className="subtitle">Save your learning progress and continue your cybersecurity journey.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email address</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label><input id="password" type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} />
      {mode === "signin" && <button className="btn" type="button" onClick={sendPasswordReset} disabled={busy} style={{marginTop:4}}>Forgot password?</button>}
      <button className="btn primary" style={{width:"100%",marginTop:8}} disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    </form>
    {message && <p className="notice" role="status">{message}</p>}
    <p className="notice">{mode === "signin" ? "New to CyberLearn?" : "Already have an account?"} <button className="btn" type="button" onClick={() => {setMode(mode === "signin" ? "signup" : "signin");setMessage("");}}>{mode === "signin" ? "Create account" : "Sign in"}</button></p>
    <Link className="notice" href="/">← Back to dashboard</Link>
  </section></main>;
}
