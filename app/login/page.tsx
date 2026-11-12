"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) { setMessage("CyberLearn sign-in is not configured. Please try again later."); return; }
    setBusy(true);
    try {
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
      if (result.error) setMessage(result.error.message);
      else if (mode === "signin") {
        const requestedNext = new URLSearchParams(window.location.search).get("next");
        const destination = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
        router.push(destination);
      } else setMessage("Account request received. Check your email if confirmation is enabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset() {
    setMessage("");
    if (!supabase) { setMessage("Password recovery is not configured. Please try again later."); return; }
    if (!email.trim()) { setMessage("Enter your account email address first, then choose Forgot password."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) setMessage(`Could not send the reset email: ${error.message}`);
      else setMessage("If an account exists for that email, a reset link will arrive shortly. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? `Password reset failed: ${error.message}` : "Password reset failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-wrap"><section className="login-card">
    <Link className="brand" href="/"><span className="brand-mark">C</span> CyberLearn</Link>
    <div className="eyebrow">YOUR LEARNING ACCOUNT</div><h1>{mode === "signin" ? "Welcome back." : "Create your account."}</h1>
    <p className="subtitle">Save your learning progress and continue your cybersecurity journey.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} style={{flex:1,minWidth:0}} />
        <button className="btn" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
      </div>
      {mode === "signin" && <button className="btn" type="button" onClick={sendPasswordReset} disabled={busy} style={{marginTop:8}}>Forgot password?</button>}
      <button className="btn primary" style={{width:"100%",marginTop:8}} disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    </form>
    {message && <p className="notice" role="status" aria-live="polite">{message}</p>}
    <p className="notice">{mode === "signin" ? "New to CyberLearn?" : "Already have an account?"} <button className="btn" type="button" onClick={() => {setMode(mode === "signin" ? "signup" : "signin");setMessage("");setShowPassword(false);}}>{mode === "signin" ? "Create account" : "Sign in"}</button></p>
    <Link className="notice" href="/">← Back to dashboard</Link>
  </section></main>;
}
