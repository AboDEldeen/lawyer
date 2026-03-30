"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Languages, Menu, Scale, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Header({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 md:px-6 bg-background/95 backdrop-blur border-b border-border">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md gold-gradient">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{t("appShortName")}</span>
        </div>

        {/* Page title */}
        {title && (
          <h1 className="hidden md:block text-base font-semibold text-foreground/80 ms-1">
            {title}
          </h1>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            className="text-muted-foreground hover:text-foreground"
          >
            <Languages className="w-4 h-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="lg:hidden text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <nav
        className={cn(
          "lg:hidden fixed inset-y-0 z-50 w-64 bg-sidebar border-e border-sidebar-border flex flex-col transition-transform duration-300",
          "start-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg gold-gradient shadow-lg">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">{t("appName")}</span>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {[
            { key: "dashboard", href: "/" },
            { key: "cases", href: "/cases" },
          ].map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname === href
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
              )}
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>
      </nav>
    </>
  );
}
