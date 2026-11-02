import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/signin" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  }

  const linkCls = "nav-link";
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/habits" className="font-display text-2xl text-primary">Tally</Link>
          <nav className="flex items-center gap-5">
            <Link to="/habits" className={linkCls} activeProps={{ className: "nav-link-active" }}>My habits</Link>
            <Link to="/community" className={linkCls} activeProps={{ className: "nav-link-active" }}>Community</Link>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </nav>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <div className="sticky top-8 flex flex-col gap-2">
            <Button asChild variant="secondary" className="justify-start"><Link to="/habits">My habits</Link></Button>
            <Button asChild variant="secondary" className="justify-start"><Link to="/community">Community</Link></Button>
            <Button variant="ghost" className="justify-start" onClick={signOut}>Sign out</Button>
          </div>
        </aside>
        <main className="min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
}
