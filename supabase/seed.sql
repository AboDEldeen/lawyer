-- ============================================================
-- Seed Data — Lawyer Mai Tunsy
-- Demo data with realistic Arabic content
-- Run AFTER creating your first admin user via Supabase Auth
-- Replace 'YOUR_USER_ID' with your actual auth user UUID
-- ============================================================

DO $$
DECLARE
  v_user_id UUID := (SELECT id FROM auth.users LIMIT 1);
  c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
  case1 UUID; case2 UUID; case3 UUID; case4 UUID; case5 UUID; case6 UUID;
BEGIN

-- ─── Clients ──────────────────────────────────────────────────────────────────

INSERT INTO clients (id, full_name, phone, email, reference_number, created_by) VALUES
  (uuid_generate_v4(), 'أحمد محمد الشرقاوي', '01012345678', 'ahmed.elsharkawy@email.com', 'REF-001', v_user_id) RETURNING id INTO c1;

INSERT INTO clients (id, full_name, phone, email, reference_number, created_by) VALUES
  (uuid_generate_v4(), 'سارة عبد الرحمن النجار', '01098765432', 'sara.alnajjar@email.com', 'REF-002', v_user_id) RETURNING id INTO c2;

INSERT INTO clients (id, full_name, phone, email, reference_number, created_by) VALUES
  (uuid_generate_v4(), 'خالد إبراهيم المنصوري', '01156789012', 'khaled.almansoury@email.com', 'REF-003', v_user_id) RETURNING id INTO c3;

INSERT INTO clients (id, full_name, phone, email, reference_number, created_by) VALUES
  (uuid_generate_v4(), 'منى حسين الغزالي', '01234567890', 'mona.alghazaly@email.com', 'REF-004', v_user_id) RETURNING id INTO c4;

INSERT INTO clients (id, full_name, phone, email, reference_number, created_by) VALUES
  (uuid_generate_v4(), 'طارق يوسف البدري', '01187654321', 'tarek.albadri@email.com', 'REF-005', v_user_id) RETURNING id INTO c5;

-- ─── Cases ────────────────────────────────────────────────────────────────────

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c1, 'نزاع على ملكية عقارية في حي المعادي', 'real_estate', 'open', '2024-03-15', 'محكمة جنوب القاهرة الابتدائية', '4521/2024', 15000.00, 'قضية نزاع على ملكية شقة سكنية مساحتها 120 متر مربع بحي المعادي.', v_user_id) RETURNING id INTO case1;

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c2, 'قضية حضانة أطفال وتطليق', 'family', 'open', '2024-05-10', 'محكمة الأسرة بمدينة نصر', '1893/2024', 8000.00, 'قضية تطليق مع النظر في حضانة طفلين.', v_user_id) RETURNING id INTO case2;

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c3, 'نزاع عمالي — فصل تعسفي من العمل', 'labor', 'pending', '2024-01-20', 'محكمة العمل بالقاهرة', '756/2024', 5500.00, 'دعوى بفصل تعسفي من شركة كبرى مع المطالبة بالتعويض.', v_user_id) RETURNING id INTO case3;

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c4, 'قضية مديونية تجارية بين شركتين', 'commercial', 'closed', '2023-09-05', 'محكمة الاستئناف التجارية', '3310/2023', 20000.00, 'تحصيل دين تجاري بين شركتين ناتج عن عقد توريد.', v_user_id) RETURNING id INTO case4;

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c5, 'استئناف في قضية جنائية', 'criminal', 'open', '2024-06-01', 'محكمة استئناف القاهرة الجنائية', '2201/2024', 12000.00, 'استئناف حكم ابتدائي في قضية جنائية.', v_user_id) RETURNING id INTO case5;

INSERT INTO cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees, description, created_by)
VALUES (uuid_generate_v4(), c1, 'طعن إداري على قرار هيئة حكومية', 'administrative', 'pending', '2024-04-22', 'محكمة القضاء الإداري', '889/2024', 6000.00, 'الطعن على قرار إداري صادر من جهة حكومية.', v_user_id) RETURNING id INTO case6;

