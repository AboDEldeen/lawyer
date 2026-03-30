"use client";
import Link from "next/link";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export default function NotFound() {
  const { isArabic } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl gold-gradient shadow-xl mb-6">
        <Scale className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center">
        {isArabic ? "الصفحة التي تبحث عنها غير موجودة" : "The page you are looking for does not exist"}
      </p>
      <Button asChild variant="gold">
        <Link href="/" className="gap-2">
          {isArabic ? "العودة للرئيسية" : "Back to Dashboard"}
          <ArrowRight className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} />
        </Link>
      </Button>
    </div>
  );
}
