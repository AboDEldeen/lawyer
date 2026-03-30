"use client";
import { useState } from "react";
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
import { createCase } from "@/lib/services/cases";
import { CASE_TYPES, CASE_STATUSES } from "@/lib/utils/status";
import { translations } from "@/lib/i18n/translations";
import { useToast } from "@/hooks/use-toast";

interface NewCaseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewCaseDialog({ open, onClose, onCreated }: NewCaseDialogProps) {
  const { t, lang, isArabic } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    referenceNumber: "",
    title: "",
    caseType: "civil",
    status: "open",
    openingDate: new Date().toISOString().split("T")[0],
    court: "",
    caseNumber: "",
    totalFees: "",
    description: "",
  });

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.title || !form.caseType) return;
    setSaving(true);
    try {
      await createCase({
        client: {
          full_name: form.clientName,
          phone: form.clientPhone || undefined,
          email: form.clientEmail || undefined,
          reference_number: form.referenceNumber || undefined,
        },
        case: {
          title: form.title,
          case_type: form.caseType,
          status: form.status as "open" | "closed" | "pending" | "archived",
          opening_date: form.openingDate,
          court: form.court || undefined,
          case_number: form.caseNumber || undefined,
          total_fees: parseFloat(form.totalFees) || 0,
          description: form.description || undefined,
        },
      });
      toast({ title: isArabic ? "تم إنشاء القضية بنجاح" : "Case created successfully", variant: "success" as never });
      onCreated();
      onClose();
      setForm({
        clientName: "", clientPhone: "", clientEmail: "", referenceNumber: "",
        title: "", caseType: "civil", status: "open",
        openingDate: new Date().toISOString().split("T")[0],
        court: "", caseNumber: "", totalFees: "", description: "",
      });
    } catch (err) {
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("addNewCase")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {isArabic ? "بيانات الموكل" : "Client Information"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("clientName")} <span className="text-destructive">*</span></Label>
                <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("clientPhone")}</Label>
                <Input value={form.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} type="tel" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("clientEmail")}</Label>
                <Input value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} type="email" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("referenceNumber")}</Label>
                <Input value={form.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} dir="ltr" />
              </div>
            </div>
          </div>

          {/* Case info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {isArabic ? "بيانات القضية" : "Case Information"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{t("caseTitle")} <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("caseType")} <span className="text-destructive">*</span></Label>
                <Select value={form.caseType} onValueChange={(v) => set("caseType", v)}>
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
                <Input value={form.caseNumber} onChange={(e) => set("caseNumber", e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("court")}</Label>
                <Input value={form.court} onChange={(e) => set("court", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("openingDate")}</Label>
                <Input value={form.openingDate} onChange={(e) => set("openingDate", e.target.value)} type="date" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("totalFeesLabel")}</Label>
                <Input
                  value={form.totalFees}
                  onChange={(e) => set("totalFees", e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{t("description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="gold" disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
