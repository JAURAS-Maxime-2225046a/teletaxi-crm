"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car, Database, Upload, History, Settings,
  Camera, Sparkles, ChevronRight, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { tauri } from "@/lib/tauri";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: tauri.config.get,
    staleTime: 30_000,
  });

  const dbConnected = !!config?.accdb_path;
  const dbFilename = config?.accdb_path?.split(/[\\/]/).pop() ?? "data.accdb";

  return (
    <aside className="w-52 xl:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Car className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            TELETAXI <span className="text-blue-600">CRM</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Compagnon TeleTaxi</p>
        </div>
      </div>

      {/* DB status */}
      <Link
        href="/database"
        title="Gérer la base de données"
        className={cn(
          "mx-3 mt-3 mb-1 px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors text-left",
          dbConnected
            ? "bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 hover:bg-green-100/60 dark:hover:bg-green-950/30"
            : "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 hover:bg-amber-100/60 dark:hover:bg-amber-950/30"
        )}
      >
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dbConnected ? "bg-green-500 animate-pulse" : "bg-amber-500"
          )}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium truncate",
              dbConnected ? "text-green-900" : "text-amber-900"
            )}
          >
            {dbConnected ? "Base connectée" : "Base à configurer"}
          </p>
          <p
            className={cn(
              "text-[10px] truncate",
              dbConnected ? "text-green-700" : "text-amber-700"
            )}
          >
            {dbConnected ? dbFilename : "Cliquez pour configurer"}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100",
            dbConnected ? "text-green-700" : "text-amber-700"
          )}
        />
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <SidebarSection label="Principal" />
        <SidebarItem href="/" icon={Database} label="Tableau de bord" active={pathname === "/"} />
        <SidebarItem href="/import" icon={Upload} label="Import Excel" active={pathname === "/import"} />
        <SidebarItem href="/history" icon={History} label="Historique" active={pathname === "/history"} />

        <SidebarSection label="À venir" />
        <SidebarItem href="#" icon={Camera} label="Bons scannés" soon />
        <SidebarItem href="#" icon={Sparkles} label="Assistant IA" soon />

        <SidebarSection label="Paramètres" />
        <SidebarItem href="/settings" icon={Settings} label="Configuration" active={pathname === "/settings"} />
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <button
          type="button"
          onClick={signout}
          className="w-full flex items-center gap-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md py-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.display_name ?? user?.email ?? "Utilisateur"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Se déconnecter</p>
          </div>
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mt-3 mb-1">
      {label}
    </p>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  soon,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  soon?: boolean;
}) {
  const cls = cn(
    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
    active ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
    : soon ? "text-slate-400 dark:text-slate-500 cursor-not-allowed"
    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  );

  const content = (
    <>
      <Icon
        className={cn("w-4 h-4 shrink-0", active ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400")}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className="flex-1 truncate text-left">{label}</span>
      {soon && (
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
          V2
        </span>
      )}
    </>
  );

  if (soon) return <div className={cls}>{content}</div>;
  return <Link href={href} className={cls}>{content}</Link>;
}
