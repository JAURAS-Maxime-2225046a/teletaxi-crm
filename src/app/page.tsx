"use client";

import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <Car className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            TELETAXI <span className="text-blue-600">CRM</span>
          </h1>
          <p className="text-sm text-slate-500">Phase 1 — Setup validé ✓</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button>Bouton primary</Button>
        <Button variant="outline">Bouton outline</Button>
        <Button variant="destructive">Bouton destructive</Button>
      </div>
      <p className="text-xs text-slate-400">shadcn/ui + Tailwind + Lucide OK</p>
    </main>
  );
}
