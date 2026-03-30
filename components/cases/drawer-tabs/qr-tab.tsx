"use client";
import { useEffect, useState } from "react";
import {
  Copy, ExternalLink, RefreshCw, Download,
  QrCode, CheckCircle2, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/language-context";
import { updateQrSettings, regenerateQrToken } from "@/lib/services/cases";
import { generateQRCodeDataURL, getShareUrl } from "@/lib/utils/qr";
import type { CaseWithClient, QrShareLink } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseData: CaseWithClient;
  qrLink: QrShareLink | null;
  onUpdate: () => void;
}

export function QrTab({ caseData, qrLink, onUpdate }: Props) {
  const { t, isArabic } = useLanguage();
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [regenerateConfirm, setRegenerateConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = qrLink ? getShareUrl(qrLink.token) : "";

  // Generate QR image whenever token changes
  useEffect(() => {
    if (!shareUrl) return;
    generateQRCodeDataURL(shareUrl).then(setQrDataUrl);
  }, [shareUrl]);

  async function handleToggle(field: "is_active" | "allow_download" | "show_client_name" | "show_case_title", value: boolean) {
    if (!qrLink) return;
    setSaving(true);
    try {
      await updateQrSettings(qrLink.id, { [field]: value });
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleRegenerate() {
    setSaving(true);
    try {
      await regenerateQrToken(caseData.id);
      onUpdate();
      toast({ title: isArabic ? "تم إعادة توليد رمز QR" : "QR code regenerated" });
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally {
      setSaving(false);
      setRegenerateConfirm(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: t("linkCopied") });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${caseData.id.slice(0, 8)}.png`;
    a.click();
  }

  if (!qrLink) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <QrCode className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">
          {isArabic ? "جارٍ تحميل رمز QR..." : "Loading QR code..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* QR Image */}
      <div className="flex flex-col items-center">
        <div className={`relative rounded-2xl border-2 p-4 transition-all ${
          qrLink.is_active
            ? "border-primary/40 bg-card shadow-lg"
            : "border-border bg-muted/40 opacity-60"
        }`}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!qrLink.is_active && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
              <div className="text-center">
                <Shield className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">
                  {isArabic ? "معطّل" : "Inactive"}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center max-w-[220px]">
          {t("qrDescription")}
        </p>
      </div>

      {/* Link actions */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <p className="flex-1 text-xs font-mono text-muted-foreground truncate" dir="ltr">
            {shareUrl}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopy} disabled={!qrLink.is_active}>
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {t("copyLink")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => window.open(shareUrl, "_blank")}
            disabled={!qrLink.is_active}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {isArabic ? "فتح" : "Open"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadQR}>
            <Download className="w-3.5 h-3.5" />
            {isArabic ? "تحميل" : "Download"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Settings toggles */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("qrSettings")}
        </p>

        {[
          {
            field: "is_active" as const,
            label: isArabic ? "تفعيل الرابط العام" : "Activate public link",
            desc: isArabic ? "السماح بالوصول إلى صفحة الملفات العامة" : "Allow access to the public files page",
            value: qrLink.is_active,
          },
          {
            field: "allow_download" as const,
            label: t("allowDownload"),
            desc: isArabic ? "السماح للزوار بتحميل الملفات" : "Allow visitors to download files",
            value: qrLink.allow_download,
          },
          {
            field: "show_client_name" as const,
            label: t("showClientName"),
            desc: isArabic ? "إظهار اسم الموكل في الصفحة العامة" : "Show client name on public page",
            value: qrLink.show_client_name,
          },
          {
            field: "show_case_title" as const,
            label: t("showCaseTitle"),
            desc: isArabic ? "إظهار عنوان القضية في الصفحة العامة" : "Show case title on public page",
            value: qrLink.show_case_title,
          },
        ].map(({ field, label, desc, value }) => (
          <div key={field} className="flex items-start gap-3 justify-between">
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium text-foreground cursor-pointer">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={(v) => handleToggle(field, v)}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Regenerate */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{t("regenerateQR")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isArabic ? "يجعل الرابط القديم غير صالح" : "Invalidates the old link"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
          onClick={() => setRegenerateConfirm(true)}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isArabic ? "إعادة توليد" : "Regenerate"}
        </Button>
      </div>

      {/* Regenerate confirm */}
      <AlertDialog open={regenerateConfirm} onOpenChange={setRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("regenerateConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? t("saving") : (isArabic ? "إعادة توليد" : "Regenerate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
