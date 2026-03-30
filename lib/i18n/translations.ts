export const translations = {
  ar: {
    // App
    appName: "المحامية مي تونسي",
    appShortName: "مي تونسي",

    // Nav
    dashboard: "لوحة التحكم",
    cases: "القضايا",
    logout: "تسجيل الخروج",
    settings: "الإعدادات",

    // Auth
    login: "تسجيل الدخول",
    loginTitle: "مرحباً بك",
    loginSubtitle: "سجّل دخولك للوصول إلى نظام إدارة القضايا",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginButton: "دخول",
    loggingIn: "جارٍ الدخول...",
    loginError: "بيانات غير صحيحة، يرجى المحاولة مرة أخرى",

    // Dashboard
    totalCases: "إجمالي القضايا",
    openCases: "القضايا المفتوحة",
    closedCases: "القضايا المغلقة",
    pendingCases: "القضايا المعلقة",
    totalFees: "إجمالي الأتعاب",
    totalCollected: "المبالغ المحصّلة",
    remainingBalance: "الرصيد المتبقي",
    recentCases: "أحدث القضايا",
    quickAddCase: "إضافة قضية",
    searchPlaceholder: "ابحث عن قضية أو موكل...",
    noRecentCases: "لا توجد قضايا حديثة",

    // Cases
    allCases: "جميع القضايا",
    addNewCase: "قضية جديدة",
    filterByStatus: "فلترة بالحالة",
    filterByType: "فلترة بالنوع",
    sortBy: "ترتيب حسب",
    noCasesFound: "لا توجد قضايا مطابقة",
    noCasesYet: "لا توجد قضايا بعد",
    addFirstCase: "أضف أول قضية",
    searchCases: "ابحث في القضايا...",

    // Case status
    open: "مفتوحة",
    closed: "مغلقة",
    pending: "معلقة",
    archived: "مؤرشفة",

    // Case fields
    caseTitle: "عنوان القضية",
    caseType: "نوع القضية",
    caseNumber: "رقم القضية",
    caseStatus: "حالة القضية",
    openingDate: "تاريخ الفتح",
    court: "المحكمة",
    client: "الموكل",
    clientName: "اسم الموكل",
    clientPhone: "هاتف الموكل",
    clientEmail: "بريد الموكل",
    description: "الوصف",
    totalFeesLabel: "إجمالي الأتعاب",
    referenceNumber: "الرقم المرجعي",

    // Case types
    caseTypeOptions: {
      civil: "مدني",
      criminal: "جنائي",
      family: "أسرة",
      commercial: "تجاري",
      labor: "عمالي",
      administrative: "إداري",
      real_estate: "عقاري",
      other: "أخرى",
    },

    // Payments
    payments: "المدفوعات",
    addPayment: "إضافة دفعة",
    editPayment: "تعديل الدفعة",
    deletePayment: "حذف الدفعة",
    paymentAmount: "المبلغ",
    paymentDate: "تاريخ الدفع",
    paymentNote: "ملاحظة",
    totalPaid: "إجمالي المدفوع",
    remaining: "المتبقي",
    paymentProgress: "تقدم السداد",
    noPayments: "لا توجد دفعات مسجّلة",
    confirmDeletePayment: "هل تريد حذف هذه الدفعة؟",

    // Files
    files: "الملفات",
    uploadFile: "رفع ملف",
    uploadFromCamera: "التقاط صورة",
    deleteFile: "حذف الملف",
    downloadFile: "تحميل الملف",
    noFiles: "لا توجد ملفات مرفوعة",
    uploadingFile: "جارٍ الرفع...",
    fileUploadSuccess: "تم رفع الملف بنجاح",
    fileUploadError: "خطأ في رفع الملف",
    confirmDeleteFile: "هل تريد حذف هذا الملف؟",
    fileSize: "الحجم",
    uploadedAt: "تاريخ الرفع",

    // Notes
    notes: "الملاحظات",
    addNote: "إضافة ملاحظة",
    editNote: "تعديل الملاحظة",
    deleteNote: "حذف الملاحظة",
    notePlaceholder: "اكتب ملاحظتك هنا...",
    noNotes: "لا توجد ملاحظات",
    confirmDeleteNote: "هل تريد حذف هذه الملاحظة؟",

    // Activity
    activityLog: "سجل النشاط",
    noActivity: "لا يوجد نشاط مسجّل",

    // QR
    qrCode: "رمز QR",
    qrSettings: "إعدادات رمز QR",
    qrActive: "الرابط مفعّل",
    qrInactive: "الرابط معطّل",
    allowDownload: "السماح بالتحميل",
    showClientName: "إظهار اسم الموكل",
    showCaseTitle: "إظهار عنوان القضية",
    copyLink: "نسخ الرابط",
    openPublicPage: "فتح الصفحة العامة",
    regenerateQR: "إعادة توليد رمز QR",
    regenerateConfirm: "هل تريد إعادة توليد رمز QR؟ الرابط القديم لن يعمل.",
    linkCopied: "تم نسخ الرابط",
    downloadQR: "تحميل رمز QR",
    qrDescription: "امسح هذا الرمز للوصول إلى ملفات القضية",

    // Public share page
    publicPageTitle: "ملفات القضية",
    publicPageSubtitle: "الملفات المرفوعة",
    accessDisabled: "هذا الرابط غير مفعّل",
    accessDisabledDesc: "يرجى التواصل مع المحامية للحصول على رابط جديد",
    noPublicFiles: "لا توجد ملفات متاحة",

    // Forms
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    update: "تحديث",
    loading: "جارٍ التحميل...",
    saving: "جارٍ الحفظ...",
    required: "مطلوب",

    // Errors
    somethingWentWrong: "حدث خطأ ما",
    tryAgain: "حاول مرة أخرى",

    // Confirmations
    areYouSure: "هل أنت متأكد؟",
    cannotUndo: "لا يمكن التراجع عن هذا الإجراء",

    // Sort options
    sortNewest: "الأحدث",
    sortOldest: "الأقدم",
    sortByClient: "بالموكل",
    sortByStatus: "بالحالة",

    // Drawer tabs
    overview: "نظرة عامة",
    feesPayments: "الأتعاب والمدفوعات",

    // Misc
    currency: "ج.م",
    na: "غير محدد",
    case: "قضية",
    by: "بواسطة",
    on: "بتاريخ",
  },

  en: {
    // App
    appName: "Lawyer Mai Tunsy",
    appShortName: "Mai Tunsy",

    // Nav
    dashboard: "Dashboard",
    cases: "Cases",
    logout: "Logout",
    settings: "Settings",

    // Auth
    login: "Login",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to access the case management system",
    email: "Email",
    password: "Password",
    loginButton: "Sign In",
    loggingIn: "Signing in...",
    loginError: "Invalid credentials. Please try again.",

    // Dashboard
    totalCases: "Total Cases",
    openCases: "Open Cases",
    closedCases: "Closed Cases",
    pendingCases: "Pending Cases",
    totalFees: "Total Fees",
    totalCollected: "Total Collected",
    remainingBalance: "Remaining Balance",
    recentCases: "Recent Cases",
    quickAddCase: "Add Case",
    searchPlaceholder: "Search cases or clients...",
    noRecentCases: "No recent cases",

    // Cases
    allCases: "All Cases",
    addNewCase: "New Case",
    filterByStatus: "Filter by status",
    filterByType: "Filter by type",
    sortBy: "Sort by",
    noCasesFound: "No matching cases found",
    noCasesYet: "No cases yet",
    addFirstCase: "Add your first case",
    searchCases: "Search cases...",

    // Case status
    open: "Open",
    closed: "Closed",
    pending: "Pending",
    archived: "Archived",

    // Case fields
    caseTitle: "Case Title",
    caseType: "Case Type",
    caseNumber: "Case Number",
    caseStatus: "Status",
    openingDate: "Opening Date",
    court: "Court",
    client: "Client",
    clientName: "Client Name",
    clientPhone: "Client Phone",
    clientEmail: "Client Email",
    description: "Description",
    totalFeesLabel: "Total Fees",
    referenceNumber: "Reference Number",

    // Case types
    caseTypeOptions: {
      civil: "Civil",
      criminal: "Criminal",
      family: "Family",
      commercial: "Commercial",
      labor: "Labor",
      administrative: "Administrative",
      real_estate: "Real Estate",
      other: "Other",
    },

    // Payments
    payments: "Payments",
    addPayment: "Add Payment",
    editPayment: "Edit Payment",
    deletePayment: "Delete Payment",
    paymentAmount: "Amount",
    paymentDate: "Payment Date",
    paymentNote: "Note",
    totalPaid: "Total Paid",
    remaining: "Remaining",
    paymentProgress: "Payment Progress",
    noPayments: "No payments recorded",
    confirmDeletePayment: "Delete this payment?",

    // Files
    files: "Files",
    uploadFile: "Upload File",
    uploadFromCamera: "Camera",
    deleteFile: "Delete File",
    downloadFile: "Download",
    noFiles: "No files uploaded",
    uploadingFile: "Uploading...",
    fileUploadSuccess: "File uploaded successfully",
    fileUploadError: "File upload failed",
    confirmDeleteFile: "Delete this file?",
    fileSize: "Size",
    uploadedAt: "Uploaded at",

    // Notes
    notes: "Notes",
    addNote: "Add Note",
    editNote: "Edit Note",
    deleteNote: "Delete Note",
    notePlaceholder: "Write your note here...",
    noNotes: "No notes yet",
    confirmDeleteNote: "Delete this note?",

    // Activity
    activityLog: "Activity Log",
    noActivity: "No activity recorded",

    // QR
    qrCode: "QR Code",
    qrSettings: "QR Code Settings",
    qrActive: "Link Active",
    qrInactive: "Link Inactive",
    allowDownload: "Allow Download",
    showClientName: "Show Client Name",
    showCaseTitle: "Show Case Title",
    copyLink: "Copy Link",
    openPublicPage: "Open Public Page",
    regenerateQR: "Regenerate QR Code",
    regenerateConfirm: "Regenerate QR code? The old link will stop working.",
    linkCopied: "Link copied!",
    downloadQR: "Download QR",
    qrDescription: "Scan this code to access case files",

    // Public share page
    publicPageTitle: "Case Files",
    publicPageSubtitle: "Uploaded Files",
    accessDisabled: "This link is inactive",
    accessDisabledDesc: "Please contact the lawyer for a new link",
    noPublicFiles: "No files available",

    // Forms
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    update: "Update",
    loading: "Loading...",
    saving: "Saving...",
    required: "Required",

    // Errors
    somethingWentWrong: "Something went wrong",
    tryAgain: "Try again",

    // Confirmations
    areYouSure: "Are you sure?",
    cannotUndo: "This action cannot be undone",

    // Sort options
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortByClient: "By client",
    sortByStatus: "By status",

    // Drawer tabs
    overview: "Overview",
    feesPayments: "Fees & Payments",

    // Misc
    currency: "EGP",
    na: "N/A",
    case: "Case",
    by: "by",
    on: "on",
  },
} as const;

export type Language = "ar" | "en";
export type TranslationKey = keyof typeof translations.ar;
