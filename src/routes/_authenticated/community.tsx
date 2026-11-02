import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — Tally" },
      { name: "description", content: "Habits your group has chosen to share." },
      { property: "og:title", content: "Community — Tally" },
      { property: "og:description", content: "Habits your group has chosen to share." },
    ],
  }),
  component: Community,
});

function Community() {
  const shared = useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,when_i_do_it,profiles(display_name),completions(count)")
        .eq("is_shared", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl">Community</h1>
      {shared.data?.length === 0 && <p className="text-muted-foreground">Nobody has shared a habit yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {shared.data?.map((h) => (
          <li key={h.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div>
              <Link to="/habits/$habitId" params={{ habitId: h.id }} className="font-display text-xl hover:text-primary hover:underline">{h.name}</Link>
              <p className="text-sm text-muted-foreground">by {h.profiles?.display_name}</p>
            </div>
            <p className="flex-1 whitespace-pre-wrap text-sm">{h.when_i_do_it || "—"}</p>
            <p className="text-sm"><span className="text-muted-foreground">Days done:</span> <strong>{h.completions?.[0]?.count ?? 0}</strong></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
