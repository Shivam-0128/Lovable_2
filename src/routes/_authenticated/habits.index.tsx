import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/habits/")({
  head: () => ({
    meta: [
      { title: "My habits — Tally" },
      { name: "description", content: "Your personal list of daily habits." },
      { property: "og:title", content: "My habits — Tally" },
      { property: "og:description", content: "Your personal list of daily habits." },
    ],
  }),
  component: MyHabits,
});

function MyHabits() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");

  const habits = useQuery({
    queryKey: ["my-habits", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits").select("id,name,is_shared").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("habits").insert({
        user_id: user.id, name: name.trim().slice(0, 120), when_i_do_it: when.trim().slice(0, 1000), is_shared: shared,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName(""); setWhen(""); setShared(false);
      qc.invalidateQueries({ queryKey: ["my-habits"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Habit name is required");
    add.mutate();
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl">My habits</h1>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="space-y-1.5"><Label htmlFor="hn">Habit name</Label>
          <Input id="hn" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="wh">When I do it</Label>
          <Textarea id="wh" value={when} onChange={(e) => setWhen(e.target.value)}
            placeholder="e.g. After my morning coffee, when the house is still quiet" /></div>
        <div className="flex items-center gap-2">
          <Checkbox id="sh" checked={shared} onCheckedChange={(v) => setShared(v === true)} />
          <Label htmlFor="sh">Share with the community</Label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={add.isPending}>Add habit</Button>
      </form>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {habits.data?.length === 0 && <li className="p-6 text-muted-foreground">No habits yet — add your first above.</li>}
        {habits.data?.map((h) => (
          <li key={h.id} className="flex items-center justify-between p-5">
            <Link to="/habits/$habitId" params={{ habitId: h.id }} className="font-medium hover:text-primary hover:underline">{h.name}</Link>
            <Badge variant={h.is_shared ? "default" : "secondary"}>{h.is_shared ? "Shared" : "Private"}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
