import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Tally" },
      { name: "description", content: "Create your Tally account to track habits with friends." },
      { property: "og:title", content: "Sign up — Tally" },
      { property: "og:description", content: "Create your Tally account to track habits with friends." },
    ],
  }),
  component: SignUp,
});

const schema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your details");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.displayName }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) return setError("Account created — please sign in.");
    navigate({ to: "/habits" });
  }

  return (
    <AuthCard title="Sign up" footer={<>Already a member? <Link to="/signin" className="text-primary underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="em">Email</Label>
          <Input id="em" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>Sign up</Button>
      </form>
    </AuthCard>
  );
}
