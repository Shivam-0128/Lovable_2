import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currentStreak, lastSevenDays } from "@/lib/habit-stats";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/habits/$habitId")({
  head: () => ({
    meta: [
      { title: "Habit — Tally" },
      { name: "description", content: "Track the last 7 days and discuss this habit." },
      { property: "og:title", content: "Habit — Tally" },
      { property: "og:description", content: "Track the last 7 days and discuss this habit." },
    ],
  }),
  component: HabitPage,
});

function HabitPage() {
  const { habitId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");

  const habit = useQuery({
    queryKey: ["habit", habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits").select("id,name,when_i_do_it,is_shared,user_id,profiles(display_name)").eq("id", habitId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const done = useQuery({
    queryKey: ["completions", habitId],
    queryFn: async () => {
      const { data, error } = await supabase.from("completions").select("day").eq("habit_id", habitId);
      if (error) throw error;
      return data.map((r) => r.day);
    },
  });
  const comments = useQuery({
    queryKey: ["comments", habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments").select("id,body,created_at,profiles(display_name)").eq("habit_id", habitId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ day, checked }: { day: string; checked: boolean }) => {
      const res = checked
        ? await supabase.from("completions").insert({ habit_id: habitId, day })
        : await supabase.from("completions").delete().eq("habit_id", habitId).eq("day", day);
      if (res.error) throw res.error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["completions", habitId] }),
  });

  const post = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("comments").insert({ habit_id: habitId, user_id: user.id, body: comment.trim().slice(0, 2000) });
      if (error) throw error;
    },
    onSuccess: () => { setComment(""); qc.invalidateQueries({ queryKey: ["comments", habitId] }); },
    onError: (e: Error) => setErr(e.message),
  });

  if (habit.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!habit.data) return <p className="text-muted-foreground">This habit isn't available.</p>;

  const h = habit.data;
  const isOwner = h.user_id === user.id;
  const days = done.data ?? [];
  const daySet = new Set(days);

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!comment.trim()) return setErr("Write a comment first");
    post.mutate();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl">{h.name}</h1>
          <Badge variant={h.is_shared ? "default" : "secondary"}>{h.is_shared ? "Shared" : "Private"}</Badge>
        </div>
        {!isOwner && <p className="text-sm text-muted-foreground">by {h.profiles?.display_name}</p>}
        <div className="rounded-xl bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">When I do it</p>
          <p className="mt-1 whitespace-pre-wrap">{h.when_i_do_it || "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card"><span className="text-muted-foreground">Days done:</span> <strong className="font-display text-3xl">{days.length}</strong></div>
        <div className="stat-card"><span className="text-muted-foreground">Current streak:</span> <strong className="font-display text-3xl">{currentStreak(days)}</strong></div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display mb-4 text-2xl">Last 7 days</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {lastSevenDays().map((day) => (
            <li key={day} className="flex items-center gap-3">
              <Checkbox id={`d-${day}`} checked={daySet.has(day)} disabled={!isOwner || toggle.isPending}
                onCheckedChange={(v) => toggle.mutate({ day, checked: v === true })} />
              <Label htmlFor={`d-${day}`} className="font-mono">{day}</Label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Comments</h2>
        <ul className="space-y-3">
          {comments.data?.length === 0 && <li className="text-muted-foreground">No comments yet.</li>}
          {comments.data?.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-primary">{c.profiles?.display_name}</p>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="cm">Comment</Label>
            <Textarea id="cm" value={comment} onChange={(e) => setComment(e.target.value)} /></div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={post.isPending}>Post comment</Button>
        </form>
      </section>
    </div>
  );
}
