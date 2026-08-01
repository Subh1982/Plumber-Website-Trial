"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../lib/supabase";

type Profile = { full_name: string; phone: string; username: string; discount_percent: number };
type View = "signup" | "login";
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const usernamePattern = /^[A-Za-z0-9._-]{3,30}$/;

export function DiscountAccount() {
  const supabase = getSupabaseBrowserClient();
  const [view, setView] = useState<View>("signup");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase.from("profiles").select("full_name, phone, username, discount_percent").eq("id", session.user.id).single()
      .then(({ data, error }) => error ? setStatus("We couldn’t load your account details just now.") : setProfile(data));
  }, [session, supabase]);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setStatus("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password"));
    const username = String(form.get("username")).trim();
    if (!passwordPattern.test(password)) {
      setStatus("Use at least 8 characters with an uppercase letter, a number and a special character.");
      setBusy(false);
      return;
    }
    if (!usernamePattern.test(username)) {
      setStatus("Username must be 3–30 characters using letters, numbers, dots, underscores or hyphens.");
      setBusy(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")).trim(),
      password,
      options: { data: { full_name: String(form.get("full_name")).trim(), phone: String(form.get("phone")).trim(), username } },
    });
    if (error) {
      setStatus(error.message.toLowerCase().includes("database") ? "That username may already be taken. Please try another." : error.message);
    } else if (!data.session) {
      formElement.reset();
      setStatus("Check your email to confirm your account, then return here to log in.");
      setView("login");
    } else setStatus("Welcome—your 5% discount account is ready.");
    setBusy(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
    setStatus(error ? "Email or password is incorrect, or your email has not been confirmed." : "You’re signed in.");
    setBusy(false);
  }

  async function handleDeleteAccount() {
    if (!supabase || !session || !window.confirm("Permanently delete your discount account? This cannot be undone.")) return;
    setBusy(true);
    const response = await fetch("/api/account/delete", { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
    if (response.ok) {
      await supabase.auth.signOut();
      setStatus("Your account has been permanently deleted.");
      setView("signup");
    } else setStatus("We couldn’t delete your account. Please try again.");
    setBusy(false);
  }

  if (!supabase) return <div className="account-card account-setup"><b>Customer accounts are coming soon.</b><p>The secure account connection still needs to be configured.</p></div>;

  if (session) return <div className="account-card">
    <span className="account-badge">5% MEMBER DISCOUNT</span>
    <h3>{profile ? `Welcome, ${profile.full_name}.` : "Loading your account…"}</h3>
    {profile && <dl className="account-details">
      <div><dt>Name</dt><dd>{profile.full_name}</dd></div><div><dt>Username</dt><dd>@{profile.username}</dd></div>
      <div><dt>Email</dt><dd>{session.user.email}</dd></div><div><dt>Phone</dt><dd>{profile.phone}</dd></div>
      <div><dt>Member discount</dt><dd>{profile.discount_percent}%</dd></div>
    </dl>}
    <div className="account-actions"><button type="button" onClick={() => supabase.auth.signOut()} disabled={busy}>Log out</button><button className="danger-button" type="button" onClick={handleDeleteAccount} disabled={busy}>Delete account</button></div>
    {status && <p className="account-status" aria-live="polite">{status}</p>}
  </div>;

  return <div className="account-card">
    <div className="account-tabs" role="tablist" aria-label="Customer account">
      <button type="button" className={view === "signup" ? "active" : ""} onClick={() => { setView("signup"); setStatus(""); }}>Sign up</button>
      <button type="button" className={view === "login" ? "active" : ""} onClick={() => { setView("login"); setStatus(""); }}>Log in</button>
    </div>
    {view === "signup" ? <form className="account-form" onSubmit={handleSignUp}>
      <label><span>Full name *</span><input name="full_name" autoComplete="name" required /></label>
      <label><span>Phone number *</span><input name="phone" type="tel" autoComplete="tel" required /></label>
      <label><span>Preferred username *</span><input name="username" autoComplete="username" pattern="[A-Za-z0-9._-]{3,30}" required /></label>
      <label><span>Email address *</span><input name="email" type="email" autoComplete="email" required /></label>
      <label className="account-wide"><span>Password *</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <small className="password-help">At least 8 characters, including one uppercase letter, one number and one special character.</small>
      <button className="account-primary account-wide" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create my discount account →"}</button>
    </form> : <form className="account-form" onSubmit={handleLogin}>
      <label className="account-wide"><span>Email address *</span><input name="email" type="email" autoComplete="email" required /></label>
      <label className="account-wide"><span>Password *</span><input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="account-primary account-wide" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in →"}</button>
    </form>}
    {status && <p className="account-status" aria-live="polite">{status}</p>}
  </div>;
}
