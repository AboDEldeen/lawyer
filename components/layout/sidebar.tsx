"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, LayoutDashboard, Briefcase, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "cases", href: "/cases", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-sidebar border-e border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg gold-gradient shadow-lg">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground leading-tight">
            {t("appShortName")}
          </span>
          <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
            Law Office
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ key, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )}
              />
              <span>{t(key)}</span>
              {isActive && (
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 ms-auto text-sidebar-primary",
                    dir === "rtl" ? "rotate-180" : ""
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
