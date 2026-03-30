"use client";
import { Activity } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { formatRelativeDate } from "@/lib/utils";
import type { ActivityLog } from "@/types/database";

const actionIcons: Record<string, string> = {
  case_created: "🆕",
  case_updated: "✏️",
  payment_added: "💰",
  payment_deleted: "🗑️",
  file_uploaded: "📎",
  file_deleted: "🗑️",
  note_added: "📝",
  note_deleted: "🗑️",
  qr_regenerated: "🔄",
};

interface Props {
  logs: ActivityLog[];
}

export function ActivityTab({ logs }: Props) {
  const { t, isArabic } = useLanguage();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute start-5 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 ps-12 py-3 relative">
            {/* Icon dot */}
            <div className="absolute start-2 top-3 flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-border text-xs">
              {actionIcons[log.action_type] ?? "•"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/90 leading-snug">
                {isArabic && log.description_ar ? log.description_ar : log.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeDate(log.created_at, isArabic ? "ar-EG" : "en-US")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
