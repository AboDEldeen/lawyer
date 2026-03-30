"use client";
import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { updateCase } from "@/lib/services/cases";
import { CASE_TYPES, CASE_STATUSES } from "@/lib/utils/status";
import { translations } from "@/lib/i18n/translations";
import { useToast } from "@/hooks/use-toast";
import type { CaseWithClient } from "@/types/database";

interface Props {
  caseData: CaseWithClient;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditCaseDialog({ caseData, open, onClose, onUpdated }: Props) {
  const { t, lang, isArabic } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    case_type: "civil",
    status: "open",
    opening_date: "",
    court: "",
    case_number: "",
    total_fees: "",
    description: "",
  });

  useEffect(() => {
    if (open && caseData) {
      setForm({
        title: caseData.title,
        case_type: caseData.case_type,
        status: caseData.status,
        opening_date: caseData.opening_date,
        court: caseData.court ?? "",
        case_number: caseData.case_number ?? "",
        total_fees: caseData.total_fees.toString(),
        description: caseData.description ?? "",
      });
    }
  }, [open, caseData]);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCase(caseData.id, {
        title: form.title,
        case_type: form.case_type,
        status: form.status as "open" | "closed" | "pending" | "archived",
        opening_date: form.opening_date,
        court: form.court || undefined,
        case_number: form.case_number || undefined,
        total_fees: parseFloat(form.total_fees) || 0,
        description: form.description || undefined,
      });
      toast({ title: isArabic ? "تم تحديث القضية" : "Case updated" });
      onUpdated();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const typeOpts = translations[lang].caseTypeOptions as Record<string, string>;
  const statusLabel = (s: string) => {
    const map: Record<string, string> = isArabic
      ? { open: "مفتوحة", closed: "مغلقة", pending: "معلقة", archived: "مؤرشفة" }
      : { open: "Open", closed: "Closed", pending: "Pending", archived: "Archived" };
    return map[s] ?? s;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("edit")} — {caseData.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("caseTitle")} *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("caseType")}</Label>
              <Select value={form.case_type} onValueChange={(v) => set("case_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{typeOpts[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("caseStatus")}</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CASE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("caseNumber")}</Label>
              <Input value={form.case_number} onChange={(e) => set("case_number", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("openingDate")}</Label>
              <Input type="date" value={form.opening_date} onChange={(e) => set("opening_date", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("court")}</Label>
              <Input value={form.court} onChange={(e) => set("court", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("totalFeesLabel")}</Label>
              <Input type="number" min="0" step="0.01" value={form.total_fees} onChange={(e) => set("total_fees", e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("description")}</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{t("cancel")}</Button>
            <Button type="submit" variant="gold" disabled={saving}>{saving ? t("saving") : t("update")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
