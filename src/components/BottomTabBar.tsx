import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Bot, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/assistente", icon: Bot, label: "Assistente", highlight: true },
  { path: "/imoveis", icon: Building2, label: "Imóveis" },
  { path: "/config", icon: Settings, label: "Config" },
];

export default function BottomTabBar() {
  const location = useLocation();

  // Hide on auth pages
  if (["/login", "/cadastro", "/onboarding"].includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-elevated safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-0.5 px-3 py-2 touch-target"
            >
              {tab.highlight ? (
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full -mt-4 transition-colors",
                    isActive
                      ? "gradient-coral shadow-lg shadow-primary/30"
                      : "bg-primary/10"
                  )}
                >
                  <Icon
                    size={22}
                    className={cn(
                      isActive ? "text-primary-foreground" : "text-primary"
                    )}
                  />
                </div>
              ) : (
                <Icon
                  size={22}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                  tab.highlight && "-mt-0.5"
                )}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
