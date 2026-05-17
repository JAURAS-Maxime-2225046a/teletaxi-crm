"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

const NO_SIDEBAR = ["/auth", "/database"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const withSidebar = !NO_SIDEBAR.some((p) => pathname.startsWith(p));

  if (!withSidebar) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
