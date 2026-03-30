"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "gold" | "green" | "red" | "blue" | "slate";
  trend?: string;
}

const colorMap = {
  gold: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function StatCard({ title, value, icon: Icon, color = "slate", trend }: StatCardProps) {
  return (
    <div className="premium-card p-5 flex items-start gap-4">
      <div className={cn("p-2.5 rounded-xl shrink-0", colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
        <p className="text-xl font-bold text-foreground mt-0.5 leading-tight">{value}</p>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </div>
    </div>
  );
}
