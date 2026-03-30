"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, Filter, RefreshCw, Briefcase, SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { getCases } from "@/lib/services/cases";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CaseWithClient } from "@/types/database";
import { CaseDrawer } from "@/components/cases/case-drawer";
import { NewCaseDialog } from "@/components/cases/new-case-dialog";
import { translations } from "@/lib/i18n/translations";
import { CASE_TYPES, CASE_STATUSES } from "@/lib/utils/status";

export default function CasesPage() {
  const { t, lang, isArabic } = useLanguage();
  const [cases, setCases] = useState<CaseWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCase, setSelectedCase] = useState<CaseWithClient | null>(null);
  const [newCaseOpen, setNewCaseOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCases({
        status: statusFilter !== "all" ? statusFilter : undefined,
        case_type: typeFilter !== "all" ? typeFilter : undefined,
        search: search || undefined,
      });
      const sorted = [...data].sort((a, b) => {
        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "client") return (a.clients?.full_name ?? "").localeCompare(b.clients?.full_name ?? "");
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return 0;
      });
      setCases(sorted);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = isArabic
      ? { open: "مفتوحة", closed: "مغلقة", pending: "معلقة", archived: "مؤرشفة" }
      : { open: "Open", closed: "Closed", pending: "Pending", archived: "Archived" };
    return map[status] ?? status;
  };

  const caseTypeLabel = (type: string) => {
    const opts = translations[lang].caseTypeOptions as Record<string, string>;
    return opts[type] ?? type;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("allCases")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isArabic ? `${cases.length} قضية مسجّلة` : `${cases.length} cases registered`}
          </p>
        </div>
        <Button variant="gold" onClick={() => setNewCaseOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("addNewCase")}</span>
        </Button>
      </div>

      {/* Filters bar */}
      <div className="premium-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchCases")}
              className="ps-9 h-9"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <Filter className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "كل الحالات" : "All statuses"}</SelectItem>
              {CASE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SlidersHorizontal className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue placeholder={t("filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "كل الأنواع" : "All types"}</SelectItem>
              {CASE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{caseTypeLabel(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <ArrowUpDown className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
              <SelectItem value="client">{t("sortByClient")}</SelectItem>
              <SelectItem value="status">{t("sortByStatus")}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={load} className="h-9 w-9 shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Cases list */}
      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <Briefcase className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="font-medium text-foreground/80 mb-1">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? t("noCasesFound")
                : t("noCasesYet")}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              {isArabic ? "لم يتم العثور على قضايا مطابقة للبحث" : "No cases match your current filters"}
            </p>
            <Button variant="outline" onClick={() => setNewCaseOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("addFirstCase")}
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-start text-xs font-medium text-muted-foreground px-5 py-3">{t("clientName")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("caseTitle")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("caseType")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("caseNumber")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("court")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("totalFeesLabel")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3">{t("caseStatus")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("openingDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/40 transition-colors group"
                    >
                      <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">
                        {c.clients?.full_name ?? t("na")}
                      </td>
                      <td className="px-4 py-3.5 text-foreground/80 max-w-[200px]">
                        <span className="line-clamp-1">{c.title}</span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {caseTypeLabel(c.case_type)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell">
                        {c.case_number ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell max-w-[120px]">
                        <span className="line-clamp-1">{c.court ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {formatCurrency(c.total_fees, isArabic ? "ar-EG" : "en-EG")}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={c.status as "open" | "closed" | "pending" | "archived"}>
                          {statusLabel(c.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {formatDate(c.opening_date, isArabic ? "ar-EG" : "en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-accent/40 transition-colors text-start"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {c.clients?.full_name ?? t("na")}
                      </span>
                      <Badge variant={c.status as "open" | "closed" | "pending" | "archived"} className="shrink-0">
                        {statusLabel(c.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70 truncate">{c.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">{caseTypeLabel(c.case_type)}</span>
                      <span className="text-xs font-medium text-primary">
                        {formatCurrency(c.total_fees, isArabic ? "ar-EG" : "en-EG")}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
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

      <NewCaseDialog
        open={newCaseOpen}
        onClose={() => setNewCaseOpen(false)}
        onCreated={load}
      />
    </div>
  );
}
