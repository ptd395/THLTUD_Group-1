import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BarChart3, MessageSquare, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "KPI", icon: BarChart3, path: "/dashboard/kpi" },
  { label: "Channel", icon: MessageSquare, path: "/dashboard/channel" },
  { label: "Setiment", icon: SmilePlus, path: "/dashboard/sentiment" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 gap-2 bg-card border-r border-border">
        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
