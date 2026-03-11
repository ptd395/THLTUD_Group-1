import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Home,
  Menu,
  Settings
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { useLocation } from "wouter";

type AppTaskbarLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Demo Chat", path: "/demo", icon: Bot },
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "Settings", path: "/settings/sentiment", icon: Settings },
];

function isActivePath(currentPath: string, targetPath: string) {
  if (targetPath === "/") {
    return currentPath === "/";
  }
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function SidebarBody({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex h-full min-h-screen flex-col text-slate-100">
      <div className="border-b border-white/10 px-5 py-5">
        <button
          onClick={() => onNavigate("/")}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-1 text-left"
          type="button"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#4f97ff] to-[#2f67dd] shadow-[0_8px_24px_rgba(47,103,221,0.35)]">
            <span className="text-xl font-black leading-none text-white">N</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">
              Nova Tech
            </p>
            <p className="truncate text-xs text-slate-400">Support Workspace</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActivePath(currentPath, item.path);
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-[#263147] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-slate-300 hover:bg-[#1f2937] hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-[#6ea8ff]" : "")} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <p className="text-sm font-medium text-slate-100">Nova Tech Team</p>
          <p className="mt-1 text-xs text-slate-400">
            AI Support Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AppTaskbarLayout({ children }: AppTaskbarLayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1700px]">
        <aside className="hidden w-[280px] shrink-0 border-r border-[#1f2a44] bg-gradient-to-b from-[#0f172a] to-[#111827] md:block">
          <SidebarBody currentPath={location} onNavigate={handleNavigate} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-[#f3f5f8]/95 px-3 backdrop-blur md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] border-r-0 bg-gradient-to-b from-[#0f172a] to-[#111827] p-0 sm:max-w-[280px]"
              >
                <SidebarBody currentPath={location} onNavigate={handleNavigate} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[#4f97ff] to-[#2f67dd]">
                <span className="text-sm font-black leading-none text-white">N</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Nova Tech
              </span>
            </div>
          </header>

          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
