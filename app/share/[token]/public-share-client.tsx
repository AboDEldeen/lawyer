"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Scale, Sun, Moon, Languages, Download, File,
  FileText, Image, ShieldX, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { formatFileSize, formatDate } from "@/lib/utils";

interface PublicFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  signedUrl: string | null;
}

interface Props {
  isActive: boolean;
  files: PublicFile[];
  caseTitle: string | null;
  clientName: string | null;
  allowDownload: boolean;
  token: string;
}

function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <File className="w-5 h-5 text-muted-foreground" />;
  if (mime.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />;
  if (mime === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export function PublicShareClient({
  isActive, files, caseTitle, clientName, allowDownload,
}: Props) {
  const { t, lang, setLang, isArabic } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [previewFile, setPreviewFile] = useState<PublicFile | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">{t("appShortName")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="text-muted-foreground h-8 w-8"
            >
              <Languages className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground h-8 w-8"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {!isActive ? (
          /* Disabled state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
              <ShieldX className="w-7 h-7 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{t("accessDisabled")}</h1>
            <p className="text-sm text-muted-foreground max-w-sm">{t("accessDisabledDesc")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Case header */}
            <div className="text-center space-y-1.5">
              {clientName && (
                <p className="text-sm text-muted-foreground font-medium">{clientName}</p>
              )}
              {caseTitle && (
                <h1 className="text-xl font-bold text-foreground">{caseTitle}</h1>
              )}
              {!clientName && !caseTitle && (
                <h1 className="text-xl font-bold text-foreground">{t("publicPageTitle")}</h1>
              )}
              <p className="text-xs text-muted-foreground">
                {isArabic ? `${files.length} ملف متاح` : `${files.length} file${files.length !== 1 ? "s" : ""} available`}
              </p>
            </div>

            {/* Files */}
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{t("noPublicFiles")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <FileIcon mime={file.mime_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {file.file_size && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(file.uploaded_at, isArabic ? "ar-EG" : "en-GB", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Preview image */}
                      {file.mime_type?.startsWith("image/") && file.signedUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1.5"
                          onClick={() => setPreviewFile(previewFile?.id === file.id ? null : file)}
                        >
                          {isArabic ? "معاينة" : "Preview"}
                        </Button>
                      )}
                      {allowDownload && file.signedUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          asChild
                        >
                          <a href={file.signedUrl} download={file.file_name} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3.5 h-3.5" />
                            {t("downloadFile")}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image preview */}
            {previewFile?.signedUrl && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={previewFile.signedUrl}
                  alt={previewFile.file_name}
                  className="w-full max-h-96 object-contain bg-muted"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t("appName")} © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
