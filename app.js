// Mufti Auto Store Production ERP - Hybrid Client with Full English & Urdu Bilingual Engine

const API_BASE = "";
let isLocalBackend = false;

// Language State: 'en' (English) or 'ur' (Urdu)
let currentLang = localStorage.getItem("mufti_erp_lang") || "en";

// In-Memory / LocalStorage Database
const INITIAL_STORE = {
  roles: [
    { id: 1, name: "Admin", name_ur: "ایڈمن", description: "Full System Access", description_ur: "مکمل سسٹم کنٹرول (Full System Access)", permissions: "*" },
    { id: 2, name: "Storekeeper", name_ur: "سٹور کیپر", description: "Raw Store, PO and GRN Control", description_ur: "را سٹور، پرچیز اور جی آر این کنٹرول", permissions: "dashboard,po,grn,raw_store" },
    { id: 3, name: "Production", name_ur: "پروڈکشن", description: "Sampling, BOM and Work Orders Control", description_ur: "سیمپلنگ، بل آف مٹیریل (BOM) اور ورک آرڈر کنٹرول", permissions: "dashboard,sampling,bom,work_orders,fg" },
    { id: 4, name: "HR", name_ur: "ایچ آر", description: "Staff, Attendance, Piece-Rate & Leaves", description_ur: "ملازمین، حاضری، اوور ٹائم، پر پیس ٹھیکہ اور چھٹیاں", permissions: "dashboard,hr" },
    { id: 5, name: "Dispatch", name_ur: "ڈسپیچ", description: "Finished Goods Packing & Outward Challans", description_ur: "فنش گڈز پیکنگ اور فیکٹری/گودام ڈسپیچ چالان", permissions: "dashboard,fg,dispatch" }
  ],
  users: [
    { id: 1, username: "admin", full_name: "System Administrator", full_name_ur: "سسٹم ایڈمنسٹریٹر", role: "Admin", role_ur: "ایڈمن", is_active: true },
    { id: 2, username: "store_mgr", full_name: "Asghar Ali (Store Incharge)", full_name_ur: "اصغر علی (سٹور انچارج)", role: "Storekeeper", role_ur: "سٹور کیپر", is_active: true },
    { id: 3, username: "prod_mgr", full_name: "Muhammad Rashid (Prod. Supervisor)", full_name_ur: "محمد راشد (پروڈکشن سپروائزر)", role: "Production", role_ur: "پروڈکشن", is_active: true },
    { id: 4, username: "hr_mgr", full_name: "Shahzaib Khan (HR Officer)", full_name_ur: "شہزیب خان (ایچ آر آفیسر)", role: "HR", role_ur: "ایچ آر", is_active: true },
    { id: 5, username: "dispatch_mgr", full_name: "Tahir Mehmood (Dispatch Officer)", full_name_ur: "طاہر محمود (ڈسپیچ آفیسر)", role: "Dispatch", role_ur: "ڈسپیچ", is_active: true }
  ],
  suppliers: [
    { id: 1, name: "Pak Auto Casting Industries (Pvt) Ltd", name_ur: "پاک آٹو کاسٹنگ انڈسٹریز", contact_person: "Haji Farooq", phone: "0300-1122334", address: "Badami Bagh Auto Market, Lahore" },
    { id: 2, name: "National Friction Material Co.", name_ur: "نیشنل فرکشن میٹریل کمپنی", contact_person: "Salman Sheikh", phone: "0321-4455667", address: "SITE Area, Karachi" },
    { id: 3, name: "Standard Springs & Fasteners", name_ur: "سٹینڈرڈ سپرنگز اینڈ فاسٹنرز", contact_person: "Irfan Sahib", phone: "0333-7788990", address: "Industrial Zone, Gujranwala" },
    { id: 4, name: "Universal Poly Packaging & Bags", name_ur: "یونیورسل پولی پیکجنگ اینڈ بیگز", contact_person: "Kamran Akram", phone: "0345-6677889", address: "Urdu Bazar, Lahore" },
    { id: 5, name: "Creative Printing & Hologram Labels", name_ur: "کریٹو پرنٹنگ اینڈ ہولوگرام لیبلز", contact_person: "Waqas Butt", phone: "0302-9988776", address: "Shah Alam Market, Lahore" }
  ],
  rawMaterials: [
    { id: 1, code: "RM-ALU-01", name: "Aluminum Alloy Ingot (ADC12)", name_ur: "ایلومینیم الائے انگوٹ (ADC12)", category: "Raw Metal", category_ur: "خام دھات", unit: "KG", unit_ur: "کلو گرام", current_stock: 650.0, min_alert_level: 100.0, unit_price: 750.0, location: "Rack-A1", is_low_stock: false },
    { id: 2, code: "CP-BSC-02", name: "Brake Shoe Core Castings", name_ur: "بریک شو کور کاسٹنگ (چائلڈ پارٹ)", category: "Child Part", category_ur: "چائلڈ پارٹ", unit: "Pieces", unit_ur: "پیس", current_stock: 1500.0, min_alert_level: 300.0, unit_price: 95.0, location: "Bin-B1", is_low_stock: false },
    { id: 3, code: "CP-BLS-03", name: "Friction Brake Lining Strips", name_ur: "فرکشن بریک لائننگ پیڈ (چائلڈ پارٹ)", category: "Child Part", category_ur: "چائلڈ پارٹ", unit: "Pieces", unit_ur: "پیس", current_stock: 1800.0, min_alert_level: 400.0, unit_price: 45.0, location: "Bin-B2", is_low_stock: false },
    { id: 4, code: "FST-TRS-04", name: "Heavy Duty Tension Return Springs", name_ur: "ہیوی ڈیوٹی ٹینشن ریٹرن سپرنگ", category: "Fastener", category_ur: "سپرنگ و ریوٹس", unit: "Pieces", unit_ur: "پیس", current_stock: 2200.0, min_alert_level: 500.0, unit_price: 12.0, location: "Bin-C1", is_low_stock: false },
    { id: 5, code: "FST-RIV-05", name: "Solid Steel Rivets 4x10mm", name_ur: "سولڈ سٹیل ریوٹس 4x10mm", category: "Fastener", category_ur: "سپرنگ و ریوٹس", unit: "Pieces", unit_ur: "پیس", current_stock: 10000.0, min_alert_level: 2000.0, unit_price: 2.5, location: "Bin-C2", is_low_stock: false },
    { id: 6, code: "PKG-BAG-06", name: "Branded Heavy Polybag 6x9 (Mufti Auto Store)", name_ur: "برانڈڈ ہیوی پولی بیگ تھیلی 6x9 (مفتی آٹو سٹور)", category: "Packaging Bag", category_ur: "پیکنگ تھیلی", unit: "Pieces", unit_ur: "پیس", current_stock: 3500.0, min_alert_level: 500.0, unit_price: 4.0, location: "Shelf-P1", is_low_stock: false },
    { id: 7, code: "STK-BAR-07", name: "Barcode & Part Spec Sticker", name_ur: "بارکوڈ و پارٹ نمبر سٹیکر", category: "Sticker", category_ur: "سٹیکر", unit: "Pieces", unit_ur: "پیس", current_stock: 4000.0, min_alert_level: 600.0, unit_price: 1.5, location: "Shelf-P2", is_low_stock: false },
    { id: 8, code: "LGO-HLG-08", name: "Mufti Auto Store Hologram Verification Logo", name_ur: "مفتی آٹو سٹور ہولوگرام اوریجنل لوگو", category: "Logo/Branding", category_ur: "لوگو", unit: "Pieces", unit_ur: "پیس", current_stock: 3000.0, min_alert_level: 500.0, unit_price: 3.0, location: "Shelf-P3", is_low_stock: false },
    { id: 9, code: "PKG-BOX-09", name: "Master Outer Carton Box (50 Pcs Capacity)", name_ur: "ماسٹر آؤٹر کارٹن باکس (50 پیس کپیسٹی)", category: "Packaging Bag", category_ur: "پیکنگ تھیلی", unit: "Pieces", unit_ur: "پیس", current_stock: 250.0, min_alert_level: 50.0, unit_price: 65.0, location: "Zone-D", is_low_stock: false }
  ],
  articles: [
    { id: 1, article_code: "ART-BS-70", name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", name_ur: "موٹرسائیکل بریک شو اسمبلی (CD70 / CG125)", category: "Brakes", category_ur: "بریک سسٹمز", vehicle_model: "Honda CD70 / CG125", unit: "Piece", unit_ur: "پیس", description: "Complete Brake Shoe with Core, Lining, Spring, Rivet, Polybag, Sticker & Logo" },
    { id: 2, article_code: "ART-CP-01", name: "Heavy Duty Clutch Plate Assembly (Universal Auto)", name_ur: "ہیوی ڈیوٹی کلچ پلیٹ اسمبلی (یونیورسل آٹو)", category: "Transmission", category_ur: "ٹرانسمیشن", vehicle_model: "Universal Rickshaw / Loader", unit: "Piece", unit_ur: "پیس", description: "High Performance Clutch Plate with Riveting and Custom Logo Packaging" },
    { id: 3, article_code: "ART-SM-02", name: "Side Mirror Assembly with Base & Indicator", name_ur: "سائیڈ مرر اسمبلی مع بیس و انڈیکیٹر", category: "Body Parts", category_ur: "باڈی پارٹس", vehicle_model: "Suzuki Alto / Mehran", unit: "Piece", unit_ur: "پیس", description: "Complete Side Mirror with Glass, Base Fitting, and Branded Packaging" }
  ],
  recipes: [
    {
      id: 1,
      article_id: 1,
      article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)",
      article_name_ur: "موٹرسائیکل بریک شو اسمبلی (CD70 / CG125)",
      recipe_name: "Brake Shoe CD70 Master Production Recipe (with Bag, Sticker & Logo)",
      recipe_name_ur: "بریک شو CD70 ماسٹر پروڈکشن ریسیپی (مع تھیلی، سٹیکر، لوگو)",
      version: "v2.1",
      notes: "Master Recipe: 1 Unit requires 2 Castings, 2 Linings, 2 Springs, 8 Rivets, 1 Polybag, 1 Sticker, 1 Logo",
      notes_ur: "ماسٹر سیمپلنگ: فی 1 پیس میں 2 کور، 2 لائننگ، 2 سپرنگ، 8 ریوٹ، 1 تھیلی، 1 سٹیکر، 1 لوگو",
      items: [
        { material_id: 2, material_name: "Brake Shoe Core Castings", material_name_ur: "بریک شو کور کاسٹنگ", component_type: "Child Part", component_type_ur: "چائلڈ پارٹ", qty_per_unit: 2.0, unit: "Pieces", unit_ur: "پیس", notes: "Main Core" },
        { material_id: 3, material_name: "Friction Brake Lining Strips", material_name_ur: "فرکشن بریک لائننگ پیڈ", component_type: "Child Part", component_type_ur: "چائلڈ پارٹ", qty_per_unit: 2.0, unit: "Pieces", unit_ur: "پیس", notes: "Friction Pads" },
        { material_id: 4, material_name: "Heavy Duty Tension Return Springs", material_name_ur: "ٹینشن ریٹرن سپرنگ", component_type: "Fastener", component_type_ur: "سپرنگ", qty_per_unit: 2.0, unit: "Pieces", unit_ur: "پیس", notes: "Return Springs" },
        { material_id: 5, material_name: "Solid Steel Rivets 4x10mm", material_name_ur: "سولڈ سٹیل ریوٹس", component_type: "Fastener", component_type_ur: "ریوٹ", qty_per_unit: 8.0, unit: "Pieces", unit_ur: "پیس", notes: "Fitting Rivets" },
        { material_id: 6, material_name: "Branded Heavy Polybag 6x9 (Mufti Auto Store)", material_name_ur: "برانڈڈ ہیوی پولی بیگ تھیلی 6x9", component_type: "Packaging Bag", component_type_ur: "پیکنگ تھیلی", qty_per_unit: 1.0, unit: "Pieces", unit_ur: "پیس", notes: "Printed Bag" },
        { material_id: 7, material_name: "Barcode & Part Spec Sticker", material_name_ur: "بارکوڈ و پارٹ نمبر سٹیکر", component_type: "Sticker", component_type_ur: "سٹیکر", qty_per_unit: 1.0, unit: "Pieces", unit_ur: "پیس", notes: "Barcode Label" },
        { material_id: 8, material_name: "Mufti Auto Store Hologram Verification Logo", material_name_ur: "مفتی آٹو سٹور ہولوگرام اوریجنل لوگو", component_type: "Logo/Branding", component_type_ur: "لوگو", qty_per_unit: 1.0, unit: "Pieces", unit_ur: "پیس", notes: "Hologram Logo" }
      ]
    }
  ],
  boms: [
    { id: 1, bom_number: "BOM-1001", article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", article_name_ur: "موٹرسائیکل بریک شو اسمبلی (CD70 / CG125)", planned_quantity: 200, status: "ConvertedToWorkOrder", status_ur: "ورک آرڈر میں تبدیل", created_at: "2026-09-19" }
  ],
  workOrders: [
    {
      id: 1,
      wo_number: "WO-9842",
      article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)",
      article_name_ur: "موٹرسائیکل بریک شو اسمبلی (CD70 / CG125)",
      target_quantity: 200,
      produced_quantity: 0,
      status: "In Progress",
      status_ur: "پروڈکشن جاری",
      current_step: "Step 1: Stamping & Cutting",
      current_step_ur: "مرحلہ 1: پریسنگ / کٹنگ",
      start_date: "2026-09-19",
      steps: [
        { id: 101, step_number: 1, step_name: "Step 1: Stamping & Cutting", step_name_ur: "مرحلہ 1: پریسنگ / کٹنگ", piece_rate: 2.5, required_pieces: 200, completed_pieces: 200, status: "Completed", status_ur: "مکمل", assigned_worker_name: "Muhammad Afzal", assigned_worker_name_ur: "محمد افضل" },
        { id: 102, step_number: 2, step_name: "Step 2: Sub-Assembly Fitting", step_name_ur: "مرحلہ 2: چھوٹے پرزوں کی فٹنگ", piece_rate: 4.0, required_pieces: 200, completed_pieces: 150, status: "In Progress", status_ur: "جاری", assigned_worker_name: "Tariq Mehmood", assigned_worker_name_ur: "طارق محمود" },
        { id: 103, step_number: 3, step_name: "Step 3: Riveting & Welding", step_name_ur: "مرحلہ 3: ریوٹنگ / ویلڈنگ", piece_rate: 3.5, required_pieces: 200, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
        { id: 104, step_number: 4, step_name: "Step 4: Quality Check & Finishing", step_name_ur: "مرحلہ 4: کوالٹی چیک و پالش", piece_rate: 1.5, required_pieces: 200, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
        { id: 105, step_number: 5, step_name: "Step 5: Final Packing (Bag, Sticker, Logo)", step_name_ur: "مرحلہ 5: فائنل پیکنگ (تھیلی، سٹیکر، لوگو)", piece_rate: 2.0, required_pieces: 200, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" }
      ]
    }
  ],
  finishedGoods: [
    { id: 1, batch_number: "BATCH-BS70-0919", article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", article_name_ur: "موٹرسائیکل بریک شو اسمبلی (CD70 / CG125)", article_code: "ART-BS-70", quantity: 350, packaging_status: "Packed with Polybag, Sticker & Logo", packaging_status_ur: "پیک شدہ مع تھیلی، سٹیکر اور لوگو", qc_passed: true, storage_location: "FG-Store-Rack-1" }
  ],
  dispatchChallans: [
    { id: 1, challan_number: "DC-OUT-501", destination_type: "External Factory", destination_type_ur: "بیرونی فیکٹری", destination_name: "Sunrise Auto Industries Warehouse #3", destination_name_ur: "سن رائز آٹو انڈسٹریز گودام #3", dispatch_date: "2026-09-19", vehicle_no: "LES-4589", driver_name: "Nasir Hussain", driver_name_ur: "ناصر حسین", gate_pass_no: "GP-102", status: "Dispatched", status_ur: "روانہ کردہ", items: [{ article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", article_name_ur: "موٹرسائیکل بریک شو اسمبلی", quantity: 150 }] }
  ],
  purchaseOrders: [
    { id: 1, po_number: "PO-401", supplier_name: "Pak Auto Casting Industries (Pvt) Ltd", supplier_name_ur: "پاک آٹو کاسٹنگ انڈسٹریز", order_date: "2026-09-19", total_amount: 142500, status: "Completed", status_ur: "مکمل شدہ", items: [{ material_name: "Brake Shoe Core Castings", material_code: "CP-BSC-02", quantity: 1500, unit_price: 95, received_quantity: 1500 }] }
  ],
  grns: [
    { id: 1, grn_number: "GRN-801", supplier_name: "Pak Auto Casting Industries (Pvt) Ltd", supplier_name_ur: "پاک آٹو کاسٹنگ انڈسٹریز", po_number: "PO-401", delivery_challan_no: "DC-9842", receiving_date: "2026-09-19", received_by: "Asghar Ali (Storekeeper)", received_by_ur: "اصغر علی (سٹور کیپر)", remarks: "Material OK", remarks_ur: "مال اوکے ہے", items: [{ material_name: "Brake Shoe Core Castings", received_qty: 1500, accepted_qty: 1500, unit: "Pieces", unit_ur: "پیس" }] }
  ],
  employees: [
    { id: 1, emp_code: "EMP-101", full_name: "Muhammad Afzal", full_name_ur: "محمد افضل", designation: "Press Operator (Piece-Rate)", designation_ur: "پریس آپریٹر (ٹھیکہ ورکر)", department: "Production", department_ur: "پروڈکشن", phone: "0301-1234567", employment_type: "Piece-Rate", employment_type_ur: "پر پیس ٹھیکہ", base_salary: 0, piece_rate_default: 4.5 },
    { id: 2, emp_code: "EMP-102", full_name: "Tariq Mehmood", full_name_ur: "طارق محمود", designation: "Assembly Craftsman (Piece-Rate)", designation_ur: "اسمبلی کاریگر (ٹھیکہ ورکر)", department: "Production", department_ur: "پروڈکشن", phone: "0322-2345678", employment_type: "Piece-Rate", employment_type_ur: "پر پیس ٹھیکہ", base_salary: 0, piece_rate_default: 6.0 },
    { id: 3, emp_code: "EMP-103", full_name: "Bilal Ahmed", full_name_ur: "بلال احمد", designation: "Packaging & Sticker (Piece-Rate)", designation_ur: "پیکنگ و سٹیکرنگ (ٹھیکہ ورکر)", department: "Packaging", department_ur: "پیکنگ", phone: "0334-3456789", employment_type: "Piece-Rate", employment_type_ur: "پر پیس ٹھیکہ", base_salary: 0, piece_rate_default: 2.5 },
    { id: 4, emp_code: "EMP-104", full_name: "Asghar Ali", full_name_ur: "اصغر علی", designation: "Head Storekeeper", designation_ur: "ہیڈ سٹور کیپر", department: "Raw Store", department_ur: "را سٹور", phone: "0345-4567890", employment_type: "Salaried", employment_type_ur: "ماہانہ تنخواہ", base_salary: 45000, piece_rate_default: 0 },
    { id: 5, emp_code: "EMP-105", full_name: "Kamran Nawaz", full_name_ur: "کامران نواز", designation: "QC Inspector", designation_ur: "کوالٹی کنٹرول انسپکٹر", department: "QC", department_ur: "کوالٹی چیک", phone: "0312-5678901", employment_type: "Salaried", employment_type_ur: "ماہانہ تنخواہ", base_salary: 50000, piece_rate_default: 0 }
  ],
  attendances: [
    { id: 1, employee_id: 1, emp_code: "EMP-101", employee_name: "Muhammad Afzal", employee_name_ur: "محمد افضل", department: "Production", department_ur: "پروڈکشن", date: "2026-09-19", status: "Present", status_ur: "حاضر", check_in: "08:00 AM", check_out: "06:00 PM", overtime_hours: 2.0, remarks: "Overtime Pressing", remarks_ur: "اوور ٹائم پریسنگ" },
    { id: 2, employee_id: 2, emp_code: "EMP-102", employee_name: "Tariq Mehmood", employee_name_ur: "طارق محمود", department: "Production", department_ur: "پروڈکشن", date: "2026-09-19", status: "Present", status_ur: "حاضر", check_in: "08:15 AM", check_out: "05:00 PM", overtime_hours: 0, remarks: "On Time", remarks_ur: "آن ٹائم" },
    { id: 3, employee_id: 3, emp_code: "EMP-103", employee_name: "Bilal Ahmed", employee_name_ur: "بلال احمد", department: "Packaging", department_ur: "پیکنگ", date: "2026-09-19", status: "Present", status_ur: "حاضر", check_in: "08:00 AM", check_out: "07:00 PM", overtime_hours: 3.0, remarks: "Packaging Overtime", remarks_ur: "پیکنگ اوور ٹائم" }
  ],
  pieceWorks: [
    { id: 1, employee_id: 1, employee_name: "Muhammad Afzal", employee_name_ur: "محمد افضل", emp_code: "EMP-101", article_name: "Motorcycle Brake Shoe Assembly", article_name_ur: "موٹرسائیکل بریک شو اسمبلی", step_name: "Step 1: Stamping & Cutting", step_name_ur: "مرحلہ 1: پریسنگ / کٹنگ", date: "2026-09-19", pieces_completed: 200, rate_per_piece: 2.5, total_earning: 500, approved_by: "Supervisor", approved_by_ur: "سپروائزر" },
    { id: 2, employee_id: 2, employee_name: "Tariq Mehmood", employee_name_ur: "طارق محمود", emp_code: "EMP-102", article_name: "Motorcycle Brake Shoe Assembly", article_name_ur: "موٹرسائیکل بریک شو اسمبلی", step_name: "Step 2: Sub-Assembly Fitting", step_name_ur: "مرحلہ 2: چھوٹے پرزوں کی فٹنگ", date: "2026-09-19", pieces_completed: 150, rate_per_piece: 4.0, total_earning: 600, approved_by: "Supervisor", approved_by_ur: "سپروائزر" }
  ],
  leaves: [
    { id: 1, employee_name: "Muhammad Afzal", employee_name_ur: "محمد افضل", leave_type: "Casual Leave", leave_type_ur: "اتفاقی چھٹی", start_date: "2026-09-22", end_date: "2026-09-22", total_days: 1, reason: "Personal Urgent Work", reason_ur: "ضروری گھریلو کام", status: "Approved", status_ur: "منظور شدہ" }
  ]
};

// Initialize Local Database from localStorage if available
let db = JSON.parse(localStorage.getItem("mufti_erp_db")) || INITIAL_STORE;
function saveLocalDB() {
  localStorage.setItem("mufti_erp_db", JSON.stringify(db));
}

// State
let currentRole = "Admin";
let currentView = "dashboard";
let currentBOMData = null;
let articlesCache = [];
let rawMaterialsCache = [];
let suppliersCache = [];
let employeesCache = [];

const ROLE_PERMISSIONS = {
  Admin: ["dashboard", "po", "grn", "raw_store", "sampling", "bom", "work_orders", "fg", "dispatch", "hr", "rbac"],
  Storekeeper: ["dashboard", "po", "grn", "raw_store"],
  Production: ["dashboard", "sampling", "bom", "work_orders", "fg"],
  HR: ["dashboard", "hr"],
  Dispatch: ["dashboard", "fg", "dispatch"]
};

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  // Test if local backend exists
  try {
    const testRes = await fetch(`${API_BASE}/api/dashboard/stats`, { signal: AbortSignal.timeout(1000) });
    if (testRes.ok) isLocalBackend = true;
  } catch (e) {
    isLocalBackend = false;
  }

  const today = new Date().toISOString().split("T")[0];
  const attDateFilter = document.getElementById("attendance-date-filter");
  if (attDateFilter) attDateFilter.value = today;

  // Apply Language Mode
  setLanguage(currentLang, false);

  await initialLoad();
  applyRolePermissions(currentRole);
});

// Helper function to safely set element innerText without throwing null exceptions
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

const I18N = {
  en: {
    brandName: "MUFTI AUTO STORE",
    brandSub: "Auto Parts Manufacturing & Production Management ERP",
    userRole: "User Role:",
    navMenu: "NAVIGATION MENU",
    roles: {
      Admin: "Super Admin (All Modules)",
      Storekeeper: "Store Incharge (Raw Store / GRN)",
      Production: "Production Manager (BOM / Work Order)",
      HR: "HR Manager (Attendance / Piece-Rate)",
      Dispatch: "Dispatch Officer (Finished Goods / Challan)"
    },
    nav: {
      dashboard: "Dashboard",
      po: "Purchase Orders",
      grn: "Raw Receiving (GRN)",
      raw_store: "Raw Store Inventory",
      sampling: "Sampling & Recipe",
      bom: "Bill of Materials (BOM)",
      work_orders: "Production Work Orders",
      fg: "Finished Goods (FG)",
      dispatch: "Outward Dispatch",
      hr: "HR & Piece-Rate",
      rbac: "User Roles (RBAC)"
    },
    dash: {
      rawLbl: "Total Raw Materials",
      lowAlert: "Low Stock Items",
      woLbl: "Active Work Orders",
      woSub: "In Progress Stages",
      fgLbl: "Finished Goods Stock",
      fgSub: "Ready for Dispatch",
      attLbl: "Today's Attendance",
      attSub: "Staff & Piece Workers",
      modTitle: "Production Modules & Quick Operations",
      modSub: "Click any module to manage",
      cardPO: "Purchase Orders",
      cardSubPO: "Supplier Procurement",
      cardGRN: "Raw Receiving (GRN)",
      cardSubGRN: "Challans & Gate Receipts",
      cardRaw: "Raw Store Inventory",
      cardSubRaw: "Metals, Parts & Bags",
      cardSampling: "Sampling & Recipe",
      cardSubSampling: "Master Part Recipes",
      cardBOM: "Bill of Materials (BOM)",
      cardSubBOM: "Auto Stock Calculation",
      cardWO: "Production Work Orders",
      cardSubWO: "5-Stage Assembly Floor",
      cardFG: "Finished Goods (FG)",
      cardSubFG: "Packed & QC Verified",
      cardDispatch: "Outward Dispatch",
      cardSubDispatch: "Challans & Gate Passes",
      cardHR: "HR & Piece-Rate",
      cardSubHR: "Attendance & Worker Pay",
      cardRBAC: "User Roles (RBAC)",
      cardSubRBAC: "System Permissions",
      woTblTitle: "Active Production Work Orders",
      viewAll: "View All",
      stockTblTitle: "Low Stock Warning (Raw Store)",
      viewStore: "View Store",
      thWoNum: "WO #",
      thWoArt: "Article",
      thWoQty: "Target / Done",
      thWoSt: "Status",
      thStCode: "Code",
      thStName: "Item Name",
      thStStock: "Current Stock",
      thStAlert: "Alert Level"
    },
    po: {
      title: "Purchase Order Management",
      sub: "Procure raw materials, child parts, and packaging from suppliers",
      btnNew: "New Purchase Order",
      thNum: "PO Number",
      thSup: "Supplier",
      thDate: "Order Date",
      thTot: "Total Amount (PKR)",
      thSt: "Status",
      thAct: "Action"
    },
    grn: {
      title: "Goods Receiving Note (GRN)",
      sub: "Receive supplier shipments, inspect quality, and auto-update raw store inventory",
      btnNew: "New GRN Entry",
      thNum: "GRN #",
      thDc: "Supplier DC #",
      thSup: "Supplier Name",
      thDate: "Receiving Date",
      thBy: "Received By",
      thAct: "Print Voucher"
    },
    raw: {
      title: "Raw Store Inventory",
      sub: "Live stock of raw metals, child parts, springs, rivets, bags, stickers & logos",
      btnNew: "Add New Item",
      thCode: "Code",
      thName: "Item Name",
      thCat: "Category",
      thStk: "Current Stock",
      thUnit: "Unit",
      thPrice: "Unit Price",
      thLoc: "Location",
      thStat: "Status"
    },
    bom: {
      title: "Bill of Materials Generator",
      sub: "Select an article, enter target quantity (e.g. 200 pcs), and the system automatically calculates all required parts, bags, stickers, and logos against raw store stock!",
      lblSelect: "Select Finished Article:",
      lblQty: "Target Quantity:",
      btnCalc: "Calculate Recipe",
      btnConvert: "Convert to Work Order",
      savedTitle: "Saved BOMs History"
    },
    sampling: {
      title: "Sampling & Master Recipe",
      sub: "Define auto part components: core parts, child parts, packaging bags, stickers & logos"
    },
    wo: {
      title: "Multi-Step Production Work Orders",
      sub: "Stamping, Sub-Assembly, Riveting, Quality Inspection & Final Packaging"
    },
    fg: {
      title: "Finished Goods & Packaging Store",
      sub: "Verified parts packed with polybags, stickers, and hologram logos"
    },
    disp: {
      title: "Outward Dispatch Challan & Gate Pass",
      sub: "Delivery challans for sending finished auto parts to factories or customer warehouses",
      btnNew: "New Dispatch Challan"
    },
    hr: {
      title: "HR, Attendance & Piece-Rate System",
      sub: "Staff attendance, overtime, piece-rate (ٹھیکہ) earnings & leave management",
      btnNewEmp: "Add New Staff"
    },
    rbac: {
      title: "Role-Based Access Control (RBAC)",
      sub: "Control module visibility and permissions for Store Incharge, Production, HR & Dispatch"
    }
  },
  ur: {
    brandName: "مفتی آٹو سٹور",
    brandSub: "آٹو پارٹس مینوفیکچرنگ اینڈ پروڈکشن مینجمنٹ سسٹم",
    userRole: "یوزر رول:",
    navMenu: "نیویگیشن مینو",
    roles: {
      Admin: "سپر ایڈمن (تمام ماڈیولز)",
      Storekeeper: "سٹور انچارج (را سٹور / جی آر این)",
      Production: "پروڈکشن منیجر (BOM / ورک آرڈر)",
      HR: "ایچ آر منیجر (حاضری / ٹھیکہ)",
      Dispatch: "ڈسپیچ آفیسر (فنش گڈز / چالان)"
    },
    nav: {
      dashboard: "ڈیش بورڈ",
      po: "پرچیز آرڈر (PO)",
      grn: "را مٹیریل ریسیونگ (GRN)",
      raw_store: "را سٹور انوینٹری",
      sampling: "سیمپلنگ و ریسیپی",
      bom: "بل آف مٹیریل (BOM)",
      work_orders: "پروڈکشن ورک آرڈر",
      fg: "فنش گڈز و پیکنگ",
      dispatch: "ڈسپیچ چالان",
      hr: "ایچ آر و ٹھیکہ سسٹم",
      rbac: "رولز و یوزر کنٹرول"
    },
    dash: {
      rawLbl: "کل را مٹیریل آئٹمز",
      lowAlert: "کم سٹاک آئٹمز",
      woLbl: "ایکٹو ورک آرڈرز",
      woSub: "مراحل میں جاری",
      fgLbl: "فنش گڈز سٹاک",
      fgSub: "ڈسپیچ کیلئے تیار",
      attLbl: "آج کی ورکرز حاضری",
      attSub: "سٹاف و ٹھیکہ ورکرز",
      modTitle: "مینوفیکچرنگ ماڈیولز و فوری رسائی",
      modSub: "کسی بھی ماڈیول پر کلک کر کے انتظام کریں",
      cardPO: "پرچیز آرڈر (PO)",
      cardSubPO: "خام مال و پرزہ جات خریداری",
      cardGRN: "را مٹیریل ریسیونگ (GRN)",
      cardSubGRN: "سپلائر چالان و مال وصولی",
      cardRaw: "را سٹور انوینٹری",
      cardSubRaw: "پرزہ جات، تھیلی، سٹیکر، لوگو",
      cardSampling: "سیمپلنگ و ریسیپی",
      cardSubSampling: "ماسٹر پارٹ ریسیپیز",
      cardBOM: "بل آف مٹیریل (BOM)",
      cardSubBOM: "خودکار سٹاک و ریسیپی حساب",
      cardWO: "پروڈکشن ورک آرڈر",
      cardSubWO: "5 مراحل پر مشتمل اسمبلی",
      cardFG: "فنش گڈز و پیکنگ",
      cardSubFG: "تیار سٹاک مع تھیلی، سٹیکر، لوگو",
      cardDispatch: "ڈسپیچ چالان و گیٹ پاس",
      cardSubDispatch: "روانگی چالان و گیٹ پاس",
      cardHR: "ایچ آر و ٹھیکہ سسٹم",
      cardSubHR: "حاضری و پر پیس ٹھیکہ اجرت",
      cardRBAC: "رولز و یوزر کنٹرول",
      cardSubRBAC: "سسٹم پرمیشنز و اختیارات",
      woTblTitle: "جاری پروڈکشن ورک آرڈرز",
      viewAll: "سب دیکھیں",
      stockTblTitle: "کم سٹاک الرٹ (را سٹور)",
      viewStore: "سٹور دیکھیں",
      thWoNum: "ورک آرڈر #",
      thWoArt: "آرٹیکل",
      thWoQty: "ہدف / مکمل",
      thWoSt: "سٹیٹس",
      thStCode: "کوڈ",
      thStName: "آئٹم کا نام",
      thStStock: "موجودہ سٹاک",
      thStAlert: "الرٹ لیول"
    },
    po: {
      title: "پرچیز آرڈر مینجمنٹ",
      sub: "خام مال، چائلڈ پارٹس اور پیکنگ میٹریل کے لیے سپلائرز کو جاری کیے گئے آرڈرز",
      btnNew: "نیا پرچیز آرڈر بنائیں",
      thNum: "PO نمبر",
      thSup: "سپلائر",
      thDate: "تاریخ آرڈر",
      thTot: "کل رقم (PKR)",
      thSt: "سٹیٹس",
      thAct: "ایکشن"
    },
    grn: {
      title: "را مٹیریل ریسیونگ (GRN)",
      sub: "سپلائر سے مال کی آمد پر جی آر این بنائیں، چیکنگ کریں اور را سٹور میں سٹاک خودکار شامل کریں",
      btnNew: "نئی GRN ریسیونگ درج کریں",
      thNum: "GRN نمبر",
      thDc: "سپلائر چالان نمبر",
      thSup: "سپلائر کا نام",
      thDate: "تاریخ ریسیونگ",
      thBy: "وصول کنندہ",
      thAct: "پرنٹ واؤچر"
    },
    raw: {
      title: "را سٹور انوینٹری",
      sub: "خام مال، چائلڈ پارٹس، سپرنگ، ریوٹ، تھیلی، سٹیکر اور لوگو کا لائیو سٹاک",
      btnNew: "نیا آئٹم شامل کریں",
      thCode: "کوڈ",
      thName: "آئٹم کا نام",
      thCat: "کیٹیگری",
      thStk: "موجودہ سٹاک",
      thUnit: "یونٹ",
      thPrice: "فی یونٹ قیمت",
      thLoc: "لوکیشن",
      thStat: "سٹیٹس"
    },
    bom: {
      title: "بل آف مٹیریل جنریٹر",
      sub: "آرٹیکل منتخب کریں، مطلوبہ تعداد (جیسے 200 پیس) درج کریں، سسٹم خودکار طریقے سے تمام پارٹس، تھیلی، سٹیکر اور لوگو کا حساب نکال کر را سٹور سٹاک سے موازنہ کرے گا!",
      lblSelect: "آرٹیکل منتخب کریں:",
      lblQty: "مطلوبہ تعداد:",
      btnCalc: "ریسیپی کیلکولیٹ کریں",
      btnConvert: "ورک آرڈر میں تبدیل کریں",
      savedTitle: "محفوظ شدہ بل آف مٹیریلز"
    },
    sampling: {
      title: "سیمپلنگ و ماسٹر ریسیپی",
      sub: "مین پارٹ، چائلڈ پارٹس، پیکنگ تھیلی، سٹیکر اور لوگو کی ریسیپی ڈیفینیشن"
    },
    wo: {
      title: "پروڈکشن اور ورک آرڈر مراحل",
      sub: "کٹنگ، سب اسمبلی، ویلڈنگ، کوالٹی چیک، اور پیکنگ (ساتھ پر پیس ٹھیکہ ورک اندراج)"
    },
    fg: {
      title: "فنش گڈز سٹور و پیکنگ",
      sub: "پروڈکشن سے مکمل، تھیلی، سٹیکر اور لوگو لگ کر تیار پارٹس کا سٹاک"
    },
    disp: {
      title: "ڈسپیچ چالان و گیٹ پاس",
      sub: "فیکٹری یا کسٹمر گودام کو مال روانگی کے چالان اور گیٹ پاس",
      btnNew: "نیا ڈسپیچ چالان بنائیں"
    },
    hr: {
      title: "ایچ آر، حاضری و پر پیس ٹھیکہ سسٹم",
      sub: "حاضری، اوور ٹائم، پر پیس ٹھیکہ ورکرز کا حساب اور چھٹیاں (Leaves)",
      btnNewEmp: "نیا ملازم شامل کریں"
    },
    rbac: {
      title: "رولز و یوزر لیمیٹیشن کنٹرول",
      sub: "ایچ آر، سٹور مین، پروڈکشن والے کو کیا کیا دکھانا ہے اور کیا نہیں دکھانا، مکمل کنٹرول"
    }
  }
};

function setLanguage(lang, reloadView = true) {
  currentLang = lang;
  localStorage.setItem("mufti_erp_lang", lang);

  const html = document.getElementById("html-root");
  if (html) {
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  }

  // Toggle button active states in Header
  const btnEn = document.getElementById("lang-btn-en");
  const btnUr = document.getElementById("lang-btn-ur");

  if (lang === "en") {
    if (btnEn) btnEn.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm";
    if (btnUr) btnUr.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
  } else {
    if (btnUr) btnUr.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm";
    if (btnEn) btnEn.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
  }

  const t = I18N[lang];

  // Header & Nav
  setText("header-brand-name", t.brandName);
  setText("header-brand-sub", t.brandSub);
  setText("label-user-role", t.userRole);
  setText("sidebar-label-nav", t.navMenu);

  // Role selector options
  const roleSel = document.getElementById("role-selector");
  if (roleSel && roleSel.options.length >= 5) {
    roleSel.options[0].text = t.roles.Admin;
    roleSel.options[1].text = t.roles.Storekeeper;
    roleSel.options[2].text = t.roles.Production;
    roleSel.options[3].text = t.roles.HR;
    roleSel.options[4].text = t.roles.Dispatch;
  }

  // Nav Items
  setText("nav-txt-dashboard", t.nav.dashboard);
  setText("nav-txt-po", t.nav.po);
  setText("nav-txt-grn", t.nav.grn);
  setText("nav-txt-raw_store", t.nav.raw_store);
  setText("nav-txt-sampling", t.nav.sampling);
  setText("nav-txt-bom", t.nav.bom);
  setText("nav-txt-work_orders", t.nav.work_orders);
  setText("nav-txt-fg", t.nav.fg);
  setText("nav-txt-dispatch", t.nav.dispatch);
  setText("nav-txt-hr", t.nav.hr);
  setText("nav-txt-rbac", t.nav.rbac);

  // Top Stat Tiles
  setText("stat-lbl-raw", t.dash.rawLbl);
  setText("stat-lbl-low-alert", t.dash.lowAlert);
  setText("stat-lbl-wo", t.dash.woLbl);
  setText("stat-lbl-wo-sub", t.dash.woSub);
  setText("stat-lbl-fg", t.dash.fgLbl);
  setText("stat-lbl-fg-sub", t.dash.fgSub);
  setText("stat-lbl-att", t.dash.attLbl);
  setText("stat-lbl-att-sub", t.dash.attSub);

  // Dashboard Module Cards
  setText("dash-mod-title", t.dash.modTitle);
  setText("dash-mod-sub", t.dash.modSub);
  setText("card-txt-po", t.dash.cardPO);
  setText("card-sub-po", t.dash.cardSubPO);
  setText("card-txt-grn", t.dash.cardGRN);
  setText("card-sub-grn", t.dash.cardSubGRN);
  setText("card-txt-raw_store", t.dash.cardRaw);
  setText("card-sub-raw_store", t.dash.cardSubRaw);
  setText("card-txt-sampling", t.dash.cardSampling);
  setText("card-sub-sampling", t.dash.cardSubSampling);
  setText("card-txt-bom", t.dash.cardBOM);
  setText("card-sub-bom", t.dash.cardSubBOM);
  setText("card-txt-work_orders", t.dash.cardWO);
  setText("card-sub-work_orders", t.dash.cardSubWO);
  setText("card-txt-fg", t.dash.cardFG);
  setText("card-sub-fg", t.dash.cardSubFG);
  setText("card-txt-dispatch", t.dash.cardDispatch);
  setText("card-sub-dispatch", t.dash.cardSubDispatch);
  setText("card-txt-hr", t.dash.cardHR);
  setText("card-sub-hr", t.dash.cardSubHR);
  setText("card-txt-rbac", t.dash.cardRBAC);
  setText("card-sub-rbac", t.dash.cardSubRBAC);

  // Dashboard Tables
  setText("dash-tbl-wo-title", t.dash.woTblTitle);
  setText("dash-tbl-wo-viewall", t.dash.viewAll);
  setText("dash-tbl-stock-title", t.dash.stockTblTitle);
  setText("dash-tbl-stock-viewall", t.dash.viewStore);
  setText("th-wo-num", t.dash.thWoNum);
  setText("th-wo-art", t.dash.thWoArt);
  setText("th-wo-qty", t.dash.thWoQty);
  setText("th-wo-st", t.dash.thWoSt);
  setText("th-st-code", t.dash.thStCode);
  setText("th-st-name", t.dash.thStName);
  setText("th-st-stock", t.dash.thStStock);
  setText("th-st-alert", t.dash.thStAlert);

  // PO texts
  setText("po-page-title", t.po.title);
  setText("po-page-sub", t.po.sub);
  setText("po-btn-new", t.po.btnNew);
  setText("th-po-num", t.po.thNum);
  setText("th-po-sup", t.po.thSup);
  setText("th-po-date", t.po.thDate);
  setText("th-po-tot", t.po.thTot);
  setText("th-po-st", t.po.thSt);
  setText("th-po-act", t.po.thAct);

  // GRN texts
  setText("grn-page-title", t.grn.title);
  setText("grn-page-sub", t.grn.sub);
  setText("grn-btn-new", t.grn.btnNew);
  setText("th-grn-num", t.grn.thNum);
  setText("th-grn-dc", t.grn.thDc);
  setText("th-grn-sup", t.grn.thSup);
  setText("th-grn-date", t.grn.thDate);
  setText("th-grn-by", t.grn.thBy);
  setText("th-grn-act", t.grn.thAct);

  // Raw store texts
  setText("raw-page-title", t.raw.title);
  setText("raw-page-sub", t.raw.sub);
  setText("raw-btn-new", t.raw.btnNew);
  setText("th-raw-code", t.raw.thCode);
  setText("th-raw-name", t.raw.thName);
  setText("th-raw-cat", t.raw.thCat);
  setText("th-raw-stk", t.raw.thStk);
  setText("th-raw-unit", t.raw.thUnit);
  setText("th-raw-price", t.raw.thPrice);
  setText("th-raw-loc", t.raw.thLoc);
  setText("th-raw-stat", t.raw.thStat);

  // BOM texts
  setText("bom-page-title", t.bom.title);
  setText("bom-page-sub", t.bom.sub);
  setText("bom-lbl-select", t.bom.lblSelect);
  setText("bom-lbl-qty", t.bom.lblQty);
  setText("bom-btn-calc", t.bom.btnCalc);
  setText("bom-saved-title", t.bom.savedTitle);

  // Other modules
  setText("sample-page-title", t.sampling ? t.sampling.title : (lang === "ur" ? "سیمپلنگ و ماسٹر ریسیپی" : "Sampling & Master Recipe"));
  setText("sample-page-sub", t.sampling ? t.sampling.sub : (lang === "ur" ? "مین پارٹ، چائلڈ پارٹس، پیکنگ تھیلی، سٹیکر اور لوگو کی ریسیپی ڈیفینیشن" : "Define auto part components: core parts, child parts, packaging bags, stickers & logos"));
  setText("wo-page-title", t.wo.title);
  setText("wo-page-sub", t.wo.sub);
  setText("fg-page-title", t.fg.title);
  setText("fg-page-sub", t.fg.sub);
  setText("disp-page-title", t.disp.title);
  setText("disp-page-sub", t.disp.sub);
  setText("disp-btn-new", t.disp.btnNew);
  setText("hr-page-title", t.hr.title);
  setText("hr-page-sub", t.hr.sub);
  setText("hr-btn-new-emp", t.hr.btnNewEmp);
  setText("rbac-page-title", t.rbac.title);
  setText("rbac-page-sub", t.rbac.sub);

  if (reloadView) {
    navigate(currentView);
  } else {
    loadDashboardStats();
  }

  if (window.lucide) lucide.createIcons();
}

async function initialLoad() {
  await Promise.all([
    loadDashboardStats(),
    loadArticles(),
    loadRawMaterials(),
    loadSuppliers(),
    loadEmployees(),
    loadRolesAndUsers()
  ]);
  navigate(currentView);
}

// ----------------- RBAC & ROLE SWITCHER -----------------

function changeActiveRole(newRole) {
  currentRole = newRole;
  applyRolePermissions(newRole);
  const allowed = ROLE_PERMISSIONS[newRole] || [];
  if (!allowed.includes(currentView)) {
    navigate("dashboard");
  }
}

function applyRolePermissions(role) {
  const allowed = ROLE_PERMISSIONS[role] || [];
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach(btn => {
    const id = btn.id.replace("nav-", "");
    if (allowed.includes(id)) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  });
}

// ----------------- NAVIGATION -----------------

function navigate(viewName) {
  const allowed = ROLE_PERMISSIONS[currentRole] || [];
  if (!allowed.includes(viewName)) {
    alert(currentLang === "ur" ? "آپ کے مقررہ رول کو اس ماڈیول تک رسائی کی اجازت نہیں ہے۔" : "Access Restricted for this User Role.");
    return;
  }

  currentView = viewName;
  document.querySelectorAll("main > section").forEach(v => v.classList.add("hidden"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove("hidden");

  // Highlight active menu-box
  document.querySelectorAll(".menu-box").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`nav-${viewName}`);
  if (activeBtn) activeBtn.classList.add("active");

  if (viewName === "dashboard") loadDashboardStats();
  if (viewName === "po") loadPurchaseOrders();
  if (viewName === "grn") loadGRNs();
  if (viewName === "raw_store") loadRawMaterials();
  if (viewName === "sampling") loadSamplingRecipes();
  if (viewName === "bom") loadBOMModule();
  if (viewName === "work_orders") loadWorkOrders();
  if (viewName === "fg") loadFinishedGoods();
  if (viewName === "dispatch") loadDispatchChallans();
  if (viewName === "hr") loadAttendance();
  if (viewName === "rbac") loadRolesAndUsers();

  if (window.lucide) lucide.createIcons();
}

function refreshCurrentView() {
  navigate(currentView);
}

// ----------------- 1. DASHBOARD -----------------

async function loadDashboardStats() {
  const stats = getLocalStats();

  document.getElementById("stat-raw-items").innerText = stats.raw_materials_count;
  document.getElementById("stat-low-stock").innerText = stats.low_stock_count;
  document.getElementById("stat-active-wo").innerText = stats.active_work_orders;
  document.getElementById("stat-fg-qty").innerText = stats.finished_goods_qty;
  document.getElementById("stat-attendance").innerText = `${stats.today_present_count} / ${stats.total_employees}`;

  // Work orders table in dashboard
  const wos = db.workOrders;
  const woTbody = document.getElementById("dash-wo-table");
  if (wos.length === 0) {
    woTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">${currentLang === "ur" ? "کوئی ایکٹو ورک آرڈر نہیں ملا" : "No active work orders found"}</td></tr>`;
  } else {
    woTbody.innerHTML = wos.slice(0, 5).map(w => `
      <tr class="hover:bg-slate-50">
        <td class="py-2.5 px-3 font-semibold text-slate-800">${w.wo_number}</td>
        <td class="py-2.5 px-3">${currentLang === "ur" ? (w.article_name_ur || w.article_name) : w.article_name}</td>
        <td class="py-2.5 px-3 font-medium">${w.produced_quantity} / ${w.target_quantity}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${w.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
            ${currentLang === "ur" ? (w.status_ur || w.status) : w.status}
          </span>
        </td>
      </tr>
    `).join("");
  }

  // Stock table
  const mats = db.rawMaterials;
  const lowMats = mats.filter(m => m.current_stock <= m.min_alert_level);
  const stockTbody = document.getElementById("dash-stock-table");
  if (lowMats.length === 0) {
    stockTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-emerald-600 font-medium">${currentLang === "ur" ? "تمام مٹیریل مناسب مقدار میں موجود ہیں!" : "All materials in sufficient stock!"}</td></tr>`;
  } else {
    stockTbody.innerHTML = lowMats.map(m => `
      <tr class="hover:bg-amber-50/50">
        <td class="py-2.5 px-3 font-mono text-slate-700">${m.code}</td>
        <td class="py-2.5 px-3 font-medium text-slate-800">${currentLang === "ur" ? (m.name_ur || m.name) : m.name}</td>
        <td class="py-2.5 px-3 text-red-600 font-bold">${m.current_stock} ${currentLang === "ur" ? (m.unit_ur || m.unit) : m.unit}</td>
        <td class="py-2.5 px-3 text-slate-500">${m.min_alert_level} ${currentLang === "ur" ? (m.unit_ur || m.unit) : m.unit}</td>
      </tr>
    `).join("");
  }
}

function getLocalStats() {
  const lowCount = db.rawMaterials.filter(m => m.current_stock <= m.min_alert_level).length;
  const activeWOs = db.workOrders.filter(w => w.status !== "Completed").length;
  const fgTotal = db.finishedGoods.reduce((sum, f) => sum + f.quantity, 0);
  const presentToday = db.attendances.filter(a => a.status === "Present").length;

  return {
    raw_materials_count: db.rawMaterials.length,
    low_stock_count: lowCount,
    active_work_orders: activeWOs,
    finished_goods_qty: fgTotal,
    today_present_count: presentToday,
    total_employees: db.employees.length
  };
}

// ----------------- 2. PURCHASE ORDERS -----------------

async function loadPurchaseOrders() {
  const pos = db.purchaseOrders;
  const tbody = document.getElementById("po-table-body");
  if (pos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">${currentLang === "ur" ? "کوئی پرچیز آرڈر موجود نہیں ہے" : "No purchase orders found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = pos.map(po => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-blue-600">${po.po_number}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${currentLang === "ur" ? (po.supplier_name_ur || po.supplier_name) : po.supplier_name}</td>
      <td class="py-3 px-4">${po.order_date}</td>
      <td class="py-3 px-4 font-semibold">PKR ${po.total_amount.toLocaleString()}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${po.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${currentLang === "ur" ? (po.status_ur || po.status) : po.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="printPO(${JSON.stringify(po).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> ${currentLang === "ur" ? "پرنٹ" : "Print"}
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewPOModal() {
  const isUr = currentLang === "ur";
  const supplierOptions = suppliersCache.map(s => `<option value="${s.id}">${isUr ? (s.name_ur || s.name) : s.name}</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${isUr ? (m.name_ur || m.name) : m.name} (${m.code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="shopping-cart" class="w-5 h-5 text-blue-600"></i>
          ${isUr ? "نیا پرچیز آرڈر بنائیں" : "New Purchase Order"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "PO نمبر:" : "PO Number:"}</label>
          <input type="text" id="po-num" value="PO-${Date.now().toString().slice(-5)}" class="w-full border border-slate-300 rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "سپلائر منتخب کریں:" : "Select Supplier:"}</label>
          <select id="po-supplier" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
            ${supplierOptions}
          </select>
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-3">
        <h4 class="text-xs font-bold text-slate-700">${isUr ? "آرڈر آئٹمز:" : "Order Items:"}</h4>
        <div class="grid grid-cols-12 gap-2 text-xs">
          <div class="col-span-6">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "را مٹیریل / چائلڈ پارٹ:" : "Material / Part:"}</label>
            <select id="po-item-mat" class="w-full border rounded p-1.5 bg-white">${materialOptions}</select>
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "کوانٹٹی:" : "Quantity:"}</label>
            <input type="number" id="po-item-qty" value="500" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "ریٹ فی یونٹ (PKR):" : "Unit Rate (PKR):"}</label>
            <input type="number" id="po-item-price" value="50" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitNewPO()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "آرڈر محفوظ کریں" : "Save Order"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitNewPO() {
  const poNum = document.getElementById("po-num").value;
  const supplierId = parseInt(document.getElementById("po-supplier").value);
  const supObj = suppliersCache.find(s => s.id === supplierId);
  const matId = parseInt(document.getElementById("po-item-mat").value);
  const matObj = rawMaterialsCache.find(m => m.id === matId);
  const qty = parseFloat(document.getElementById("po-item-qty").value);
  const price = parseFloat(document.getElementById("po-item-price").value);

  const newPO = {
    id: db.purchaseOrders.length + 1,
    po_number: poNum,
    supplier_name: supObj ? supObj.name : "Supplier",
    supplier_name_ur: supObj ? (supObj.name_ur || supObj.name) : "سپلائر",
    order_date: new Date().toISOString().split("T")[0],
    total_amount: qty * price,
    status: "Pending",
    status_ur: "زیر التواء",
    items: [{
      material_name: matObj ? matObj.name : "Material",
      material_code: matObj ? matObj.code : "CODE",
      quantity: qty,
      unit_price: price,
      received_quantity: 0
    }]
  };

  db.purchaseOrders.unshift(newPO);
  saveLocalDB();
  closeModal();
  loadPurchaseOrders();
  alert(currentLang === "ur" ? "پرچیز آرڈر کامیابی سے جاری ہو گیا!" : "Purchase order created successfully!");
}

// ----------------- 3. GRN & RECEIVING -----------------

async function loadGRNs() {
  const grns = db.grns;
  const tbody = document.getElementById("grn-table-body");
  if (grns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">${currentLang === "ur" ? "کوئی GRN ریکارڈ نہیں ہے" : "No GRN records found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = grns.map(g => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-emerald-600">${g.grn_number}</td>
      <td class="py-3 px-4 font-mono text-slate-700">${g.delivery_challan_no}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${currentLang === "ur" ? (g.supplier_name_ur || g.supplier_name) : g.supplier_name}</td>
      <td class="py-3 px-4">${g.receiving_date}</td>
      <td class="py-3 px-4 font-medium text-slate-700">${currentLang === "ur" ? (g.received_by_ur || g.received_by) : g.received_by}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="printGRN(${JSON.stringify(g).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> ${currentLang === "ur" ? "پرنٹ واؤچر" : "Print Voucher"}
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewGRNModal() {
  const isUr = currentLang === "ur";
  const supplierOptions = suppliersCache.map(s => `<option value="${s.id}">${isUr ? (s.name_ur || s.name) : s.name}</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${isUr ? (m.name_ur || m.name) : m.name} (${m.code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="package-check" class="w-5 h-5 text-emerald-600"></i>
          ${isUr ? "نئی GRN ریسیونگ و چالان اندراج" : "New Goods Received Note (GRN)"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "GRN نمبر:" : "GRN Number:"}</label>
          <input type="text" id="grn-num" value="GRN-${Date.now().toString().slice(-5)}" class="w-full border border-slate-300 rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "سپلائر چالان نمبر:" : "Supplier DC No:"}</label>
          <input type="text" id="grn-dc-num" placeholder="e.g. DC-9842" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "سپلائر:" : "Supplier:"}</label>
          <select id="grn-supplier" class="w-full border border-slate-300 rounded-lg p-2 bg-white">${supplierOptions}</select>
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-3">
        <h4 class="text-xs font-bold text-slate-700">${isUr ? "وصول شدہ را مٹیریل تفصیل:" : "Received Material Details:"}</h4>
        <div class="grid grid-cols-12 gap-2 text-xs">
          <div class="col-span-5">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "آئٹم منتخب کریں:" : "Select Item:"}</label>
            <select id="grn-item-mat" class="w-full border rounded p-1.5 bg-white">${materialOptions}</select>
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "وصول شدہ مقدار:" : "Received Qty:"}</label>
            <input type="number" id="grn-item-qty" value="200" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "مسترد (Rej):" : "Rejected Qty:"}</label>
            <input type="number" id="grn-item-rej" value="0" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "ریٹ فی یونٹ:" : "Unit Rate:"}</label>
            <input type="number" id="grn-item-price" value="0" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "وصول کنندہ:" : "Received By:"}</label>
          <input type="text" id="grn-receiver" value="${isUr ? 'اصغر علی (سٹور کیپر)' : 'Asghar Ali (Storekeeper)'}" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "ریمارکس:" : "Remarks:"}</label>
          <input type="text" id="grn-remarks" placeholder="${isUr ? 'مال بالکل درست ہے' : 'Inspected and verified OK'}" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitNewGRN()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "GRN محفوظ کریں اور سٹاک شامل کریں" : "Save GRN & Update Stock"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitNewGRN() {
  const grnNum = document.getElementById("grn-num").value;
  const dcNum = document.getElementById("grn-dc-num").value || "DC-DIRECT";
  const supplierId = parseInt(document.getElementById("grn-supplier").value);
  const supObj = suppliersCache.find(s => s.id === supplierId);
  const receiver = document.getElementById("grn-receiver").value;
  const remarks = document.getElementById("grn-remarks").value;

  const matId = parseInt(document.getElementById("grn-item-mat").value);
  const matObj = rawMaterialsCache.find(m => m.id === matId);
  const recQty = parseFloat(document.getElementById("grn-item-qty").value);
  const rejQty = parseFloat(document.getElementById("grn-item-rej").value);
  const accQty = Math.max(0, recQty - rejQty);

  const newGRN = {
    id: db.grns.length + 1,
    grn_number: grnNum,
    supplier_name: supObj ? supObj.name : "Supplier",
    supplier_name_ur: supObj ? (supObj.name_ur || supObj.name) : "سپلائر",
    delivery_challan_no: dcNum,
    po_number: "DIRECT",
    receiving_date: new Date().toISOString().split("T")[0],
    received_by: receiver,
    received_by_ur: receiver,
    remarks: remarks,
    items: [{ material_name: matObj ? matObj.name : "Material", received_qty: recQty, accepted_qty: accQty, unit: matObj ? matObj.unit : "Pieces" }]
  };

  const targetMat = db.rawMaterials.find(m => m.id === matId);
  if (targetMat) {
    targetMat.current_stock += accQty;
  }

  db.grns.unshift(newGRN);
  saveLocalDB();
  closeModal();
  await loadRawMaterials();
  await loadGRNs();
  alert(currentLang === "ur" ? `GRN محفوظ ہو گئی! ${accQty} یونٹس را سٹور انوینٹری میں شامل کر دیے گئے۔` : `GRN saved successfully! ${accQty} units added to raw store inventory.`);
}

// ----------------- 4. RAW STORE INVENTORY -----------------

async function loadRawMaterials(categoryFilter = "") {
  let materials = db.rawMaterials;
  if (categoryFilter) {
    materials = materials.filter(m => m.category === categoryFilter);
  }
  rawMaterialsCache = materials;

  const tbody = document.getElementById("raw-store-table-body");
  if (!tbody) return;

  tbody.innerHTML = materials.map(m => {
    const isLow = m.current_stock <= m.min_alert_level;
    return `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-mono font-semibold text-slate-700">${m.code}</td>
        <td class="py-3 px-4 font-bold text-slate-800">${currentLang === "ur" ? (m.name_ur || m.name) : m.name}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">${currentLang === "ur" ? (m.category_ur || m.category) : m.category}</span>
        </td>
        <td class="py-3 px-4 font-bold ${isLow ? 'text-red-600 font-extrabold' : 'text-slate-800'}">${m.current_stock}</td>
        <td class="py-3 px-4 text-slate-500">${currentLang === "ur" ? (m.unit_ur || m.unit) : m.unit}</td>
        <td class="py-3 px-4">PKR ${m.unit_price}</td>
        <td class="py-3 px-4 text-slate-500">${m.location}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
            ${isLow ? (currentLang === 'ur' ? 'کم سٹاک' : 'Low Stock') : (currentLang === 'ur' ? 'موجود' : 'Available')}
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

function filterRawMaterials(category) {
  loadRawMaterials(category);
}

function openNewMaterialModal() {
  const isUr = currentLang === "ur";
  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="boxes" class="w-5 h-5 text-amber-600"></i>
          ${isUr ? "نیا را مٹیریل / پارٹ شامل کریں" : "Add New Raw Material / Part"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "آئٹم کوڈ:" : "Item Code:"}</label>
          <input type="text" id="mat-code" placeholder="e.g. CP-SPR-10" class="w-full border rounded-lg p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "آئٹم کا نام:" : "Item Name:"}</label>
          <input type="text" id="mat-name" placeholder="e.g. Heavy Duty Spring" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "کیٹیگری:" : "Category:"}</label>
          <select id="mat-category" class="w-full border rounded-lg p-2 bg-white">
            <option value="Child Part">${isUr ? "چائلڈ پارٹ" : "Child Part"}</option>
            <option value="Raw Metal">${isUr ? "خام دھات" : "Raw Metal"}</option>
            <option value="Fastener">${isUr ? "سپرنگ و ریوٹس" : "Fastener"}</option>
            <option value="Packaging Bag">${isUr ? "پیکنگ تھیلی" : "Packaging Bag"}</option>
            <option value="Sticker">${isUr ? "سٹیکر" : "Sticker"}</option>
            <option value="Logo/Branding">${isUr ? "لوگو" : "Logo/Branding"}</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "پیمائش کا یونٹ:" : "Measurement Unit:"}</label>
          <select id="mat-unit" class="w-full border rounded-lg p-2 bg-white">
            <option value="Pieces">Pieces</option>
            <option value="KG">KG</option>
            <option value="Rolls">Rolls</option>
            <option value="Meters">Meters</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "شروع کا سٹاک:" : "Initial Stock:"}</label>
          <input type="number" id="mat-stock" value="0" min="0" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "کم سے کم الرٹ لیول:" : "Min Alert Level:"}</label>
          <input type="number" id="mat-alert" value="50" min="1" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitNewMaterial()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg shadow">${isUr ? "سٹور میں شامل کریں" : "Save Item"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitNewMaterial() {
  const newMat = {
    id: db.rawMaterials.length + 1,
    code: document.getElementById("mat-code").value,
    name: document.getElementById("mat-name").value,
    name_ur: document.getElementById("mat-name").value,
    category: document.getElementById("mat-category").value,
    category_ur: document.getElementById("mat-category").value,
    unit: document.getElementById("mat-unit").value,
    unit_ur: document.getElementById("mat-unit").value,
    current_stock: parseFloat(document.getElementById("mat-stock").value || 0),
    min_alert_level: parseFloat(document.getElementById("mat-alert").value || 50),
    unit_price: 0,
    location: "Shelf-New",
    is_low_stock: false
  };

  if (!newMat.code || !newMat.name) {
    alert(currentLang === "ur" ? "برائے مہربانی کوڈ اور نام درج کریں!" : "Please enter both Code and Name!");
    return;
  }

  db.rawMaterials.push(newMat);
  saveLocalDB();
  closeModal();
  await loadRawMaterials();
  alert(currentLang === "ur" ? "نیا مٹیریل کامیابی سے سٹور میں شامل ہو گیا!" : "New material added to store successfully!");
}

// ----------------- 5. SAMPLING & RECIPES -----------------

async function loadSamplingRecipes() {
  const recipes = db.recipes;
  const container = document.getElementById("recipes-container");
  if (!container) return;

  if (recipes.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-xl border text-center text-slate-400">${currentLang === "ur" ? "کوئی سیمپلنگ ریسیپی نہیں ہے" : "No sampling recipes found"}</div>`;
    return;
  }

  container.innerHTML = recipes.map(r => `
    <div class="stat-tile space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 font-mono">${r.version}</span>
            <h3 class="font-bold text-base text-slate-800">${currentLang === "ur" ? (r.article_name_ur || r.article_name) : r.article_name}</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">${currentLang === "ur" ? (r.notes_ur || r.notes) : r.notes}</p>
        </div>
        <button onclick="useRecipeForBOM(${r.article_id})" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition flex items-center gap-1">
          <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i>
          ${currentLang === "ur" ? "اس ریسیپی کا BOM بنائیں" : "Generate BOM for this Recipe"}
        </button>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          ${currentLang === "ur" ? "فی 1 پیس بنانے کیلئے درکار پرزہ جات و میٹریل:" : "Components & Packaging Required per Unit:"}
        </h4>
        <div class="overflow-x-auto rounded-lg border border-slate-100">
          <table class="w-full text-xs text-left text-slate-600">
            <thead class="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th class="py-2 px-3">${currentLang === "ur" ? "کمپوننٹ / میٹریل" : "Component / Material"}</th>
                <th class="py-2 px-3">${currentLang === "ur" ? "قسم" : "Type"}</th>
                <th class="py-2 px-3">${currentLang === "ur" ? "فی 1 یونٹ ضرورت" : "Qty / Unit"}</th>
                <th class="py-2 px-3">${currentLang === "ur" ? "یونٹ" : "Unit"}</th>
                <th class="py-2 px-3">${currentLang === "ur" ? "تفصیل" : "Notes"}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${r.items.map(it => `
                <tr>
                  <td class="py-2 px-3 font-semibold text-slate-800">${currentLang === "ur" ? (it.material_name_ur || it.material_name) : it.material_name}</td>
                  <td class="py-2 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${currentLang === "ur" ? (it.component_type_ur || it.component_type) : it.component_type}</span>
                  </td>
                  <td class="py-2 px-3 font-bold text-slate-800">${it.qty_per_unit}</td>
                  <td class="py-2 px-3 text-slate-500">${currentLang === "ur" ? (it.unit_ur || it.unit) : it.unit}</td>
                  <td class="py-2 px-3 text-slate-500">${it.notes || '-'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function useRecipeForBOM(articleId) {
  navigate("bom");
  const sel = document.getElementById("bom-article-select");
  if (sel) {
    sel.value = articleId;
    calculateBOM();
  }
}

// ----------------- 6. BILL OF MATERIALS (BOM) -----------------

async function loadBOMModule() {
  await loadArticles();
  const select = document.getElementById("bom-article-select");
  if (select) {
    select.innerHTML = articlesCache.map(a => `<option value="${a.id}">${currentLang === "ur" ? (a.name_ur || a.name) : a.name} (${a.article_code})</option>`).join("");
  }
  loadSavedBOMs();
}

async function calculateBOM() {
  const articleId = parseInt(document.getElementById("bom-article-select").value);
  const quantity = parseFloat(document.getElementById("bom-quantity-input").value || 200);

  const data = calculateLocalBOM(articleId, quantity);
  currentBOMData = data;

  const isUr = currentLang === "ur";
  document.getElementById("bom-calculation-result").classList.remove("hidden");
  document.getElementById("bom-res-title").innerText = isUr ? `BOM برائے: ${data.article_name_ur || data.article_name}` : `BOM For: ${data.article_name}`;
  document.getElementById("bom-res-subtitle").innerText = isUr ? `مطلوبہ پروڈکشن ہدف: ${data.planned_quantity} پیس | ریسیپی: ${data.recipe_name_ur || data.recipe_name}` : `Target Quantity: ${data.planned_quantity} Pcs | Recipe: ${data.recipe_name}`;

  const badge = document.getElementById("bom-stock-status-badge");
  if (data.has_shortage) {
    badge.className = "text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200";
    badge.innerText = isUr ? "انتباہ: را سٹور میں مٹیریل کی کمی ہے!" : "Warning: Material Shortage Detected!";
  } else {
    badge.className = "text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200";
    badge.innerText = isUr ? "تمام درکار پرزہ جات و پیکنگ سٹاک میں موجود ہیں" : "All Components & Packaging Available";
  }

  const tbody = document.getElementById("bom-calc-table-body");
  tbody.innerHTML = data.items.map(it => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-bold text-slate-800">
        ${isUr ? (it.material_name_ur || it.material_name) : it.material_name}
        <span class="block text-[11px] font-mono text-slate-400">${it.material_code}</span>
      </td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${isUr ? (it.component_type_ur || it.component_type) : it.component_type}</span>
      </td>
      <td class="py-2.5 px-3 font-semibold">${it.qty_per_unit} ${isUr ? (it.unit_ur || it.unit) : it.unit}</td>
      <td class="py-2.5 px-3 font-bold text-rose-600 text-sm">${it.required_qty} ${isUr ? (it.unit_ur || it.unit) : it.unit}</td>
      <td class="py-2.5 px-3 font-medium text-slate-700">${it.available_stock} ${isUr ? (it.unit_ur || it.unit) : it.unit}</td>
      <td class="py-2.5 px-3 font-bold ${it.shortage_qty > 0 ? 'text-red-600' : 'text-slate-400'}">
        ${it.shortage_qty > 0 ? it.shortage_qty + ' ' + (isUr ? (it.unit_ur || it.unit) : it.unit) : '-'}
      </td>
      <td class="py-2.5 px-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${it.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
          ${it.status === 'Available' ? (isUr ? 'دستیاب' : 'Available') : (isUr ? 'شارٹیج' : 'Shortage')}
        </span>
      </td>
    </tr>
  `).join("");
}

function calculateLocalBOM(articleId, quantity) {
  const art = db.articles.find(a => a.id === articleId) || db.articles[0];
  const rec = db.recipes.find(r => r.article_id === articleId) || db.recipes[0];

  let hasShortage = false;
  const items = rec.items.map(it => {
    const mat = db.rawMaterials.find(m => m.id === it.material_id);
    const req = it.qty_per_unit * quantity;
    const avail = mat ? mat.current_stock : 0;
    const shortage = Math.max(0, req - avail);
    if (shortage > 0) hasShortage = true;

    return {
      material_id: it.material_id,
      material_code: mat ? mat.code : "RM",
      material_name: it.material_name,
      material_name_ur: it.material_name_ur,
      component_type: it.component_type,
      component_type_ur: it.component_type_ur,
      qty_per_unit: it.qty_per_unit,
      required_qty: req,
      available_stock: avail,
      shortage_qty: shortage,
      unit: it.unit,
      unit_ur: it.unit_ur,
      status: shortage === 0 ? "Available" : "Shortage"
    };
  });

  return {
    article_id: art.id,
    article_name: art.name,
    article_name_ur: art.name_ur,
    recipe_id: rec.id,
    recipe_name: rec.recipe_name,
    recipe_name_ur: rec.recipe_name_ur,
    planned_quantity: quantity,
    has_shortage: hasShortage,
    items: items
  };
}

async function convertBOMToWorkOrder() {
  if (!currentBOMData) {
    alert(currentLang === "ur" ? "پہلے BOM کیلکولیٹ کریں!" : "Please calculate BOM first!");
    return;
  }

  const bomNum = `BOM-${Date.now().toString().slice(-4)}`;
  const woNum = `WO-${Date.now().toString().slice(-4)}`;

  const newBOM = {
    id: db.boms.length + 1,
    bom_number: bomNum,
    article_name: currentBOMData.article_name,
    article_name_ur: currentBOMData.article_name_ur,
    planned_quantity: currentBOMData.planned_quantity,
    status: "ConvertedToWorkOrder",
    status_ur: "ورک آرڈر میں تبدیل",
    created_at: new Date().toISOString().split("T")[0]
  };

  const newWO = {
    id: db.workOrders.length + 1,
    wo_number: woNum,
    article_name: currentBOMData.article_name,
    article_name_ur: currentBOMData.article_name_ur,
    target_quantity: currentBOMData.planned_quantity,
    produced_quantity: 0,
    status: "In Progress",
    status_ur: "پروڈکشن جاری",
    current_step: "Step 1: Stamping & Cutting",
    current_step_ur: "مرحلہ 1: پریسنگ / کٹنگ",
    start_date: new Date().toISOString().split("T")[0],
    steps: [
      { id: Date.now() + 1, step_number: 1, step_name: "Step 1: Stamping & Cutting", step_name_ur: "مرحلہ 1: پریسنگ / کٹنگ", piece_rate: 2.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
      { id: Date.now() + 2, step_number: 2, step_name: "Step 2: Sub-Assembly Fitting", step_name_ur: "مرحلہ 2: چھوٹے پرزوں کی فٹنگ", piece_rate: 4.0, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
      { id: Date.now() + 3, step_number: 3, step_name: "Step 3: Riveting & Welding", step_name_ur: "مرحلہ 3: ریوٹنگ / ویلڈنگ", piece_rate: 3.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
      { id: Date.now() + 4, step_number: 4, step_name: "Step 4: Quality Check & Finishing", step_name_ur: "مرحلہ 4: کوالٹی چیک و پالش", piece_rate: 1.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" },
      { id: Date.now() + 5, step_number: 5, step_name: "Step 5: Final Packing (Bag, Sticker, Logo)", step_name_ur: "مرحلہ 5: فائنل پیکنگ (تھیلی، سٹیکر، لوگو)", piece_rate: 2.0, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", status_ur: "زیر التواء", assigned_worker_name: "Unassigned", assigned_worker_name_ur: "غیر نامزد" }
    ]
  };

  db.boms.unshift(newBOM);
  db.workOrders.unshift(newWO);
  saveLocalDB();

  alert(currentLang === "ur" ? `BOM (${bomNum}) محفوظ ہو گیا اور نیا ورک آرڈر (${woNum}) جاری کر دیا گیا!` : `BOM (${bomNum}) saved and Work Order (${woNum}) created!`);
  navigate("work_orders");
}

async function loadSavedBOMs() {
  const boms = db.boms;
  const tbody = document.getElementById("saved-boms-table");
  if (!tbody) return;

  if (boms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-400">${currentLang === "ur" ? "کوئی محفوظ شدہ BOM نہیں ہے" : "No saved BOMs found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = boms.map(b => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-rose-600">${b.bom_number}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${currentLang === "ur" ? (b.article_name_ur || b.article_name) : b.article_name}</td>
      <td class="py-3 px-4 font-bold">${b.planned_quantity} ${currentLang === "ur" ? "پیس" : "Pcs"}</td>
      <td class="py-3 px-4">${b.created_at}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
          ${currentLang === "ur" ? (b.status_ur || b.status) : b.status}
        </span>
      </td>
    </tr>
  `).join("");
}

// ----------------- 7. WORK ORDERS & MULTI-STEP PRODUCTION -----------------

async function loadWorkOrders() {
  const wos = db.workOrders;
  const container = document.getElementById("work-orders-container");
  if (!container) return;

  if (wos.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-xl border text-center text-slate-400">${currentLang === "ur" ? "کوئی ورک آرڈر موجود نہیں ہے" : "No work orders found"}</div>`;
    return;
  }

  container.innerHTML = wos.map(wo => `
    <div class="stat-tile space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-orange-100 text-orange-800">${wo.wo_number}</span>
            <h3 class="font-bold text-base text-slate-800">${currentLang === "ur" ? (wo.article_name_ur || wo.article_name) : wo.article_name}</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            ${currentLang === "ur" ? `ہدف کوانٹٹی: <span class="font-bold text-slate-700">${wo.target_quantity} پیس</span> | تاریخ شروع: ${wo.start_date}` : `Target: <span class="font-bold text-slate-700">${wo.target_quantity} Pcs</span> | Start Date: ${wo.start_date}`}
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
          ${currentLang === "ur" ? (wo.status_ur || wo.status) : wo.status}
        </span>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          ${currentLang === "ur" ? "پروڈکشن کے مراحل (Production Stages & Piece-Rate ٹھیکہ):" : "Production Stages & Piece-Rate Operations:"}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          ${wo.steps.map(s => {
            const pct = Math.min(100, Math.round((s.completed_pieces / s.required_pieces) * 100));
            const isDone = s.status === 'Completed';
            return `
              <div class="border rounded-xl p-3 ${isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                      ${currentLang === "ur" ? `مرحلہ ${s.step_number}` : `Step ${s.step_number}`}
                    </span>
                    <span class="text-[11px] font-bold ${isDone ? 'text-emerald-700' : 'text-slate-600'}">${pct}%</span>
                  </div>
                  <h5 class="text-xs font-bold text-slate-800 mt-1.5 leading-tight">${currentLang === "ur" ? (s.step_name_ur || s.step_name) : s.step_name}</h5>
                  <p class="text-[11px] text-slate-500 mt-1">${currentLang === "ur" ? "ٹھیکہ ریٹ:" : "Piece Rate:"} <span class="font-semibold text-amber-700">PKR ${s.piece_rate}/${currentLang === "ur" ? "پیس" : "pc"}</span></p>
                  <p class="text-[11px] text-slate-500">${currentLang === "ur" ? "کاریگر:" : "Worker:"} <span class="font-semibold text-slate-700">${currentLang === "ur" ? (s.assigned_worker_name_ur || s.assigned_worker_name) : s.assigned_worker_name}</span></p>
                </div>

                <div class="space-y-2 pt-2 border-t border-slate-200">
                  <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-orange-500 h-1.5 rounded-full" style="width: ${pct}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-500">${s.completed_pieces} / ${s.required_pieces}</span>
                    ${!isDone ? `
                      <button onclick="openStepProgressModal(${wo.id}, ${s.id}, '${s.step_name}', ${s.required_pieces - s.completed_pieces}, ${s.piece_rate})" class="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-[10px] shadow transition">
                        ${currentLang === "ur" ? "پیس درج کریں" : "Log Pieces"}
                      </button>
                    ` : `<span class="text-emerald-700 font-bold text-[10px]">${currentLang === "ur" ? "مکمل ✓" : "Done ✓"}</span>`}
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openStepProgressModal(woId, stepId, stepName, remainingPieces, pieceRate) {
  const isUr = currentLang === "ur";
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${isUr ? (e.full_name_ur || e.full_name) : e.full_name} (${isUr ? (e.department_ur || e.department) : e.department})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-orange-600"></i>
          ${isUr ? "مرحلہ پروڈکشن اور ٹھیکہ ورک اندراج" : "Log Stage Progress & Piece-Rate"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="bg-orange-50 p-3 rounded-lg border border-orange-200 text-xs">
        <p class="font-bold text-orange-900">${stepName}</p>
        <p class="text-orange-700 mt-0.5">${isUr ? "باقی درکار پیس:" : "Remaining Pieces:"} <strong>${remainingPieces}</strong> | ${isUr ? "فی پیس ٹھیکہ ریٹ:" : "Rate per Piece:"} <strong>PKR ${pieceRate}</strong></p>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "کاریگر منتخب کریں:" : "Assigned Worker:"}</label>
          <select id="step-worker" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "آج کتنے پیس مکمل کیے؟" : "Completed Pieces Today:"}</label>
          <input type="number" id="step-completed-add" value="${remainingPieces}" max="${remainingPieces}" min="1" class="w-full border rounded-lg p-2 font-bold text-slate-800 text-sm">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitStepProgress(${woId}, ${stepId}, ${pieceRate})" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "اندراج کریں و ٹھیکہ شامل کریں" : "Save Progress & Credit Pay"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitStepProgress(woId, stepId, pieceRate) {
  const workerId = parseInt(document.getElementById("step-worker").value);
  const workerObj = employeesCache.find(e => e.id === workerId);
  const completedAdd = parseFloat(document.getElementById("step-completed-add").value || 0);

  const wo = db.workOrders.find(w => w.id === woId);
  if (wo) {
    const step = wo.steps.find(s => s.id === stepId);
    if (step) {
      step.completed_pieces += completedAdd;
      step.assigned_worker_name = workerObj ? workerObj.full_name : "Worker";
      step.assigned_worker_name_ur = workerObj ? (workerObj.full_name_ur || workerObj.full_name) : "کاریگر";
      if (step.completed_pieces >= step.required_pieces) {
        step.status = "Completed";
        step.status_ur = "مکمل";
      } else {
        step.status = "In Progress";
        step.status_ur = "جاری";
      }
    }

    const allDone = wo.steps.every(s => s.status === "Completed");
    if (allDone) {
      wo.status = "Completed";
      wo.status_ur = "مکمل";
      wo.produced_quantity = wo.target_quantity;
      db.finishedGoods.unshift({
        id: db.finishedGoods.length + 1,
        batch_number: `BATCH-${wo.wo_number}`,
        article_name: wo.article_name,
        article_name_ur: wo.article_name_ur,
        article_code: "ART-AUTO",
        quantity: wo.produced_quantity,
        packaging_status: "Packed with Polybag, Sticker & Logo",
        packaging_status_ur: "پیک شدہ مع تھیلی، سٹیکر اور لوگو",
        qc_passed: true,
        storage_location: "FG-Store-Main"
      });
    }
  }

  // Credit piece work
  db.pieceWorks.unshift({
    id: db.pieceWorks.length + 1,
    employee_id: workerId,
    employee_name: workerObj ? workerObj.full_name : "Worker",
    employee_name_ur: workerObj ? (workerObj.full_name_ur || workerObj.full_name) : "کاریگر",
    emp_code: workerObj ? workerObj.emp_code : "EMP",
    article_name: wo ? wo.article_name : "Auto Part",
    article_name_ur: wo ? (wo.article_name_ur || wo.article_name) : "آٹو پارٹ",
    step_name: "Production Stage",
    step_name_ur: "پروڈکشن مرحلہ",
    date: new Date().toISOString().split("T")[0],
    pieces_completed: completedAdd,
    rate_per_piece: pieceRate,
    total_earning: completedAdd * pieceRate,
    approved_by: "Supervisor",
    approved_by_ur: "سپروائزر"
  });

  saveLocalDB();
  closeModal();
  await loadWorkOrders();
  await loadFinishedGoods();
  alert(currentLang === "ur" ? "پروڈکشن اپڈیٹ ہو گئی اور کاریگر کے ٹھیکہ ریکارڈ میں اجرت شامل کر دی گئی!" : "Production updated and worker credited successfully!");
}

// ----------------- 8. FINISHED GOODS & PACKING -----------------

async function loadFinishedGoods() {
  const fgs = db.finishedGoods;
  const tbody = document.getElementById("fg-table-body");
  if (!tbody) return;

  if (fgs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">${currentLang === "ur" ? "کوئی فنش گڈز سٹاک نہیں ہے" : "No finished goods found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = fgs.map(f => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-teal-700">${f.batch_number}</td>
      <td class="py-3 px-4 font-bold text-slate-800">${currentLang === "ur" ? (f.article_name_ur || f.article_name) : f.article_name}</td>
      <td class="py-3 px-4 font-mono text-slate-500">${f.article_code}</td>
      <td class="py-3 px-4 font-extrabold text-teal-600 text-sm">${f.quantity} ${currentLang === "ur" ? "پیس" : "Pcs"}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">${currentLang === "ur" ? (f.packaging_status_ur || f.packaging_status) : f.packaging_status}</span>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-xs font-bold ${f.qc_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${currentLang === "ur" ? "QC پاس ✓" : "QC Passed ✓"}</span>
      </td>
      <td class="py-3 px-4 text-slate-500">${f.storage_location}</td>
    </tr>
  `).join("");
}

// ----------------- 9. DISPATCH CHALLAN & GATE PASS -----------------

async function loadDispatchChallans() {
  const challans = db.dispatchChallans;
  const tbody = document.getElementById("dispatch-table-body");
  if (!tbody) return;

  if (challans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">${currentLang === "ur" ? "کوئی ڈسپیچ چالان نہیں ہے" : "No dispatch challans found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = challans.map(c => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-cyan-700">${c.challan_number}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${currentLang === "ur" ? (c.destination_name_ur || c.destination_name) : c.destination_name} (${currentLang === "ur" ? (c.destination_type_ur || c.destination_type) : c.destination_type})</td>
      <td class="py-3 px-4">${c.dispatch_date}</td>
      <td class="py-3 px-4 font-mono font-semibold">${c.vehicle_no}</td>
      <td class="py-3 px-4">${currentLang === "ur" ? (c.driver_name_ur || c.driver_name) : c.driver_name}</td>
      <td class="py-3 px-4 font-mono text-slate-600">${c.gate_pass_no}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="printDispatch(${JSON.stringify(c).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded text-xs font-semibold inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> ${currentLang === "ur" ? "پرنٹ چالان" : "Print Challan"}
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewDispatchModal() {
  const isUr = currentLang === "ur";
  const articleOptions = articlesCache.map(a => `<option value="${a.id}">${isUr ? (a.name_ur || a.name) : a.name} (${a.article_code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="truck" class="w-5 h-5 text-cyan-600"></i>
          ${isUr ? "نیا ڈسپیچ چالان و گیٹ پاس تیار کریں" : "New Dispatch Challan & Gate Pass"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "چالان نمبر:" : "Challan No:"}</label>
          <input type="text" id="disp-num" value="DC-OUT-${Date.now().toString().slice(-5)}" class="w-full border rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "منزل کی قسم:" : "Destination Type:"}</label>
          <select id="disp-dest-type" class="w-full border rounded-lg p-2 bg-white">
            <option value="External Factory">${isUr ? "بیرونی فیکٹری" : "External Factory"}</option>
            <option value="Customer Warehouse">${isUr ? "کسٹمر گودام" : "Customer Warehouse"}</option>
            <option value="Wholesale Distributor">${isUr ? "ہول سیل ڈسٹری بیوٹر" : "Wholesale Distributor"}</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "فیکٹری / گودام کا نام:" : "Factory / Warehouse Name:"}</label>
          <input type="text" id="disp-dest-name" placeholder="e.g. Sunrise Auto Warehouse #3" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "گاڑی نمبر:" : "Vehicle No:"}</label>
          <input type="text" id="disp-veh" placeholder="e.g. LES-4589" class="w-full border rounded-lg p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "ڈرائیور کا نام:" : "Driver Name:"}</label>
          <input type="text" id="disp-driver" placeholder="e.g. Nasir Hussain" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "گیٹ پاس نمبر:" : "Gate Pass No:"}</label>
          <input type="text" id="disp-gp" value="GP-${Date.now().toString().slice(-4)}" class="w-full border rounded-lg p-2 font-mono">
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-2 text-xs">
        <h4 class="font-bold text-slate-700">${isUr ? "روانہ کردہ فنش گڈز:" : "Dispatched Finished Goods:"}</h4>
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "آرٹیکل:" : "Article:"}</label>
            <select id="disp-item-art" class="w-full border rounded p-1.5 bg-white">${articleOptions}</select>
          </div>
          <div class="col-span-4">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">${isUr ? "کوانٹٹی (پیس):" : "Quantity (Pcs):"}</label>
            <input type="number" id="disp-item-qty" value="100" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitNewDispatch()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "چالان جاری کریں اور سٹاک کٹ کریں" : "Generate Challan"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitNewDispatch() {
  const artId = parseInt(document.getElementById("disp-item-art").value);
  const artObj = articlesCache.find(a => a.id === artId);
  const qty = parseFloat(document.getElementById("disp-item-qty").value || 100);

  const newChallan = {
    id: db.dispatchChallans.length + 1,
    challan_number: document.getElementById("disp-num").value,
    destination_type: document.getElementById("disp-dest-type").value,
    destination_name: document.getElementById("disp-dest-name").value,
    destination_name_ur: document.getElementById("disp-dest-name").value,
    vehicle_no: document.getElementById("disp-veh").value,
    driver_name: document.getElementById("disp-driver").value,
    gate_pass_no: document.getElementById("disp-gp").value,
    dispatch_date: new Date().toISOString().split("T")[0],
    items: [{ article_name: artObj ? artObj.name : "Auto Part", quantity: qty }]
  };

  const fg = db.finishedGoods.find(f => f.article_name === (artObj ? artObj.name : ""));
  if (fg) {
    fg.quantity = Math.max(0, fg.quantity - qty);
  }

  db.dispatchChallans.unshift(newChallan);
  saveLocalDB();
  closeModal();
  await loadDispatchChallans();
  await loadFinishedGoods();
  alert(currentLang === "ur" ? "ڈسپیچ چالان کامیابی سے جاری ہو گیا اور فنش گڈز سٹاک اپڈیٹ ہو گیا!" : "Dispatch challan generated and stock deducted successfully!");
}

// ----------------- 10. HR & PAYROLL -----------------

function switchHRTab(tabName) {
  const tabs = ["attendance", "piece_work", "leaves", "employees"];
  tabs.forEach(t => {
    const btn = document.getElementById(`hr-tab-${t}`);
    const content = document.getElementById(`hr-content-${t}`);
    if (btn) btn.className = t === tabName ? "py-2.5 border-b-2 border-pink-600 text-pink-600 font-bold" : "py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold";
    if (content) {
      if (t === tabName) content.classList.remove("hidden");
      else content.classList.add("hidden");
    }
  });

  if (tabName === "attendance") loadAttendance();
  if (tabName === "piece_work") loadPieceWorks();
  if (tabName === "leaves") loadLeaves();
  if (tabName === "employees") loadEmployeesTable();
}

async function loadAttendance() {
  const atts = db.attendances;
  const tbody = document.getElementById("attendance-table-body");
  if (!tbody) return;

  if (atts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">${currentLang === "ur" ? "کوئی حاضری ریکارڈ نہیں ہے" : "No attendance records found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = atts.map(a => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-mono text-slate-700">${a.emp_code}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${currentLang === "ur" ? (a.employee_name_ur || a.employee_name) : a.employee_name}</td>
      <td class="py-2.5 px-3">${currentLang === "ur" ? (a.department_ur || a.department) : a.department}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${a.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
          ${currentLang === "ur" ? (a.status_ur || a.status) : a.status}
        </span>
      </td>
      <td class="py-2.5 px-3 text-slate-600">${a.check_in || '-'}</td>
      <td class="py-2.5 px-3 text-slate-600">${a.check_out || '-'}</td>
      <td class="py-2.5 px-3 font-bold ${a.overtime_hours > 0 ? 'text-pink-600' : 'text-slate-400'}">
        ${a.overtime_hours > 0 ? a.overtime_hours + (currentLang === 'ur' ? ' گھنٹے' : ' hrs') : '-'}
      </td>
      <td class="py-2.5 px-3 text-slate-500">${currentLang === "ur" ? (a.remarks_ur || a.remarks) : a.remarks}</td>
    </tr>
  `).join("");
}

function openMarkAttendanceModal() {
  const isUr = currentLang === "ur";
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${isUr ? (e.full_name_ur || e.full_name) : e.full_name} (${e.emp_code})</option>`).join("");
  const today = new Date().toISOString().split("T")[0];

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="calendar-check" class="w-5 h-5 text-pink-600"></i>
          ${isUr ? "یومیہ حاضری و اوور ٹائم اندراج" : "Log Daily Attendance & Overtime"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">${isUr ? "ملازم منتخب کریں:" : "Select Employee:"}</label>
          <select id="att-emp" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "تاریخ:" : "Date:"}</label>
            <input type="date" id="att-date" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "حاضری سٹیٹس:" : "Status:"}</label>
            <select id="att-status" class="w-full border rounded-lg p-2 bg-white">
              <option value="Present">${isUr ? "حاضر (Present)" : "Present"}</option>
              <option value="Absent">${isUr ? "غیر حاضر (Absent)" : "Absent"}</option>
              <option value="Half-Day">${isUr ? "ہاف ڈے (Half-Day)" : "Half-Day"}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "آمد کا وقت:" : "Check In:"}</label>
            <input type="text" id="att-in" value="08:00 AM" class="w-full border rounded-lg p-2">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "روانگی کا وقت:" : "Check Out:"}</label>
            <input type="text" id="att-out" value="05:00 PM" class="w-full border rounded-lg p-2">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "اوور ٹائم (گھنٹے):" : "Overtime (Hrs):"}</label>
            <input type="number" id="att-ot" value="0" min="0" step="0.5" class="w-full border rounded-lg p-2 font-bold text-pink-600">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitAttendance()" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "حاضری محفوظ کریں" : "Save Attendance"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitAttendance() {
  const empId = parseInt(document.getElementById("att-emp").value);
  const empObj = employeesCache.find(e => e.id === empId);

  const newAtt = {
    id: db.attendances.length + 1,
    employee_id: empId,
    emp_code: empObj ? empObj.emp_code : "EMP",
    employee_name: empObj ? empObj.full_name : "Worker",
    employee_name_ur: empObj ? (empObj.full_name_ur || empObj.full_name) : "کاریگر",
    department: empObj ? empObj.department : "Production",
    department_ur: empObj ? (empObj.department_ur || empObj.department) : "پروڈکشن",
    date: document.getElementById("att-date").value,
    status: document.getElementById("att-status").value,
    status_ur: document.getElementById("att-status").value === "Present" ? "حاضر" : "غیر حاضر",
    check_in: document.getElementById("att-in").value,
    check_out: document.getElementById("att-out").value,
    overtime_hours: parseFloat(document.getElementById("att-ot").value || 0),
    remarks: "Logged via HR Panel",
    remarks_ur: "بذریعہ ایچ آر پینل"
  };

  db.attendances.unshift(newAtt);
  saveLocalDB();
  closeModal();
  loadAttendance();
  loadDashboardStats();
}

async function loadPieceWorks() {
  const pws = db.pieceWorks;
  const tbody = document.getElementById("piecework-table-body");
  if (!tbody) return;

  if (pws.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">${currentLang === "ur" ? "کوئی ٹھیکہ ورک ریکارڈ نہیں ہے" : "No piece-rate records found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = pws.map(p => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3">${p.date}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${currentLang === "ur" ? (p.employee_name_ur || p.employee_name) : p.employee_name}</td>
      <td class="py-2.5 px-3 font-medium text-slate-700">${currentLang === "ur" ? (p.article_name_ur || p.article_name) : p.article_name}</td>
      <td class="py-2.5 px-3">${currentLang === "ur" ? (p.step_name_ur || p.step_name) : p.step_name}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${p.pieces_completed} ${currentLang === "ur" ? "پیس" : "Pcs"}</td>
      <td class="py-2.5 px-3 text-slate-600">PKR ${p.rate_per_piece}</td>
      <td class="py-2.5 px-3 font-extrabold text-amber-700">PKR ${p.total_earning.toLocaleString()}</td>
      <td class="py-2.5 px-3 text-slate-500">${currentLang === "ur" ? (p.approved_by_ur || p.approved_by) : p.approved_by}</td>
    </tr>
  `).join("");
}

function openNewPieceWorkModal() {
  const isUr = currentLang === "ur";
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${isUr ? (e.full_name_ur || e.full_name) : e.full_name} (${isUr ? (e.department_ur || e.department) : e.department})</option>`).join("");
  const articleOptions = articlesCache.map(a => `<option value="${a.name}">${isUr ? (a.name_ur || a.name) : a.name}</option>`).join("");
  const today = new Date().toISOString().split("T")[0];

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="plus-circle" class="w-5 h-5 text-amber-600"></i>
          ${isUr ? "نئی ٹھیکہ انٹری درج کریں" : "Log Piece-Rate Work"}
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "کاریگر:" : "Worker:"}</label>
            <select id="pw-emp" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "تاریخ:" : "Date:"}</label>
            <input type="date" id="pw-date" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "آرٹیکل:" : "Article:"}</label>
            <select id="pw-art" class="w-full border rounded-lg p-2 bg-white">${articleOptions}</select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "کام / مرحلہ:" : "Step / Operation:"}</label>
            <input type="text" id="pw-step" placeholder="e.g. Packaging with Polybag & Sticker" class="w-full border rounded-lg p-2">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "مکمل شدہ پیس:" : "Completed Pieces:"}</label>
            <input type="number" id="pw-pcs" value="100" min="1" class="w-full border rounded-lg p-2 font-bold">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">${isUr ? "فی پیس ریٹ (PKR):" : "Rate per Piece (PKR):"}</label>
            <input type="number" id="pw-rate" value="5" min="0.5" step="0.5" class="w-full border rounded-lg p-2 font-bold text-amber-700">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">${isUr ? "منسوخ کریں" : "Cancel"}</button>
        <button onclick="submitPieceWork()" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow">${isUr ? "اجرت اندراج کریں" : "Save Earning"}</button>
      </div>
    </div>
  `;
  showModal(content);
}

async function submitPieceWork() {
  const empId = parseInt(document.getElementById("pw-emp").value);
  const empObj = employeesCache.find(e => e.id === empId);
  const pcs = parseFloat(document.getElementById("pw-pcs").value || 0);
  const rate = parseFloat(document.getElementById("pw-rate").value || 0);

  const newPW = {
    id: db.pieceWorks.length + 1,
    employee_id: empId,
    employee_name: empObj ? empObj.full_name : "Worker",
    employee_name_ur: empObj ? (empObj.full_name_ur || empObj.full_name) : "کاریگر",
    emp_code: empObj ? empObj.emp_code : "EMP",
    article_name: document.getElementById("pw-art").value,
    article_name_ur: document.getElementById("pw-art").value,
    step_name: document.getElementById("pw-step").value,
    step_name_ur: document.getElementById("pw-step").value,
    date: document.getElementById("pw-date").value,
    pieces_completed: pcs,
    rate_per_piece: rate,
    total_earning: pcs * rate,
    approved_by: "Supervisor",
    approved_by_ur: "سپروائزر"
  };

  db.pieceWorks.unshift(newPW);
  saveLocalDB();
  closeModal();
  loadPieceWorks();
  alert(currentLang === "ur" ? "ٹھیکہ ورک کامیابی سے محفوظ ہو گیا!" : "Piece-rate work saved successfully!");
}

async function loadLeaves() {
  const leaves = db.leaves;
  const tbody = document.getElementById("leaves-table-body");
  if (!tbody) return;

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">${currentLang === "ur" ? "کوئی چھٹی کی درخواست نہیں ہے" : "No leave applications found"}</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves.map(l => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-bold text-slate-800">${currentLang === "ur" ? (l.employee_name_ur || l.employee_name) : l.employee_name}</td>
      <td class="py-2.5 px-3">${currentLang === "ur" ? (l.leave_type_ur || l.leave_type) : l.leave_type}</td>
      <td class="py-2.5 px-3">${l.start_date}</td>
      <td class="py-2.5 px-3">${l.end_date}</td>
      <td class="py-2.5 px-3 font-bold">${l.total_days} ${currentLang === "ur" ? "دن" : "days"}</td>
      <td class="py-2.5 px-3 text-slate-600">${currentLang === "ur" ? (l.reason_ur || l.reason) : l.reason}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${currentLang === "ur" ? (l.status_ur || l.status) : l.status}
        </span>
      </td>
      <td class="py-2.5 px-3 text-right space-x-1 rtl:space-x-reverse">
        ${l.status === 'Pending' ? `
          <button onclick="updateLeaveStatus(${l.id}, 'Approved')" class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-semibold">${currentLang === 'ur' ? 'منظور' : 'Approve'}</button>
        ` : '-'}
      </td>
    </tr>
  `).join("");
}

function updateLeaveStatus(id, status) {
  const lv = db.leaves.find(l => l.id === id);
  if (lv) {
    lv.status = status;
    lv.status_ur = status === "Approved" ? "منظور شدہ" : "مسترد";
    saveLocalDB();
    loadLeaves();
  }
}

async function loadEmployeesTable() {
  const tbody = document.getElementById("employees-table-body");
  if (!tbody) return;

  tbody.innerHTML = employeesCache.map(e => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-mono font-bold text-slate-700">${e.emp_code}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${currentLang === "ur" ? (e.full_name_ur || e.full_name) : e.full_name}</td>
      <td class="py-2.5 px-3">${currentLang === "ur" ? (e.designation_ur || e.designation) : e.designation}</td>
      <td class="py-2.5 px-3 font-medium">${currentLang === "ur" ? (e.department_ur || e.department) : e.department}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${e.employment_type === 'Piece-Rate' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
          ${currentLang === "ur" ? (e.employment_type_ur || e.employment_type) : e.employment_type}
        </span>
      </td>
      <td class="py-2.5 px-3 font-semibold">
        ${e.employment_type === 'Piece-Rate' ? `PKR ${e.piece_rate_default}/${currentLang === "ur" ? "پیس" : "pc"}` : `PKR ${e.base_salary.toLocaleString()}`}
      </td>
      <td class="py-2.5 px-3 text-slate-500 font-mono">${e.phone}</td>
    </tr>
  `).join("");
}

// ----------------- 11. RBAC & USER CONTROLS -----------------

async function loadRolesAndUsers() {
  const roles = db.roles;
  const users = db.users;

  const rolesContainer = document.getElementById("roles-list-container");
  if (rolesContainer) {
    rolesContainer.innerHTML = roles.map(r => `
      <div class="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800">${currentLang === "ur" ? (r.name_ur || r.name) : r.name}</span>
          <span class="text-[11px] font-mono text-indigo-600 font-semibold">${r.permissions === '*' ? (currentLang === 'ur' ? 'تمام ماڈیولز (Full Access)' : 'Full Access (*)') : r.permissions}</span>
        </div>
        <p class="text-slate-500 text-[11px] mt-1">${currentLang === "ur" ? (r.description_ur || r.description) : r.description}</p>
      </div>
    `).join("");
  }

  const usersTbody = document.getElementById("users-table-body");
  if (usersTbody) {
    usersTbody.innerHTML = users.map(u => `
      <tr class="hover:bg-slate-50">
        <td class="py-2 px-3 font-mono font-semibold text-slate-700">${u.username}</td>
        <td class="py-2 px-3 font-medium text-slate-800">${currentLang === "ur" ? (u.full_name_ur || u.full_name) : u.full_name}</td>
        <td class="py-2 px-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">${currentLang === "ur" ? (u.role_ur || u.role) : u.role}</span>
        </td>
      </tr>
    `).join("");
  }
}

// ----------------- HELPERS & CACHE LOADERS -----------------

async function loadArticles() {
  articlesCache = db.articles;
}

async function loadSuppliers() {
  suppliersCache = db.suppliers;
}

async function loadEmployees() {
  employeesCache = db.employees;
}

// ----------------- PRINT FORMATTERS -----------------

function printGRN(grn) {
  const printDiv = document.getElementById("print-area");
  printDiv.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px;">MUFTI AUTO STORE</h1>
        <p style="margin: 3px 0; font-size: 13px;">Auto Parts Manufacturing & Production Division</p>
        <h2 style="margin: 5px 0 0 0; font-size: 18px; text-decoration: underline;">GOODS RECEIVED NOTE (GRN)</h2>
      </div>

      <table style="width: 100%; font-size: 12px; margin-bottom: 15px;">
        <tr>
          <td><strong>GRN No:</strong> ${grn.grn_number}</td>
          <td><strong>Date:</strong> ${grn.receiving_date}</td>
        </tr>
        <tr>
          <td><strong>Supplier:</strong> ${grn.supplier_name}</td>
          <td><strong>Supplier DC No:</strong> ${grn.delivery_challan_no}</td>
        </tr>
        <tr>
          <td><strong>Received By:</strong> ${grn.received_by}</td>
          <td><strong>PO Reference:</strong> ${grn.po_number || 'N/A'}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;" border="1" cellpadding="6">
        <thead style="background: #eee;">
          <tr>
            <th>Item / Material Description</th>
            <th>Received Qty</th>
            <th>Accepted Qty</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          ${grn.items.map(it => `
            <tr>
              <td>${it.material_name}</td>
              <td style="text-align: center;">${it.received_qty}</td>
              <td style="text-align: center; font-weight: bold;">${it.accepted_qty}</td>
              <td style="text-align: center;">${it.unit}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
        <div>____________________<br>Store Keeper Signature</div>
        <div>____________________<br>QC Inspector Signature</div>
        <div>____________________<br>Authorized Signature</div>
      </div>
    </div>
  `;
  window.print();
}

function printDispatch(challan) {
  const printDiv = document.getElementById("print-area");
  printDiv.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px;">MUFTI AUTO STORE</h1>
        <p style="margin: 3px 0; font-size: 13px;">Auto Parts Manufacturing & Outward Logistics</p>
        <h2 style="margin: 5px 0 0 0; font-size: 18px; text-decoration: underline;">DELIVERY CHALLAN & GATE PASS</h2>
      </div>

      <table style="width: 100%; font-size: 12px; margin-bottom: 15px;">
        <tr>
          <td><strong>Challan No:</strong> ${challan.challan_number}</td>
          <td><strong>Dispatch Date:</strong> ${challan.dispatch_date}</td>
        </tr>
        <tr>
          <td><strong>Destination:</strong> ${challan.destination_name} (${challan.destination_type})</td>
          <td><strong>Gate Pass No:</strong> ${challan.gate_pass_no}</td>
        </tr>
        <tr>
          <td><strong>Vehicle No:</strong> ${challan.vehicle_no}</td>
          <td><strong>Driver Name:</strong> ${challan.driver_name}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;" border="1" cellpadding="6">
        <thead style="background: #eee;">
          <tr>
            <th>Finished Auto Part Description</th>
            <th>Quantity Dispatched</th>
            <th>Packaging Verification</th>
          </tr>
        </thead>
        <tbody>
          ${challan.items.map(it => `
            <tr>
              <td><strong>${it.article_name}</strong></td>
              <td style="text-align: center; font-weight: bold; font-size: 14px;">${it.quantity} Pieces</td>
              <td style="text-align: center;">Packed with Polybag, Sticker & Logo ✓</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
        <div>____________________<br>Dispatch Officer</div>
        <div>____________________<br>Driver Signature</div>
        <div>____________________<br>Security Gate Officer</div>
      </div>
    </div>
  `;
  window.print();
}

function printPO(po) {
  const printDiv = document.getElementById("print-area");
  printDiv.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px;">MUFTI AUTO STORE</h1>
        <p style="margin: 3px 0; font-size: 13px;">Auto Parts Procurement & Stores</p>
        <h2 style="margin: 5px 0 0 0; font-size: 18px; text-decoration: underline;">PURCHASE ORDER (PO)</h2>
      </div>

      <table style="width: 100%; font-size: 12px; margin-bottom: 15px;">
        <tr>
          <td><strong>PO No:</strong> ${po.po_number}</td>
          <td><strong>Date:</strong> ${po.order_date}</td>
        </tr>
        <tr>
          <td><strong>Supplier:</strong> ${po.supplier_name}</td>
          <td><strong>Status:</strong> ${po.status}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;" border="1" cellpadding="6">
        <thead style="background: #eee;">
          <tr>
            <th>Item / Material Description</th>
            <th>Quantity</th>
            <th>Unit Price (PKR)</th>
            <th>Total Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map(it => `
            <tr>
              <td>${it.material_name} (${it.material_code})</td>
              <td style="text-align: center;">${it.quantity}</td>
              <td style="text-align: right;">${it.unit_price}</td>
              <td style="text-align: right; font-weight: bold;">${(it.quantity * it.unit_price).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 14px; font-weight: bold; margin-bottom: 30px;">
        Grand Total: PKR ${po.total_amount.toLocaleString()}
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
        <div>____________________<br>Prepared By</div>
        <div>____________________<br>Approved By</div>
      </div>
    </div>
  `;
  window.print();
}

// ----------------- MODAL CONTROLLERS -----------------

function showModal(content) {
  const backdrop = document.getElementById("modal-backdrop");
  const modal = document.getElementById("modal-content");
  modal.innerHTML = content;
  backdrop.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  backdrop.classList.add("hidden");
}
