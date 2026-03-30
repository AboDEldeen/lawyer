"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, StickyNote, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/language-context";
import { addNote, updateNote, deleteNote } from "@/lib/services/cases";
import { formatRelativeDate } from "@/lib/utils";
import type { CaseWithClient, CaseNote } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseData: CaseWithClient;
  notes: CaseNote[];
  onUpdate: () => void;
}

export function NotesTab({ caseData, notes, onUpdate }: Props) {
  const { t, isArabic } = useLanguage();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editNote, setEditNote] = useState<CaseNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await addNote(caseData.id, newContent.trim());
      toast({ title: isArabic ? "تمت إضافة الملاحظة" : "Note added" });
      setNewContent("");
      setAdding(false);
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!editNote || !editContent.trim()) return;
    setSaving(true);
    try {
      await updateNote(editNote.id, editContent.trim());
      toast({ title: isArabic ? "تم تحديث الملاحظة" : "Note updated" });
      setEditNote(null);
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteNote(deleteId, caseData.id);
      toast({ title: isArabic ? "تم حذف الملاحظة" : "Note deleted" });
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-4">
      {/* Add note input */}
      {adding ? (
        <div className="rounded-xl border border-primary/40 bg-card p-3 space-y-2">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={t("notePlaceholder")}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setNewContent(""); }}>
              <X className="w-3.5 h-3.5 me-1" />{t("cancel")}
            </Button>
            <Button size="sm" variant="gold" onClick={handleAdd} disabled={saving || !newContent.trim()}>
              <Check className="w-3.5 h-3.5 me-1" />{saving ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" />{t("addNote")}
        </Button>
      )}

      {/* Notes list */}
      {notes.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <StickyNote className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">{t("noNotes")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="p-3.5 rounded-xl border border-border bg-card">
              {editNote?.id === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditNote(null)}>
                      <X className="w-3.5 h-3.5 me-1" />{t("cancel")}
                    </Button>
                    <Button size="sm" variant="gold" onClick={handleEdit} disabled={saving}>
                      <Check className="w-3.5 h-3.5 me-1" />{saving ? t("saving") : t("save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(note.created_at, isArabic ? "ar-EG" : "en-US")}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => { setEditNote(note); setEditContent(note.content); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(note.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteNote")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
