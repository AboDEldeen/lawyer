"use client";
import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil, LayoutGrid, CreditCard, FolderOpen,
  StickyNote, Activity, QrCode,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { CaseWithClient, Payment, CaseFile, CaseNote, QrShareLink, ActivityLog } from "@/types/database";
import {
  getPayments, getCaseFiles, getCaseNotes,
  getQrLink, getActivityLogs,
} from "@/lib/services/cases";
import { CaseOverviewTab } from "./drawer-tabs/overview-tab";
import { PaymentsTab } from "./drawer-tabs/payments-tab";
import { FilesTab } from "./drawer-tabs/files-tab";
import { NotesTab } from "./drawer-tabs/notes-tab";
import { ActivityTab } from "./drawer-tabs/activity-tab";
import { QrTab } from "./drawer-tabs/qr-tab";
import { EditCaseDialog } from "./edit-case-dialog";

interface CaseDrawerProps {
  caseData: CaseWithClient;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function CaseDrawer({ caseData, open, onClose, onUpdate }: CaseDrawerProps) {
  const { t, isArabic } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [qrLink, setQrLink] = useState<QrShareLink | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getPayments(caseData.id).then(setPayments),
      getCaseFiles(caseData.id).then(setFiles),
      getCaseNotes(caseData.id).then(setNotes),
      getQrLink(caseData.id).then(setQrLink),
      getActivityLogs(caseData.id).then(setLogs),
    ]);
  }, [open, caseData.id]);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = caseData.total_fees - totalPaid;

  const statusLabel = (s: string) => {
    const map: Record<string, string> = isArabic
      ? { open: "مفتوحة", closed: "مغلقة", pending: "معلقة", archived: "مؤرشفة" }
      : { open: "Open", closed: "Closed", pending: "Pending", archived: "Archived" };
    return map[s] ?? s;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side={isArabic ? "left" : "right"}
          className="w-full sm:max-w-2xl p-0 flex flex-col"
        >
          {/* Drawer Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border bg-card shrink-0">
            <div className="flex items-start justify-between gap-3 pe-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={caseData.status as "open" | "closed" | "pending" | "archived"}>
                    {statusLabel(caseData.status)}
                  </Badge>
                  {caseData.case_number && (
                    <span className="text-xs text-muted-foreground font-mono">
                      #{caseData.case_number}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                  {caseData.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {caseData.clients?.full_name}
                </p>
                {caseData.court && (
                  <p className="text-xs text-muted-foreground mt-0.5">{caseData.court}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-3 border-b border-border shrink-0 overflow-x-auto">
              <TabsList className="h-9 bg-transparent gap-0 w-auto">
                {[
                  { value: "overview", icon: LayoutGrid, label: isArabic ? "نظرة عامة" : "Overview" },
                  { value: "payments", icon: CreditCard, label: isArabic ? "المدفوعات" : "Payments" },
                  { value: "files", icon: FolderOpen, label: isArabic ? "الملفات" : "Files" },
                  { value: "notes", icon: StickyNote, label: isArabic ? "الملاحظات" : "Notes" },
                  { value: "activity", icon: Activity, label: isArabic ? "النشاط" : "Activity" },
                  { value: "qr", icon: QrCode, label: "QR" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-1.5 px-3 py-1.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5">
                <TabsContent value="overview" className="mt-0">
                  <CaseOverviewTab caseData={caseData} totalPaid={totalPaid} remaining={remaining} />
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <PaymentsTab
                    caseData={caseData}
                    payments={payments}
                    totalPaid={totalPaid}
                    remaining={remaining}
                    onUpdate={() => getPayments(caseData.id).then(setPayments)}
                  />
                </TabsContent>

                <TabsContent value="files" className="mt-0">
                  <FilesTab
                    caseData={caseData}
                    files={files}
                    onUpdate={() => getCaseFiles(caseData.id).then(setFiles)}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <NotesTab
                    caseData={caseData}
                    notes={notes}
                    onUpdate={() => getCaseNotes(caseData.id).then(setNotes)}
                  />
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <ActivityTab logs={logs} />
                </TabsContent>

                <TabsContent value="qr" className="mt-0">
                  <QrTab
                    caseData={caseData}
                    qrLink={qrLink}
                    onUpdate={() => getQrLink(caseData.id).then(setQrLink)}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      <EditCaseDialog
        caseData={caseData}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={() => { onUpdate(); setEditOpen(false); }}
      />
    </>
  );
}
