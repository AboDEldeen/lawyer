import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en';

type Dict = Record<string, { ar: string; en: string }>;
const dict: Dict = {
  appName: { ar: 'المحامية مي تونسي', en: 'Lawyer Mai Tunsy' },
  dashboard: { ar: 'الرئيسية', en: 'Dashboard' },
  cases: { ar: 'القضايا', en: 'Cases' },
  logout: { ar: 'خروج', en: 'Logout' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  search: { ar: 'بحث', en: 'Search' },
  addCase: { ar: 'إضافة قضية', en: 'Add Case' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  details: { ar: 'التفاصيل', en: 'Details' },
  totalFees: { ar: 'إجمالي الأتعاب', en: 'Total Fees' },
  paid: { ar: 'المدفوع', en: 'Paid' },
  remaining: { ar: 'المتبقي', en: 'Remaining' },
  files: { ar: 'الملفات', en: 'Files' },
  notes: { ar: 'ملاحظات', en: 'Notes' },
  activity: { ar: 'الحركة', en: 'Activity' },
  qr: { ar: 'QR', en: 'QR' },
  payments: { ar: 'الدفعات', en: 'Payments' },
  openCases: { ar: 'القضايا المفتوحة', en: 'Open Cases' },
  closedCases: { ar: 'القضايا المغلقة', en: 'Closed Cases' },
  totalCases: { ar: 'إجمالي القضايا', en: 'Total Cases' },
  totalCollected: { ar: 'إجمالي المحصل', en: 'Total Collected' },
  caseTitle: { ar: 'عنوان القضية', en: 'Case Title' },
  clientName: { ar: 'اسم العميل', en: 'Client Name' },
  caseType: { ar: 'نوع القضية', en: 'Case Type' },
  status: { ar: 'الحالة', en: 'Status' },
  openingDate: { ar: 'تاريخ الفتح', en: 'Opening Date' },
  court: { ar: 'المحكمة', en: 'Court' },
  caseNumber: { ar: 'رقم القضية', en: 'Case Number' },
  addPayment: { ar: 'إضافة دفعة', en: 'Add Payment' },
  amount: { ar: 'المبلغ', en: 'Amount' },
  date: { ar: 'التاريخ', en: 'Date' },
  note: { ar: 'ملاحظة', en: 'Note' },
  addNote: { ar: 'إضافة ملاحظة', en: 'Add Note' },
  uploadFiles: { ar: 'رفع ملفات', en: 'Upload Files' },
  cameraUpload: { ar: 'رفع بالكاميرا', en: 'Camera Upload' },
  copyLink: { ar: 'نسخ الرابط', en: 'Copy Link' },
  regenerateQr: { ar: 'تجديد QR', en: 'Regenerate QR' },
  openPublicPage: { ar: 'فتح الصفحة العامة', en: 'Open Public Page' },
  allowDownload: { ar: 'السماح بالتحميل', en: 'Allow Download' },
  showClientName: { ar: 'إظهار اسم العميل', en: 'Show Client Name' },
  noData: { ar: 'لا توجد بيانات', en: 'No data' },
  invalidCredentials: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid credentials' },
  internalLogin: { ar: 'دخول داخلي', en: 'Internal Login' }
};

type Ctx = { language: Language; setLanguage: (l: Language) => void; t: (k: keyof typeof dict) => string; dir: 'rtl' | 'ltr' };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lawyer-lang') as Language) || 'ar');
  useEffect(() => {
    localStorage.setItem('lawyer-lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (k: keyof typeof dict) => dict[k][language], dir: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr' }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
