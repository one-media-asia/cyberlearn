"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) { setMessage("Supabase is not configured. Please contact support."); return; }
    if (password.length < 8) { setMessage("Use at least 8 characters for your new password."); return; }
    if (password !== confirmPassword) { setMessage("The passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Your password has been updated. Taking you to your dashboard…");
    window.setTimeout(() => router.push("/"), 1200);
  }

  return <main className="login-wrap"><section className="login-card">
    <Link className="brand" href="/"><span className="brand-mark">C</span> CyberLearn</Link>
    <div className="eyebrow">ACCOUNT RECOVERY</div>
    <h1>Choose a new password.</h1>
    <p className="subtitle">Enter and confirm your new CyberLearn password.</p>
    <form onSubmit={submit}>
      <label htmlFor="password">New password</label>
      <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
      <label htmlFor="confirm-password">Confirm new password</label>
      <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      <button className="btn primary" style={{width:"100%",marginTop:12}} disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
    </form>
    {message && <p className="notice" role="status">{message}</p>}
    <Link className="notice" href="/login">← Back to sign in</Link>
  </section></main>;
}
