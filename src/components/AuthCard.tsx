import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display mb-8 block text-center text-4xl text-primary">Tally</Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="font-display mb-6 text-2xl">{title}</h1>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
