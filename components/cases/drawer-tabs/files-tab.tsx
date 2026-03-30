"use client";
import { useRef, useState } from "react";
import { Upload, Camera, Trash2, Download, FileText, Image, File, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/language-context";
import { uploadCaseFile, deleteCaseFile, getSignedFileUrl } from "@/lib/services/cases";
import { formatFileSize, formatDate } from "@/lib/utils";
import type { CaseWithClient, CaseFile } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseData: CaseWithClient;
  files: CaseFile[];
  onUpdate: () => void;
}

function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <File className="w-5 h-5" />;
  if (mime.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />;
  if (mime === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export function FilesTab({ caseData, files, onUpdate }: Props) {
  const { t, isArabic } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteFile, setDeleteFile] = useState<CaseFile | null>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        await uploadCaseFile(caseData.id, file);
      }
      toast({ title: isArabic ? "تم رفع الملف بنجاح" : "File uploaded successfully" });
      onUpdate();
    } catch {
      toast({ title: t("fileUploadError"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteFile) return;
    try {
      await deleteCaseFile(deleteFile);
      toast({ title: isArabic ? "تم حذف الملف" : "File deleted" });
      onUpdate();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    } finally { setDeleteFile(null); }
  }

  async function handleDownload(file: CaseFile) {
    try {
      const url = await getSignedFileUrl(file.file_path, 300);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      a.target = "_blank";
      a.click();
    } catch {
      toast({ title: t("somethingWentWrong"), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2 h-10"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? t("uploadingFile") : t("uploadFile")}
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-10 px-4"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          title={t("uploadFromCamera")}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">{t("uploadFromCamera")}</span>
        </Button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
        accept="*/*"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Files list */}
      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">{t("noFiles")}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {isArabic ? "انقر لرفع ملف" : "Click to upload a file"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-muted shrink-0">
                <FileIcon mime={file.mime_type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {file.file_size && (
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(file.uploaded_at, isArabic ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDownload(file)}
                  title={t("downloadFile")}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteFile(file)}
                  title={t("deleteFile")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteFile} onOpenChange={(o) => !o && setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteFile")}</AlertDialogDescription>
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
