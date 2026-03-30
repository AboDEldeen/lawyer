"use client";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/language-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { translations } from "@/lib/i18n/translations";
import type { CaseWithClient } from "@/types/database";
import { Calendar, Scale, Hash, Building, User, Phone, Mail } from "lucide-react";

interface Props {
  caseData: CaseWithClient;
  totalPaid: number;
  remaining: number;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function CaseOverviewTab({ caseData, totalPaid, remaining }: Props) {
  const { t, lang, isArabic } = useLanguage();
  const typeOpts = translations[lang].caseTypeOptions as Record<string, string>;
  const pct = caseData.total_fees > 0 ? Math.min((totalPaid / caseData.total_fees) * 100, 100) : 0;

  return (
    <div className="space-y-5">
      {/* Payment summary */}
      <div className="rounded-xl bg-accent/40 border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("totalFeesLabel")}</p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {formatCurrency(caseData.total_fees, isArabic ? "ar-EG" : "en-EG")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("totalPaid")}</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(totalPaid, isArabic ? "ar-EG" : "en-EG")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("remaining")}</p>
            <p className={`text-base font-bold mt-0.5 ${remaining > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(remaining, isArabic ? "ar-EG" : "en-EG")}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("paymentProgress")}</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      {/* Case details */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isArabic ? "تفاصيل القضية" : "Case Details"}
        </p>
        <div>
          <InfoRow label={t("caseType")} value={typeOpts[caseData.case_type] ?? caseData.case_type} icon={Scale} />
          {caseData.case_number && (
            <InfoRow label={t("caseNumber")} value={caseData.case_number} icon={Hash} />
          )}
          {caseData.court && (
            <InfoRow label={t("court")} value={caseData.court} icon={Building} />
          )}
          <InfoRow
            label={t("openingDate")}
            value={formatDate(caseData.opening_date, isArabic ? "ar-EG" : "en-GB")}
            icon={Calendar}
          />
          {caseData.description && (
            <div className="py-2.5">
              <p className="text-xs text-muted-foreground mb-1">{t("description")}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{caseData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Client info */}
      {caseData.clients && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isArabic ? "بيانات الموكل" : "Client Details"}
          </p>
          <div>
            <InfoRow label={t("clientName")} value={caseData.clients.full_name} icon={User} />
            {caseData.clients.phone && (
              <InfoRow label={t("clientPhone")} value={caseData.clients.phone} icon={Phone} />
            )}
            {caseData.clients.email && (
              <InfoRow label={t("clientEmail")} value={caseData.clients.email} icon={Mail} />
            )}
            {caseData.clients.reference_number && (
              <InfoRow label={t("referenceNumber")} value={caseData.clients.reference_number} icon={Hash} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
