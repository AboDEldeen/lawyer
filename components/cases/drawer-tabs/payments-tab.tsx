"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";
import { addPayment, updatePayment, deletePayment } from "@/lib/services/cases";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CaseWithClient, Payment } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseData: CaseWithClient;
  payments: Payment[];
  totalPaid: number;
  remaining: number;
  onUpdate: () => void;
}

export function PaymentsTab({ caseData, payments, totalPaid, remaining, onUpdate }: Props) {
  const { t, isArabic } = useLanguage();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: "", payment_date: new Date().toISOString().split("T")[0], note: "" });

  const pct = caseData.total_fees > 0 ? Math.min((totalPaid / caseData.total_fees) * 100, 100) : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await addPayment({ case_id: caseData.id, amount: parseFloat(form.amount), payment_date: form.payment_date, note: form.note || undefined });
      toast({ title: isArabic ? "تمت إضافة الدفعة" : "Payment added" });
      onUpdate();
      setAddOpen(false);
      setForm({ amount: "", payment_date: new Date().toISOString().split("T")[0], note: "" });
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPayment) return;
    setSaving(true);
    try {
      await updatePayment(editPayment.id, { amount: parseFloat(form.amount), payment_date: form.payment_date, note: form.note || undefined });
      toast({ title: isArabic ? "تم تحديث الدفعة" : "Payment updated" });
      onUpdate();
      setEditPayment(null);
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deletePayment(deleteId, caseData.id);
      toast({ title: isArabic ? "تم حذف الدفعة" : "Payment deleted" });
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setDeleteId(null); }
  }

  function openEdit(p: Payment) {
    setForm({ amount: p.amount.toString(), payment_date: p.payment_date, note: p.note ?? "" });
    setEditPayment(p);
  }

  const PaymentForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>{t("paymentAmount")} <span className="text-destructive">*</span></Label>
        <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} required dir="ltr" />
      </div>
      <div className="space-y-1.5">
        <Label>{t("paymentDate")}</Label>
        <Input type="date" value={form.payment_date} onChange={(e) => setForm(p => ({ ...p, payment_date: e.target.value }))} dir="ltr" />
      </div>
      <div className="space-y-1.5">
        <Label>{t("paymentNote")}</Label>
        <Input value={form.note} onChange={(e) => setForm(p => ({ ...p, note: e.target.value }))} />
      </div>
      <DialogFooter>
        <Button type="submit" variant="gold" disabled={saving}>{saving ? t("saving") : t("save")}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-xl bg-accent/40 border border-border p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("totalFeesLabel")}</p>
            <p className="text-sm font-bold mt-0.5">{formatCurrency(caseData.total_fees, isArabic ? "ar-EG" : "en-EG")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("totalPaid")}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(totalPaid, isArabic ? "ar-EG" : "en-EG")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("remaining")}</p>
            <p className={`text-sm font-bold mt-0.5 ${remaining > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(remaining, isArabic ? "ar-EG" : "en-EG")}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("paymentProgress")}</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <Progress value={pct} />
        </div>
      </div>

      {/* Add button */}
      <Button variant="outline" className="w-full gap-2" onClick={() => { setForm({ amount: "", payment_date: new Date().toISOString().split("T")[0], note: "" }); setAddOpen(true); }}>
        <Plus className="w-4 h-4" />
        {t("addPayment")}
      </Button>

      {/* Payments list */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Banknote className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(p.amount, isArabic ? "ar-EG" : "en-EG")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(p.payment_date, isArabic ? "ar-EG" : "en-GB")}
                  </span>
                </div>
                {p.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.note}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addPayment")}</DialogTitle></DialogHeader>
          <PaymentForm onSubmit={handleAdd} title={t("addPayment")} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editPayment} onOpenChange={(o) => !o && setEditPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editPayment")}</DialogTitle></DialogHeader>
          <PaymentForm onSubmit={handleEdit} title={t("editPayment")} />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeletePayment")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