-- ─── Payments ─────────────────────────────────────────────────────────────────

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case1, 5000.00, '2024-03-15', 'دفعة أولى عند التعاقد', v_user_id),
  (case1, 5000.00, '2024-05-01', 'دفعة ثانية بعد جلسة الاستماع الأولى', v_user_id);

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case2, 3000.00, '2024-05-10', 'دفعة أولى', v_user_id);

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case3, 2000.00, '2024-01-20', 'دفعة استلام الملف', v_user_id),
  (case3, 1500.00, '2024-03-10', 'دفعة بعد أول جلسة', v_user_id);

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case4, 10000.00, '2023-09-05', 'دفعة أولى', v_user_id),
  (case4, 10000.00, '2024-01-15', 'دفعة نهائية بعد الفوز بالقضية', v_user_id);

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case5, 5000.00, '2024-06-01', 'دفعة مقدمة', v_user_id);

INSERT INTO payments (case_id, amount, payment_date, note, created_by) VALUES
  (case6, 2000.00, '2024-04-22', 'دفعة أتعاب أولية', v_user_id);

-- ─── Notes ────────────────────────────────────────────────────────────────────

INSERT INTO case_notes (case_id, content, created_by) VALUES
  (case1, 'الموكل قدّم مستندات ملكية العقار — بانتظار رد الخصم على الدعوى. الجلسة القادمة في 2024/09/20.', v_user_id),
  (case1, 'تم تقديم طلب استعجالي بوقف التصرف في العقار محل النزاع.', v_user_id);

INSERT INTO case_notes (case_id, content, created_by) VALUES
  (case2, 'الزوجة تطالب بحضانة الطفلين وهما بسن 4 و7 سنوات. طلبنا تقرير الخبير الاجتماعي.', v_user_id);

INSERT INTO case_notes (case_id, content, created_by) VALUES
  (case3, 'تم تقديم شكوى رسمية لمكتب العمل. الموكل محتاج لتوثيق إضافي من جهة العمل.', v_user_id);

INSERT INTO case_notes (case_id, content, created_by) VALUES
  (case4, 'تم الفوز بالقضية ابتداءً. الحكم نهائي ومُنهي. تحصيل المبلغ اكتمل.', v_user_id);

INSERT INTO case_notes (case_id, content, created_by) VALUES
  (case5, 'استلمنا صورة الحكم الابتدائي. هناك أدلة جديدة يمكن تقديمها في الاستئناف.', v_user_id);

-- ─── Activity Logs ─────────────────────────────────────────────────────────────

INSERT INTO activity_logs (case_id, action_type, description, description_ar, created_by) VALUES
  (case1, 'case_created', 'Case created: نزاع على ملكية عقارية في حي المعادي', 'تم إنشاء القضية: نزاع على ملكية عقارية في حي المعادي', v_user_id),
  (case1, 'payment_added', 'Payment added: 5000 EGP', 'تمت إضافة دفعة: 5000 ج.م', v_user_id),
  (case1, 'payment_added', 'Payment added: 5000 EGP', 'تمت إضافة دفعة: 5000 ج.م', v_user_id),
  (case1, 'note_added', 'Note added', 'تمت إضافة ملاحظة', v_user_id);

INSERT INTO activity_logs (case_id, action_type, description, description_ar, created_by) VALUES
  (case2, 'case_created', 'Case created', 'تم إنشاء القضية', v_user_id),
  (case2, 'payment_added', 'Payment added: 3000 EGP', 'تمت إضافة دفعة: 3000 ج.م', v_user_id);

INSERT INTO activity_logs (case_id, action_type, description, description_ar, created_by) VALUES
  (case4, 'case_created', 'Case created', 'تم إنشاء القضية', v_user_id),
  (case4, 'payment_added', 'Payment added: 10000 EGP', 'تمت إضافة دفعة: 10000 ج.م', v_user_id),
  (case4, 'payment_added', 'Payment added: 10000 EGP', 'تمت إضافة دفعة: 10000 ج.م', v_user_id),
  (case4, 'case_updated', 'Case closed', 'تم إغلاق القضية', v_user_id);

END $$;
