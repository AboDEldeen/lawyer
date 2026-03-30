"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, FolderOpen, FolderCheck, Clock,
  Banknote, TrendingUp, AlertCircle, Plus, Search,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { getDashboardStats, getCases } from "@/lib/services/cases";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CaseWithClient } from "@/types/database";
import { CaseDrawer } from "@/components/cases/case-drawer";
import { NewCaseDialog } from "@/components/cases/new-case-dialog";
import { translations } from "@/lib/i18n/translations";

export default function DashboardPage() {
  const { t, lang, isArabic } = useLanguage();
  const [stats, setStats] = useState({
    total: 0, open: 0, closed: 0, pending: 0,
    totalFees: 0, totalCollected: 0, remaining: 0,
  });
  const [recentCases, setRecentCases] = useState<CaseWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseWithClient | null>(null);
  const [newCaseOpen, setNewCaseOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, casesData] = await Promise.all([
        getDashboardStats(),
        getCases({ search: search || undefined }),
      ]);
      setStats(statsData);
      setRecentCases(casesData.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const statusLabel = (status: string) => {
    const opts = isArabic
      ? { open: "مفتوحة", closed: "مغلقة", pending: "معلقة", archived: "مؤرشفة" }
      : { open: "Open", closed: "Closed", pending: "Pending", archived: "Archived" };
    return opts[status as keyof typeof opts] ?? status;
  };

  const caseTypeLabel = (type: string) => {
    const opts = translations[lang].caseTypeOptions as Record<string, string>;
    return opts[type] ?? type;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page title row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isArabic ? "مرحباً، هذه نظرة عامة على القضايا" : "Welcome — here's your overview"}
          </p>
        </div>
        <Button variant="gold" onClick={() => setNewCaseOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("quickAddCase")}</span>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatCard title={t("totalCases")} value={stats.total} icon={Briefcase} color="blue" />
        <StatCard title={t("openCases")} value={stats.open} icon={FolderOpen} color="green" />
        <StatCard title={t("closedCases")} value={stats.closed} icon={FolderCheck} color="slate" />
        <StatCard title={t("pendingCases")} value={stats.pending} icon={Clock} color="gold" />
        <StatCard
          title={t("totalFees")}
          value={formatCurrency(stats.totalFees, isArabic ? "ar-EG" : "en-EG")}
          icon={Banknote}
          color="blue"
        />
        <StatCard
          title={t("totalCollected")}
          value={formatCurrency(stats.totalCollected, isArabic ? "ar-EG" : "en-EG")}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title={t("remainingBalance")}
          value={formatCurrency(stats.remaining, isArabic ? "ar-EG" : "en-EG")}
          icon={AlertCircle}
          color={stats.remaining > 0 ? "red" : "slate"}
        />
      </div>

      {/* Recent cases section */}
      <div className="premium-card overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">{t("recentCases")}</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="ps-9 h-8 w-48 md:w-64 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={load} className="h-8 w-8">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">{t("noRecentCases")}</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setNewCaseOpen(true)}>
                <Plus className="w-4 h-4" />
                {t("quickAddCase")}
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start text-xs font-medium text-muted-foreground px-5 py-3">{t("client")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("caseTitle")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">{t("caseType")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("court")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("caseStatus")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">{t("openingDate")}</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">
                      {c.clients?.full_name ?? t("na")}
                    </td>
                    <td className="px-4 py-3.5 text-foreground/80 max-w-[200px] truncate">
                      {c.title}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                      {caseTypeLabel(c.case_type)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell max-w-[140px] truncate">
                      {c.court ?? t("na")}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={c.status as "open" | "closed" | "pending" | "archived"}>
                        {statusLabel(c.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {formatDate(c.opening_date, isArabic ? "ar-EG" : "en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Case drawer */}
      {selectedCase && (
        <CaseDrawer
          caseData={selectedCase}
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={load}
        />
      )}

      {/* New case dialog */}
      <NewCaseDialog
        open={newCaseOpen}
        onClose={() => setNewCaseOpen(false)}
        onCreated={load}
      />
    </div>
  );
}
