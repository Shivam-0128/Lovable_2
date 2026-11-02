import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tally — habit tracking with friends" },
      { name: "description", content: "Track daily habits, keep some private, and share others with your group to discuss." },
      { property: "og:title", content: "Tally — habit tracking with friends" },
      { property: "og:description", content: "Track daily habits, keep some private, and share others with your group to discuss." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-primary text-2xl">Tally</p>
      <h1 className="font-display mt-6 max-w-2xl text-5xl leading-tight md:text-6xl">Small daily habits, kept together.</h1>
      <p className="mt-5 max-w-md text-muted-foreground">Tick off your days, keep some habits to yourself, and share the rest with your group to swap advice.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg"><Link to="/signup">Sign up</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/signin">Sign in</Link></Button>
      </div>
    </div>
  );
}
