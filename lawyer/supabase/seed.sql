insert into clients (id, full_name, phone, email) values
('11111111-1111-1111-1111-111111111111','أحمد علي','01000000000','ahmed@example.com'),
('22222222-2222-2222-2222-222222222222','منى السيد','01111111111','mona@example.com')
on conflict (id) do nothing;

insert into cases (id, client_id, title, case_type, status, opening_date, court, case_number, total_fees) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','قضية تعويض مدني','مدني','مفتوحة','2026-03-01','محكمة شمال القاهرة','123/2026',25000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','22222222-2222-2222-2222-222222222222','نزاع تجاري','تجاري','جارية','2026-02-10','المحكمة الاقتصادية','88/2026',40000)
on conflict (id) do nothing;

insert into payments (case_id, amount, payment_date, note) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',5000,'2026-03-02','دفعة أولى'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',15000,'2026-02-15','مقدم الأتعاب');

insert into case_notes (case_id, content) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','تم استلام المستندات الأولية'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','تم تحديد جلسة أولى');

insert into qr_share_links (case_id, token, is_active, allow_download, show_client_name, show_case_title) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','share-case-a',true,false,true,true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','share-case-b',true,true,true,true)
on conflict (case_id) do nothing;

insert into activity_logs (case_id, action_type, description) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','case_created','تم إنشاء القضية'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','payment_added','تمت إضافة دفعة أولى'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','case_created','تم إنشاء القضية');
