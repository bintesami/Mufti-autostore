// Mufti Auto Store Production ERP - Hybrid Client (Works locally & on GitHub Pages)

const API_BASE = "";
let isLocalBackend = false;

// In-Memory / LocalStorage Database for standalone GitHub Pages hosting
const INITIAL_STORE = {
  roles: [
    { id: 1, name: "Admin", description: "مکمل سسٹم کنٹرول (Full System Access)", permissions: "*" },
    { id: 2, name: "Storekeeper", description: "را سٹور، پرچیز اور جی آر این کنٹرول", permissions: "dashboard,po,grn,raw_store" },
    { id: 3, name: "Production", description: "سیمپلنگ، بل آف مٹیریل (BOM) اور ورک آرڈر کنٹرول", permissions: "dashboard,sampling,bom,work_orders,fg" },
    { id: 4, name: "HR", description: "ملازمین، حاضری، اوور ٹائم، پر پیس ٹھیکہ اور چھٹیاں", permissions: "dashboard,hr" },
    { id: 5, name: "Dispatch", description: "فنش گڈز پیکنگ اور فیکٹری/گودام ڈسپیچ چالان", permissions: "dashboard,fg,dispatch" }
  ],
  users: [
    { id: 1, username: "admin", full_name: "سسٹم ایڈمنسٹریٹر", role: "Admin", is_active: true },
    { id: 2, username: "store_mgr", full_name: "اصغر علی (سٹور انچارج)", role: "Storekeeper", is_active: true },
    { id: 3, username: "prod_mgr", full_name: "محمد راشد (پروڈکشن سپروائزر)", role: "Production", is_active: true },
    { id: 4, username: "hr_mgr", full_name: "شہزیب خان (ایچ آر آفیسر)", role: "HR", is_active: true },
    { id: 5, username: "dispatch_mgr", full_name: "طاہر محمود (ڈسپیچ آفیسر)", role: "Dispatch", is_active: true }
  ],
  suppliers: [
    { id: 1, name: "Pak Auto Casting Industries (Pvt) Ltd", contact_person: "حاجی فاروق", phone: "0300-1122334", address: "بادامی باغ آٹو مارکیٹ، لاہور" },
    { id: 2, name: "National Friction Material Co.", contact_person: "سلمان شیخ", phone: "0321-4455667", address: "سائٹ ایریا، کراچی" },
    { id: 3, name: "Standard Springs & Fasteners", contact_person: "عرفان صاحب", phone: "0333-7788990", address: "گوجرانوالہ انڈسٹریل زون" },
    { id: 4, name: "Universal Poly Packaging & Bags", contact_person: "کامران اکرم", phone: "0345-6677889", address: "اردو بازار، لاہور" },
    { id: 5, name: "Creative Printing & Hologram Labels", contact_person: "وقاص بٹ", phone: "0302-9988776", address: "شاہ عالم مارکیٹ، لاہور" }
  ],
  rawMaterials: [
    { id: 1, code: "RM-ALU-01", name: "Aluminum Alloy Ingot (ADC12)", category: "Raw Metal", unit: "KG", current_stock: 650.0, min_alert_level: 100.0, unit_price: 750.0, location: "Rack-A1", is_low_stock: false },
    { id: 2, code: "CP-BSC-02", name: "Brake Shoe Core Castings (چائلڈ پارٹ - کور کاسٹنگ)", category: "Child Part", unit: "Pieces", current_stock: 1500.0, min_alert_level: 300.0, unit_price: 95.0, location: "Bin-B1", is_low_stock: false },
    { id: 3, code: "CP-BLS-03", name: "Friction Brake Lining Strips (چائلڈ پارٹ - لائننگ پیڈ)", category: "Child Part", unit: "Pieces", current_stock: 1800.0, min_alert_level: 400.0, unit_price: 45.0, location: "Bin-B2", is_low_stock: false },
    { id: 4, code: "FST-TRS-04", name: "Heavy Duty Tension Return Springs (سپرنگ)", category: "Fastener", unit: "Pieces", current_stock: 2200.0, min_alert_level: 500.0, unit_price: 12.0, location: "Bin-C1", is_low_stock: false },
    { id: 5, code: "FST-RIV-05", name: "Solid Steel Rivets 4x10mm (ریوٹ)", category: "Fastener", unit: "Pieces", current_stock: 10000.0, min_alert_level: 2000.0, unit_price: 2.5, location: "Bin-C2", is_low_stock: false },
    { id: 6, code: "PKG-BAG-06", name: "Branded Heavy Polybag 6x9 (تھیلی - Mufti Auto Store)", category: "Packaging Bag", unit: "Pieces", current_stock: 3500.0, min_alert_level: 500.0, unit_price: 4.0, location: "Shelf-P1", is_low_stock: false },
    { id: 7, code: "STK-BAR-07", name: "Barcode & Part Spec Sticker (سٹیکر)", category: "Sticker", unit: "Pieces", current_stock: 4000.0, min_alert_level: 600.0, unit_price: 1.5, location: "Shelf-P2", is_low_stock: false },
    { id: 8, code: "LGO-HLG-08", name: "Mufti Auto Store Hologram Verification Logo (لوگو)", category: "Logo/Branding", unit: "Pieces", current_stock: 3000.0, min_alert_level: 500.0, unit_price: 3.0, location: "Shelf-P3", is_low_stock: false },
    { id: 9, code: "PKG-BOX-09", name: "Master Outer Carton Box (50 Pcs Capacity)", category: "Packaging Bag", unit: "Pieces", current_stock: 250.0, min_alert_level: 50.0, unit_price: 65.0, location: "Zone-D", is_low_stock: false }
  ],
  articles: [
    { id: 1, article_code: "ART-BS-70", name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", category: "Brakes", vehicle_model: "Honda CD70 / CG125", unit: "Piece", description: "مکمل بریک شو مع کور، لائننگ، سپرنگ، ریوٹ، برانڈڈ تھیلی، سٹیکر اور لوگو" },
    { id: 2, article_code: "ART-CP-01", name: "Heavy Duty Clutch Plate Assembly (Universal Auto)", category: "Transmission", vehicle_model: "Universal Rickshaw / Loader", unit: "Piece", description: "ہائی پرفارمنس کلچ پلیٹ مع کسٹم لوگو پیکنگ" },
    { id: 3, article_code: "ART-SM-02", name: "Side Mirror Assembly with Base & Indicator", category: "Body Parts", vehicle_model: "Suzuki Alto / Mehran", unit: "Piece", description: "مکمل سائیڈ مرر مع گلاس، بیس اور برانڈڈ پیکنگ" }
  ],
  recipes: [
    {
      id: 1,
      article_id: 1,
      article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)",
      recipe_name: "Brake Shoe CD70 Master Production Recipe (مع تھیلی، سٹیکر، لوگو)",
      version: "v2.1",
      notes: "ماسٹر سیمپلنگ: فی 1 پیس میں 2 کور، 2 لائننگ، 2 سپرنگ، 8 ریوٹ، 1 تھیلی، 1 سٹیکر، 1 لوگو",
      items: [
        { material_id: 2, material_name: "Brake Shoe Core Castings (چائلڈ پارٹ - کور کاسٹنگ)", component_type: "Child Part", qty_per_unit: 2.0, unit: "Pieces", notes: "مین کاسٹنگ کور" },
        { material_id: 3, material_name: "Friction Brake Lining Strips (چائلڈ پارٹ - لائننگ پیڈ)", component_type: "Child Part", qty_per_unit: 2.0, unit: "Pieces", notes: "فرکشن لیدرز" },
        { material_id: 4, material_name: "Heavy Duty Tension Return Springs (سپرنگ)", component_type: "Fastener", qty_per_unit: 2.0, unit: "Pieces", notes: "ریٹرن سپرنگ" },
        { material_id: 5, material_name: "Solid Steel Rivets 4x10mm (ریوٹ)", component_type: "Fastener", qty_per_unit: 8.0, unit: "Pieces", notes: "فٹنگ ریوٹس" },
        { material_id: 6, material_name: "Branded Heavy Polybag 6x9 (تھیلی - Mufti Auto Store)", component_type: "Packaging Bag", qty_per_unit: 1.0, unit: "Pieces", notes: "برانڈڈ تھیلی مع پرنٹ" },
        { material_id: 7, material_name: "Barcode & Part Spec Sticker (سٹیکر)", component_type: "Sticker", qty_per_unit: 1.0, unit: "Pieces", notes: "بارکوڈ و پارٹ نمبر سٹیکر" },
        { material_id: 8, material_name: "Mufti Auto Store Hologram Verification Logo (لوگو)", component_type: "Logo/Branding", qty_per_unit: 1.0, unit: "Pieces", notes: "مفتی آٹو سٹور اوریجنل ہولوگرام" }
      ]
    }
  ],
  boms: [
    { id: 1, bom_number: "BOM-1001", article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", planned_quantity: 200, status: "ConvertedToWorkOrder", created_at: "2026-09-19" }
  ],
  workOrders: [
    {
      id: 1,
      wo_number: "WO-9842",
      article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)",
      target_quantity: 200,
      produced_quantity: 0,
      status: "In Progress",
      current_step: "Step 1: Stamping & Cutting",
      start_date: "2026-09-19",
      steps: [
        { id: 101, step_number: 1, step_name: "Step 1: Stamping & Cutting (پریسنگ / کٹنگ)", piece_rate: 2.5, required_pieces: 200, completed_pieces: 200, status: "Completed", assigned_worker_name: "محمد افضل" },
        { id: 102, step_number: 2, step_name: "Step 2: Sub-Assembly (چھوٹے پرزوں کی فٹنگ)", piece_rate: 4.0, required_pieces: 200, completed_pieces: 150, status: "In Progress", assigned_worker_name: "طارق محمود" },
        { id: 103, step_number: 3, step_name: "Step 3: Riveting & Welding (ریوٹنگ / ویلڈنگ)", piece_rate: 3.5, required_pieces: 200, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
        { id: 104, step_number: 4, step_name: "Step 4: Quality Check (کوالٹی چیک و پالش)", piece_rate: 1.5, required_pieces: 200, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
        { id: 105, step_number: 5, step_name: "Step 5: Final Packing (تھیلی، سٹیکر اور لوگو پیکنگ)", piece_rate: 2.0, required_pieces: 200, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" }
      ]
    }
  ],
  finishedGoods: [
    { id: 1, batch_number: "BATCH-BS70-0919", article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", article_code: "ART-BS-70", quantity: 350, packaging_status: "Packed with Theli, Sticker & Logo", qc_passed: true, storage_location: "FG-Store-Rack-1" }
  ],
  dispatchChallans: [
    { id: 1, challan_number: "DC-OUT-501", destination_type: "External Factory", destination_name: "سن رائز آٹو انڈسٹریز گودام #3", dispatch_date: "2026-09-19", vehicle_no: "LES-4589", driver_name: "ناصر حسین", gate_pass_no: "GP-102", status: "Dispatched", items: [{ article_name: "Motorcycle Brake Shoe Assembly (CD70 / CG125)", quantity: 150 }] }
  ],
  purchaseOrders: [
    { id: 1, po_number: "PO-401", supplier_name: "Pak Auto Casting Industries (Pvt) Ltd", order_date: "2026-09-19", total_amount: 142500, status: "Completed", items: [{ material_name: "Brake Shoe Core Castings", material_code: "CP-BSC-02", quantity: 1500, unit_price: 95, received_quantity: 1500 }] }
  ],
  grns: [
    { id: 1, grn_number: "GRN-801", supplier_name: "Pak Auto Casting Industries (Pvt) Ltd", po_number: "PO-401", delivery_challan_no: "DC-9842", receiving_date: "2026-09-19", received_by: "اصغر علی (سٹور کیپر)", remarks: "مال اوکے ہے", items: [{ material_name: "Brake Shoe Core Castings", received_qty: 1500, accepted_qty: 1500, unit: "Pieces" }] }
  ],
  employees: [
    { id: 1, emp_code: "EMP-101", full_name: "محمد افضل", designation: "پریس آپریٹر (ٹھیکہ ورکر)", department: "Production", phone: "0301-1234567", employment_type: "Piece-Rate", base_salary: 0, piece_rate_default: 4.5 },
    { id: 2, emp_code: "EMP-102", full_name: "طارق محمود", designation: "اسمبلی کاریگر (ٹھیکہ ورکر)", department: "Production", phone: "0322-2345678", employment_type: "Piece-Rate", base_salary: 0, piece_rate_default: 6.0 },
    { id: 3, emp_code: "EMP-103", full_name: "بلال احمد", designation: "پیکنگ و سٹیکرنگ (ٹھیکہ ورکر)", department: "Packaging", phone: "0334-3456789", employment_type: "Piece-Rate", base_salary: 0, piece_rate_default: 2.5 },
    { id: 4, emp_code: "EMP-104", full_name: "اصغر علی", designation: "ہیڈ سٹور کیپر", department: "Raw Store", phone: "0345-4567890", employment_type: "Salaried", base_salary: 45000, piece_rate_default: 0 },
    { id: 5, emp_code: "EMP-105", full_name: "کامران نواز", designation: "کوالٹی کنٹرول انسپکٹر", department: "QC", phone: "0312-5678901", employment_type: "Salaried", base_salary: 50000, piece_rate_default: 0 }
  ],
  attendances: [
    { id: 1, employee_id: 1, emp_code: "EMP-101", employee_name: "محمد افضل", department: "Production", date: "2026-09-19", status: "Present", check_in: "08:00 AM", check_out: "06:00 PM", overtime_hours: 2.0, remarks: "اوور ٹائم پریسنگ" },
    { id: 2, employee_id: 2, emp_code: "EMP-102", employee_name: "طارق محمود", department: "Production", date: "2026-09-19", status: "Present", check_in: "08:15 AM", check_out: "05:00 PM", overtime_hours: 0, remarks: "آن ٹائم" },
    { id: 3, employee_id: 3, emp_code: "EMP-103", employee_name: "بلال احمد", department: "Packaging", date: "2026-09-19", status: "Present", check_in: "08:00 AM", check_out: "07:00 PM", overtime_hours: 3.0, remarks: "پیکنگ اوور ٹائم" }
  ],
  pieceWorks: [
    { id: 1, employee_id: 1, employee_name: "محمد افضل", emp_code: "EMP-101", article_name: "Motorcycle Brake Shoe Assembly", step_name: "Step 1: Stamping & Cutting", date: "2026-09-19", pieces_completed: 200, rate_per_piece: 2.5, total_earning: 500, approved_by: "Supervisor" },
    { id: 2, employee_id: 2, employee_name: "طارق محمود", emp_code: "EMP-102", article_name: "Motorcycle Brake Shoe Assembly", step_name: "Step 2: Sub-Assembly", date: "2026-09-19", pieces_completed: 150, rate_per_piece: 4.0, total_earning: 600, approved_by: "Supervisor" }
  ],
  leaves: [
    { id: 1, employee_name: "محمد افضل", leave_type: "Casual (اتفاقی)", start_date: "2026-09-22", end_date: "2026-09-22", total_days: 1, reason: "ضروری گھریلو کام", status: "Approved" }
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

  await initialLoad();
  applyRolePermissions(currentRole);
});

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
    alert("آپ کے مقررہ رول کو اس ماڈیول تک رسائی کی اجازت نہیں ہے۔");
    return;
  }

  currentView = viewName;
  document.querySelectorAll("main > section").forEach(v => v.classList.add("hidden"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("bg-slate-900", "text-white", "shadow-sm");
    btn.classList.add("text-slate-700");
  });

  const activeBtn = document.getElementById(`nav-${viewName}`);
  if (activeBtn) {
    activeBtn.classList.remove("text-slate-700");
    activeBtn.classList.add("bg-slate-900", "text-white", "shadow-sm");
  }

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
  let stats;
  if (isLocalBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats`);
      stats = await res.json();
    } catch (e) {
      stats = getLocalStats();
    }
  } else {
    stats = getLocalStats();
  }

  document.getElementById("stat-raw-items").innerText = stats.raw_materials_count;
  document.getElementById("stat-low-stock").innerText = stats.low_stock_count;
  document.getElementById("stat-active-wo").innerText = stats.active_work_orders;
  document.getElementById("stat-fg-qty").innerText = stats.finished_goods_qty;
  document.getElementById("stat-attendance").innerText = `${stats.today_present_count} / ${stats.total_employees}`;

  // Work orders table in dashboard
  const wos = isLocalBackend ? await (await fetch(`${API_BASE}/api/work-orders`)).json() : db.workOrders;
  const woTbody = document.getElementById("dash-wo-table");
  if (wos.length === 0) {
    woTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">کوئی ایکٹو ورک آرڈر نہیں ملا</td></tr>`;
  } else {
    woTbody.innerHTML = wos.slice(0, 5).map(w => `
      <tr class="hover:bg-slate-50">
        <td class="py-2.5 px-3 font-semibold text-slate-800">${w.wo_number}</td>
        <td class="py-2.5 px-3">${w.article_name}</td>
        <td class="py-2.5 px-3 font-medium">${w.produced_quantity} / ${w.target_quantity}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${w.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
            ${w.status}
          </span>
        </td>
      </tr>
    `).join("");
  }

  // Stock table
  const mats = isLocalBackend ? await (await fetch(`${API_BASE}/api/raw-materials`)).json() : db.rawMaterials;
  const lowMats = mats.filter(m => m.current_stock <= m.min_alert_level);
  const stockTbody = document.getElementById("dash-stock-table");
  if (lowMats.length === 0) {
    stockTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-emerald-600 font-medium">تمام مٹیریل مناسب مقدار میں موجود ہیں!</td></tr>`;
  } else {
    stockTbody.innerHTML = lowMats.map(m => `
      <tr class="hover:bg-amber-50/50">
        <td class="py-2.5 px-3 font-mono text-slate-700">${m.code}</td>
        <td class="py-2.5 px-3 font-medium text-slate-800">${m.name}</td>
        <td class="py-2.5 px-3 text-red-600 font-bold">${m.current_stock} ${m.unit}</td>
        <td class="py-2.5 px-3 text-slate-500">${m.min_alert_level} ${m.unit}</td>
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
  const pos = isLocalBackend ? await (await fetch(`${API_BASE}/api/purchase-orders`)).json() : db.purchaseOrders;
  const tbody = document.getElementById("po-table-body");
  if (pos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">کوئی پرچیز آرڈر موجود نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = pos.map(po => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-blue-600">${po.po_number}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${po.supplier_name}</td>
      <td class="py-3 px-4">${po.order_date}</td>
      <td class="py-3 px-4 font-semibold">PKR ${po.total_amount.toLocaleString()}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${po.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${po.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="printPO(${JSON.stringify(po).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> پرنٹ
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewPOModal() {
  const supplierOptions = suppliersCache.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${m.name} (${m.code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="shopping-cart" class="w-5 h-5 text-blue-600"></i>
          نیا پرچیز آرڈر بنائیں (New Purchase Order)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">PO نمبر:</label>
          <input type="text" id="po-num" value="PO-${Date.now().toString().slice(-5)}" class="w-full border border-slate-300 rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">سپلائر منتخب کریں:</label>
          <select id="po-supplier" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
            ${supplierOptions}
          </select>
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-3">
        <h4 class="text-xs font-bold text-slate-700">آرڈر آئٹمز:</h4>
        <div class="grid grid-cols-12 gap-2 text-xs">
          <div class="col-span-6">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">را مٹیریل / چائلڈ پارٹ:</label>
            <select id="po-item-mat" class="w-full border rounded p-1.5 bg-white">${materialOptions}</select>
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">کوانٹٹی:</label>
            <input type="number" id="po-item-qty" value="500" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">ریٹ فی یونٹ (PKR):</label>
            <input type="number" id="po-item-price" value="50" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewPO()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">آرڈر محفوظ کریں</button>
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
    order_date: new Date().toISOString().split("T")[0],
    total_amount: qty * price,
    status: "Pending",
    items: [{
      material_name: matObj ? matObj.name : "Material",
      material_code: matObj ? matObj.code : "CODE",
      quantity: qty,
      unit_price: price,
      received_quantity: 0
    }]
  };

  if (isLocalBackend) {
    try {
      await fetch(`${API_BASE}/api/purchase-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ po_number: poNum, supplier_id: supplierId, items: [{ material_id: matId, quantity: qty, unit_price: price }] })
      });
    } catch (e) {}
  }

  db.purchaseOrders.unshift(newPO);
  saveLocalDB();
  closeModal();
  loadPurchaseOrders();
  alert("پرچیز آرڈر کامیابی سے جاری ہو گیا!");
}

// ----------------- 3. GRN & RECEIVING -----------------

async function loadGRNs() {
  const grns = isLocalBackend ? await (await fetch(`${API_BASE}/api/grns`)).json() : db.grns;
  const tbody = document.getElementById("grn-table-body");
  if (grns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">کوئی GRN ریکارڈ نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = grns.map(g => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-emerald-600">${g.grn_number}</td>
      <td class="py-3 px-4 font-mono text-slate-700">${g.delivery_challan_no}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${g.supplier_name}</td>
      <td class="py-3 px-4">${g.receiving_date}</td>
      <td class="py-3 px-4 font-medium text-slate-700">${g.received_by}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="printGRN(${JSON.stringify(g).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> پرنٹ واؤچر
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewGRNModal() {
  const supplierOptions = suppliersCache.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${m.name} (${m.code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="package-check" class="w-5 h-5 text-emerald-600"></i>
          نئی GRN ریسیونگ و چالان اندراج (New GRN)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">GRN نمبر:</label>
          <input type="text" id="grn-num" value="GRN-${Date.now().toString().slice(-5)}" class="w-full border border-slate-300 rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">سپلائر ڈیلیوری چالان نمبر:</label>
          <input type="text" id="grn-dc-num" placeholder="e.g. DC-9842" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">سپلائر:</label>
          <select id="grn-supplier" class="w-full border border-slate-300 rounded-lg p-2 bg-white">${supplierOptions}</select>
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-3">
        <h4 class="text-xs font-bold text-slate-700">وصول شدہ را مٹیریل تفصیل:</h4>
        <div class="grid grid-cols-12 gap-2 text-xs">
          <div class="col-span-5">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">آئٹم منتخب کریں:</label>
            <select id="grn-item-mat" class="w-full border rounded p-1.5 bg-white">${materialOptions}</select>
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">وصول شدہ مقدار:</label>
            <input type="number" id="grn-item-qty" value="200" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">مسترد (Rejected):</label>
            <input type="number" id="grn-item-rej" value="0" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">ریٹ فی یونٹ:</label>
            <input type="number" id="grn-item-price" value="0" min="0" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">وصول کنندہ (Received By):</label>
          <input type="text" id="grn-receiver" value="اصغر علی (سٹور کیپر)" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ریمارکس:</label>
          <input type="text" id="grn-remarks" placeholder="مال بالکل درست ہے" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewGRN()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow">GRN محفوظ کریں اور سٹاک شامل کریں</button>
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

  // Update in local DB
  const newGRN = {
    id: db.grns.length + 1,
    grn_number: grnNum,
    supplier_name: supObj ? supObj.name : "Supplier",
    delivery_challan_no: dcNum,
    po_number: "DIRECT",
    receiving_date: new Date().toISOString().split("T")[0],
    received_by: receiver,
    remarks: remarks,
    items: [{ material_name: matObj ? matObj.name : "Material", received_qty: recQty, accepted_qty: accQty, unit: matObj ? matObj.unit : "Pieces" }]
  };

  // Add stock to material
  const targetMat = db.rawMaterials.find(m => m.id === matId);
  if (targetMat) {
    targetMat.current_stock += accQty;
  }

  if (isLocalBackend) {
    try {
      await fetch(`${API_BASE}/api/grns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grn_number: grnNum,
          delivery_challan_no: dcNum,
          supplier_id: supplierId,
          received_by: receiver,
          remarks: remarks,
          items: [{ material_id: matId, received_qty: recQty, rejected_qty: rejQty, accepted_qty: accQty }]
        })
      });
    } catch (e) {}
  }

  db.grns.unshift(newGRN);
  saveLocalDB();
  closeModal();
  await loadRawMaterials();
  await loadGRNs();
  alert(`GRN محفوظ ہو گئی! ${accQty} یونٹس را سٹور انوینٹری میں شامل کر دیے گئے۔`);
}

// ----------------- 4. RAW STORE INVENTORY -----------------

async function loadRawMaterials(categoryFilter = "") {
  let materials = isLocalBackend ? await (await fetch(`${API_BASE}/api/raw-materials`)).json() : db.rawMaterials;
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
        <td class="py-3 px-4 font-bold text-slate-800">${m.name}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">${m.category}</span>
        </td>
        <td class="py-3 px-4 font-bold ${isLow ? 'text-red-600 font-extrabold' : 'text-slate-800'}">${m.current_stock}</td>
        <td class="py-3 px-4 text-slate-500">${m.unit}</td>
        <td class="py-3 px-4">PKR ${m.unit_price}</td>
        <td class="py-3 px-4 text-slate-500">${m.location}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
            ${isLow ? 'کم سٹاک' : 'موجود'}
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
  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="boxes" class="w-5 h-5 text-amber-600"></i>
          نیا را مٹیریل / پارٹ شامل کریں
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">آئٹم کوڈ:</label>
          <input type="text" id="mat-code" placeholder="e.g. CP-SPR-10" class="w-full border rounded-lg p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">آئٹم کا نام:</label>
          <input type="text" id="mat-name" placeholder="e.g. ہیوی ڈیوٹی سپرنگ" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">کیٹیگری:</label>
          <select id="mat-category" class="w-full border rounded-lg p-2 bg-white">
            <option value="Child Part">چائلڈ پارٹ (Child Part)</option>
            <option value="Raw Metal">خام دھات (Raw Metal)</option>
            <option value="Fastener">سپرنگ و ریوٹس (Fastener)</option>
            <option value="Packaging Bag">پیکنگ تھیلی (Bag)</option>
            <option value="Sticker">سٹیکر (Sticker)</option>
            <option value="Logo/Branding">لوگو (Logo/Branding)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">پیمائش کا یونٹ (Unit):</label>
          <select id="mat-unit" class="w-full border rounded-lg p-2 bg-white">
            <option value="Pieces">Pieces (پیس)</option>
            <option value="KG">KG (کلو گرام)</option>
            <option value="Rolls">Rolls (رول)</option>
            <option value="Meters">Meters (میٹر)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">شروع کا سٹاک:</label>
          <input type="number" id="mat-stock" value="0" min="0" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">کم سے کم الرٹ لیول:</label>
          <input type="number" id="mat-alert" value="50" min="1" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewMaterial()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg shadow">سٹور میں شامل کریں</button>
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
    category: document.getElementById("mat-category").value,
    unit: document.getElementById("mat-unit").value,
    current_stock: parseFloat(document.getElementById("mat-stock").value || 0),
    min_alert_level: parseFloat(document.getElementById("mat-alert").value || 50),
    unit_price: 0,
    location: "Shelf-New",
    is_low_stock: false
  };

  if (!newMat.code || !newMat.name) {
    alert("برائے مہربانی کوڈ اور نام درج کریں!");
    return;
  }

  if (isLocalBackend) {
    try {
      await fetch(`${API_BASE}/api/raw-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMat)
      });
    } catch (e) {}
  }

  db.rawMaterials.push(newMat);
  saveLocalDB();
  closeModal();
  await loadRawMaterials();
  alert("نیا مٹیریل کامیابی سے سٹور میں شامل ہو گیا!");
}

// ----------------- 5. SAMPLING & RECIPES -----------------

async function loadSamplingRecipes() {
  const recipes = isLocalBackend ? await (await fetch(`${API_BASE}/api/sampling-recipes`)).json() : db.recipes;
  const container = document.getElementById("recipes-container");
  if (!container) return;

  if (recipes.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-xl border text-center text-slate-400">کوئی سیمپلنگ ریسیپی نہیں ہے</div>`;
    return;
  }

  container.innerHTML = recipes.map(r => `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 font-mono">${r.version}</span>
            <h3 class="font-bold text-base text-slate-800">${r.article_name}</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">${r.notes || 'ماسٹر سیمپل ریسیپی مع چائلڈ پارٹس، تھیلی، سٹیکر اور لوگو'}</p>
        </div>
        <button onclick="useRecipeForBOM(${r.article_id})" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition flex items-center gap-1">
          <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i>
          اس ریسیپی کا BOM بنائیں
        </button>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">فی 1 پیس بنانے کیلئے درکار پرزہ جات و میٹریل:</h4>
        <div class="overflow-x-auto rounded-lg border border-slate-100">
          <table class="w-full text-xs text-left text-slate-600">
            <thead class="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th class="py-2 px-3">کمپوننٹ / میٹریل</th>
                <th class="py-2 px-3">قسم</th>
                <th class="py-2 px-3">فی 1 یونٹ ضرورت</th>
                <th class="py-2 px-3">یونٹ</th>
                <th class="py-2 px-3">تفصیل</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${r.items.map(it => `
                <tr>
                  <td class="py-2 px-3 font-semibold text-slate-800">${it.material_name}</td>
                  <td class="py-2 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${it.component_type}</span>
                  </td>
                  <td class="py-2 px-3 font-bold text-slate-800">${it.qty_per_unit}</td>
                  <td class="py-2 px-3 text-slate-500">${it.unit}</td>
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
    select.innerHTML = articlesCache.map(a => `<option value="${a.id}">${a.name} (${a.article_code})</option>`).join("");
  }
  loadSavedBOMs();
}

async function calculateBOM() {
  const articleId = parseInt(document.getElementById("bom-article-select").value);
  const quantity = parseFloat(document.getElementById("bom-quantity-input").value || 200);

  let data;
  if (isLocalBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/bom/calculate?article_id=${articleId}&planned_quantity=${quantity}`);
      data = await res.json();
    } catch (e) {
      data = calculateLocalBOM(articleId, quantity);
    }
  } else {
    data = calculateLocalBOM(articleId, quantity);
  }

  currentBOMData = data;
  document.getElementById("bom-calculation-result").classList.remove("hidden");
  document.getElementById("bom-res-title").innerText = `BOM برائے: ${data.article_name}`;
  document.getElementById("bom-res-subtitle").innerText = `مطلوبہ پروڈکشن ہدف: ${data.planned_quantity} پیس | ریسیپی: ${data.recipe_name}`;

  const badge = document.getElementById("bom-stock-status-badge");
  if (data.has_shortage) {
    badge.className = "text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200";
    badge.innerText = "انتباہ: را سٹور میں مٹیریل کی کمی ہے!";
  } else {
    badge.className = "text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200";
    badge.innerText = "تمام درکار پرزہ جات و پیکنگ سٹاک میں موجود ہیں";
  }

  const tbody = document.getElementById("bom-calc-table-body");
  tbody.innerHTML = data.items.map(it => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-bold text-slate-800">
        ${it.material_name}
        <span class="block text-[11px] font-mono text-slate-400">${it.material_code}</span>
      </td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${it.component_type}</span>
      </td>
      <td class="py-2.5 px-3 font-semibold">${it.qty_per_unit} ${it.unit}</td>
      <td class="py-2.5 px-3 font-bold text-rose-600 text-sm">${it.required_qty} ${it.unit}</td>
      <td class="py-2.5 px-3 font-medium text-slate-700">${it.available_stock} ${it.unit}</td>
      <td class="py-2.5 px-3 font-bold ${it.shortage_qty > 0 ? 'text-red-600' : 'text-slate-400'}">
        ${it.shortage_qty > 0 ? it.shortage_qty + ' ' + it.unit : '-'}
      </td>
      <td class="py-2.5 px-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${it.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
          ${it.status === 'Available' ? 'دستیاب' : 'شارٹیج'}
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
      component_type: it.component_type,
      qty_per_unit: it.qty_per_unit,
      required_qty: req,
      available_stock: avail,
      shortage_qty: shortage,
      unit: it.unit,
      status: shortage === 0 ? "Available" : "Shortage"
    };
  });

  return {
    article_id: art.id,
    article_name: art.name,
    recipe_id: rec.id,
    recipe_name: rec.recipe_name,
    planned_quantity: quantity,
    has_shortage: hasShortage,
    items: items
  };
}

async function convertBOMToWorkOrder() {
  if (!currentBOMData) {
    alert("پہلے BOM کیلکولیٹ کریں!");
    return;
  }

  const bomNum = `BOM-${Date.now().toString().slice(-4)}`;
  const woNum = `WO-${Date.now().toString().slice(-4)}`;

  const newBOM = {
    id: db.boms.length + 1,
    bom_number: bomNum,
    article_name: currentBOMData.article_name,
    planned_quantity: currentBOMData.planned_quantity,
    status: "ConvertedToWorkOrder",
    created_at: new Date().toISOString().split("T")[0]
  };

  const newWO = {
    id: db.workOrders.length + 1,
    wo_number: woNum,
    article_name: currentBOMData.article_name,
    target_quantity: currentBOMData.planned_quantity,
    produced_quantity: 0,
    status: "In Progress",
    current_step: "Step 1: Stamping & Cutting",
    start_date: new Date().toISOString().split("T")[0],
    steps: [
      { id: Date.now() + 1, step_number: 1, step_name: "Step 1: Stamping & Cutting (پریسنگ / کٹنگ)", piece_rate: 2.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
      { id: Date.now() + 2, step_number: 2, step_name: "Step 2: Sub-Assembly (چھوٹے پرزوں کی فٹنگ)", piece_rate: 4.0, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
      { id: Date.now() + 3, step_number: 3, step_name: "Step 3: Riveting & Welding (ریوٹنگ / ویلڈنگ)", piece_rate: 3.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
      { id: Date.now() + 4, step_number: 4, step_name: "Step 4: Quality Check (کوالٹی چیک و پالش)", piece_rate: 1.5, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" },
      { id: Date.now() + 5, step_number: 5, step_name: "Step 5: Final Packing (تھیلی، سٹیکر اور لوگو پیکنگ)", piece_rate: 2.0, required_pieces: currentBOMData.planned_quantity, completed_pieces: 0, status: "Pending", assigned_worker_name: "Unassigned" }
    ]
  };

  db.boms.unshift(newBOM);
  db.workOrders.unshift(newWO);
  saveLocalDB();

  alert(`BOM (${bomNum}) محفوظ ہو گیا اور نیا ورک آرڈر (${woNum}) جاری کر دیا گیا!`);
  navigate("work_orders");
}

async function loadSavedBOMs() {
  const boms = isLocalBackend ? await (await fetch(`${API_BASE}/api/boms`)).json() : db.boms;
  const tbody = document.getElementById("saved-boms-table");
  if (!tbody) return;

  if (boms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-400">کوئی محفوظ شدہ BOM نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = boms.map(b => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-rose-600">${b.bom_number}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${b.article_name}</td>
      <td class="py-3 px-4 font-bold">${b.planned_quantity} پیس</td>
      <td class="py-3 px-4">${b.created_at}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">${b.status}</span>
      </td>
    </tr>
  `).join("");
}

// ----------------- 7. WORK ORDERS & MULTI-STEP PRODUCTION -----------------

async function loadWorkOrders() {
  const wos = isLocalBackend ? await (await fetch(`${API_BASE}/api/work-orders`)).json() : db.workOrders;
  const container = document.getElementById("work-orders-container");
  if (!container) return;

  if (wos.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-xl border text-center text-slate-400">کوئی ورک آرڈر موجود نہیں ہے</div>`;
    return;
  }

  container.innerHTML = wos.map(wo => `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-orange-100 text-orange-800">${wo.wo_number}</span>
            <h3 class="font-bold text-base text-slate-800">${wo.article_name}</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">ہدف کوانٹٹی: <span class="font-bold text-slate-700">${wo.target_quantity} پیس</span> | تاریخ شروع: ${wo.start_date}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
          ${wo.status}
        </span>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">پروڈکشن کے مراحل (Production Stages & Piece-Rate ٹھیکہ):</h4>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          ${wo.steps.map(s => {
            const pct = Math.min(100, Math.round((s.completed_pieces / s.required_pieces) * 100));
            const isDone = s.status === 'Completed';
            return `
              <div class="border rounded-xl p-3 ${isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'}">مرحلہ ${s.step_number}</span>
                    <span class="text-[11px] font-bold ${isDone ? 'text-emerald-700' : 'text-slate-600'}">${pct}%</span>
                  </div>
                  <h5 class="text-xs font-bold text-slate-800 mt-1.5 leading-tight">${s.step_name}</h5>
                  <p class="text-[11px] text-slate-500 mt-1">ٹھیکہ ریٹ: <span class="font-semibold text-amber-700">PKR ${s.piece_rate}/پیس</span></p>
                  <p class="text-[11px] text-slate-500">کاریگر: <span class="font-semibold text-slate-700">${s.assigned_worker_name}</span></p>
                </div>

                <div class="space-y-2 pt-2 border-t border-slate-200">
                  <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-orange-500 h-1.5 rounded-full" style="width: ${pct}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-500">${s.completed_pieces} / ${s.required_pieces}</span>
                    ${!isDone ? `
                      <button onclick="openStepProgressModal(${wo.id}, ${s.id}, '${s.step_name}', ${s.required_pieces - s.completed_pieces}, ${s.piece_rate})" class="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-[10px] shadow transition">
                        پیس درج کریں
                      </button>
                    ` : `<span class="text-emerald-700 font-bold text-[10px]">مکمل ✓</span>`}
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
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${e.full_name} (${e.department} - ${e.employment_type})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-orange-600"></i>
          مرحلہ پروڈکشن اور ٹھیکہ ورک اندراج
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="bg-orange-50 p-3 rounded-lg border border-orange-200 text-xs">
        <p class="font-bold text-orange-900">${stepName}</p>
        <p class="text-orange-700 mt-0.5">باقی درکار پیس: <strong>${remainingPieces}</strong> | فی پیس ٹھیکہ ریٹ: <strong>PKR ${pieceRate}</strong></p>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">کاریگر منتخب کریں:</label>
          <select id="step-worker" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">آج کتنے پیس مکمل کیے؟</label>
          <input type="number" id="step-completed-add" value="${remainingPieces}" max="${remainingPieces}" min="1" class="w-full border rounded-lg p-2 font-bold text-slate-800 text-sm">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitStepProgress(${woId}, ${stepId}, ${pieceRate})" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow">اندراج کریں و ٹھیکہ شامل کریں</button>
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
      if (step.completed_pieces >= step.required_pieces) {
        step.status = "Completed";
      } else {
        step.status = "In Progress";
      }
    }

    // Check all steps done -> Finished Good
    const allDone = wo.steps.every(s => s.status === "Completed");
    if (allDone) {
      wo.status = "Completed";
      wo.produced_quantity = wo.target_quantity;
      db.finishedGoods.unshift({
        id: db.finishedGoods.length + 1,
        batch_number: `BATCH-${wo.wo_number}`,
        article_name: wo.article_name,
        article_code: "ART-AUTO",
        quantity: wo.produced_quantity,
        packaging_status: "Packed with Theli, Sticker & Logo",
        qc_passed: true,
        storage_location: "FG-Store-Main"
      });
    }
  }

  // Add to piece work log
  db.pieceWorks.unshift({
    id: db.pieceWorks.length + 1,
    employee_id: workerId,
    employee_name: workerObj ? workerObj.full_name : "Worker",
    emp_code: workerObj ? workerObj.emp_code : "EMP",
    article_name: wo ? wo.article_name : "Auto Part",
    step_name: "پروڈکشن مرحلہ",
    date: new Date().toISOString().split("T")[0],
    pieces_completed: completedAdd,
    rate_per_piece: pieceRate,
    total_earning: completedAdd * pieceRate,
    approved_by: "Supervisor"
  });

  saveLocalDB();
  closeModal();
  await loadWorkOrders();
  await loadFinishedGoods();
  alert("پروڈکشن اپڈیٹ ہو گئی اور کاریگر کے ٹھیکہ ریکارڈ میں اجرت شامل کر دی گئی!");
}

// ----------------- 8. FINISHED GOODS & PACKING -----------------

async function loadFinishedGoods() {
  const fgs = isLocalBackend ? await (await fetch(`${API_BASE}/api/finished-goods`)).json() : db.finishedGoods;
  const tbody = document.getElementById("fg-table-body");
  if (!tbody) return;

  if (fgs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">کوئی فنش گڈز سٹاک نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = fgs.map(f => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-teal-700">${f.batch_number}</td>
      <td class="py-3 px-4 font-bold text-slate-800">${f.article_name}</td>
      <td class="py-3 px-4 font-mono text-slate-500">${f.article_code}</td>
      <td class="py-3 px-4 font-extrabold text-teal-600 text-sm">${f.quantity} پیس</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">${f.packaging_status}</span>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-xs font-bold ${f.qc_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">QC پاس ✓</span>
      </td>
      <td class="py-3 px-4 text-slate-500">${f.storage_location}</td>
    </tr>
  `).join("");
}

// ----------------- 9. DISPATCH CHALLAN & GATE PASS -----------------

async function loadDispatchChallans() {
  const challans = isLocalBackend ? await (await fetch(`${API_BASE}/api/dispatch-challans`)).json() : db.dispatchChallans;
  const tbody = document.getElementById("dispatch-table-body");
  if (!tbody) return;

  if (challans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">کوئی ڈسپیچ چالان نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = challans.map(c => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-mono font-bold text-cyan-700">${c.challan_number}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${c.destination_name} (${c.destination_type})</td>
      <td class="py-3 px-4">${c.dispatch_date}</td>
      <td class="py-3 px-4 font-mono font-semibold">${c.vehicle_no}</td>
      <td class="py-3 px-4">${c.driver_name}</td>
      <td class="py-3 px-4 font-mono text-slate-600">${c.gate_pass_no}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="printDispatch(${JSON.stringify(c).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded text-xs font-semibold inline-flex items-center gap-1">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> پرنٹ چالان
        </button>
      </td>
    </tr>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

function openNewDispatchModal() {
  const articleOptions = articlesCache.map(a => `<option value="${a.id}">${a.name} (${a.article_code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="truck" class="w-5 h-5 text-cyan-600"></i>
          نیا ڈسپیچ چالان و گیٹ پاس تیار کریں (New Delivery Challan)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">چالان نمبر:</label>
          <input type="text" id="disp-num" value="DC-OUT-${Date.now().toString().slice(-5)}" class="w-full border rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">منزل کی قسم:</label>
          <select id="disp-dest-type" class="w-full border rounded-lg p-2 bg-white">
            <option value="External Factory">بیرونی فیکٹری (External Factory)</option>
            <option value="Customer Warehouse">کسٹمر گودام (Customer Warehouse)</option>
            <option value="Wholesale Distributor">ہول سیل ڈسٹری بیوٹر</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">فیکٹری / گودام کا نام:</label>
          <input type="text" id="disp-dest-name" placeholder="e.g. سن رائز آٹو انڈسٹریز" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">گاڑی نمبر:</label>
          <input type="text" id="disp-veh" placeholder="e.g. LES-4589" class="w-full border rounded-lg p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ڈرائیور کا نام:</label>
          <input type="text" id="disp-driver" placeholder="e.g. ناصر حسین" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">گیٹ پاس نمبر:</label>
          <input type="text" id="disp-gp" value="GP-${Date.now().toString().slice(-4)}" class="w-full border rounded-lg p-2 font-mono">
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-2 text-xs">
        <h4 class="font-bold text-slate-700">روانہ کردہ فنش گڈز:</h4>
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">آرٹیکل:</label>
            <select id="disp-item-art" class="w-full border rounded p-1.5 bg-white">${articleOptions}</select>
          </div>
          <div class="col-span-4">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">کوانٹٹی (پیس):</label>
            <input type="number" id="disp-item-qty" value="100" min="1" class="w-full border rounded p-1.5 bg-white">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewDispatch()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow">چالان جاری کریں اور سٹاک کٹ کریں</button>
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
    vehicle_no: document.getElementById("disp-veh").value,
    driver_name: document.getElementById("disp-driver").value,
    gate_pass_no: document.getElementById("disp-gp").value,
    dispatch_date: new Date().toISOString().split("T")[0],
    items: [{ article_name: artObj ? artObj.name : "Auto Part", quantity: qty }]
  };

  // Deduct from FG
  const fg = db.finishedGoods.find(f => f.article_name === (artObj ? artObj.name : ""));
  if (fg) {
    fg.quantity = Math.max(0, fg.quantity - qty);
  }

  db.dispatchChallans.unshift(newChallan);
  saveLocalDB();
  closeModal();
  await loadDispatchChallans();
  await loadFinishedGoods();
  alert("ڈسپیچ چالان کامیابی سے جاری ہو گیا اور فنش گڈز سٹاک اپڈیٹ ہو گیا!");
}

// ----------------- 10. HR & PAYROLL -----------------

function switchHRTab(tabName) {
  const tabs = ["attendance", "piece_work", "leaves", "employees"];
  tabs.forEach(t => {
    const btn = document.getElementById(`hr-tab-${t}`);
    const content = document.getElementById(`hr-content-${t}`);
    if (btn) btn.className = t === tabName ? "py-2.5 border-b-2 border-pink-600 text-pink-600" : "py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800";
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
  const atts = isLocalBackend ? await (await fetch(`${API_BASE}/api/attendance`)).json() : db.attendances;
  const tbody = document.getElementById("attendance-table-body");
  if (!tbody) return;

  if (atts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">کوئی حاضری ریکارڈ نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = atts.map(a => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-mono text-slate-700">${a.emp_code}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${a.employee_name}</td>
      <td class="py-2.5 px-3">${a.department}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${a.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
          ${a.status === 'Present' ? 'حاضر (Present)' : 'غیر حاضر'}
        </span>
      </td>
      <td class="py-2.5 px-3 text-slate-600">${a.check_in || '-'}</td>
      <td class="py-2.5 px-3 text-slate-600">${a.check_out || '-'}</td>
      <td class="py-2.5 px-3 font-bold ${a.overtime_hours > 0 ? 'text-pink-600' : 'text-slate-400'}">
        ${a.overtime_hours > 0 ? a.overtime_hours + ' گھنٹے' : '-'}
      </td>
      <td class="py-2.5 px-3 text-slate-500">${a.remarks || '-'}</td>
    </tr>
  `).join("");
}

function openMarkAttendanceModal() {
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${e.full_name} (${e.emp_code})</option>`).join("");
  const today = new Date().toISOString().split("T")[0];

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="calendar-check" class="w-5 h-5 text-pink-600"></i>
          یومیہ حاضری و اوور ٹائم اندراج
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ملازم منتخب کریں:</label>
          <select id="att-emp" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">تاریخ:</label>
            <input type="date" id="att-date" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">حاضری سٹیٹس:</label>
            <select id="att-status" class="w-full border rounded-lg p-2 bg-white">
              <option value="Present">حاضر (Present)</option>
              <option value="Absent">غیر حاضر (Absent)</option>
              <option value="Half-Day">ہاف ڈے (Half-Day)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">آمد کا وقت:</label>
            <input type="text" id="att-in" value="08:00 AM" class="w-full border rounded-lg p-2">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">روانگی کا وقت:</label>
            <input type="text" id="att-out" value="05:00 PM" class="w-full border rounded-lg p-2">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">اوور ٹائم (گھنٹے):</label>
            <input type="number" id="att-ot" value="0" min="0" step="0.5" class="w-full border rounded-lg p-2 font-bold text-pink-600">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitAttendance()" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg shadow">حاضری محفوظ کریں</button>
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
    department: empObj ? empObj.department : "Production",
    date: document.getElementById("att-date").value,
    status: document.getElementById("att-status").value,
    check_in: document.getElementById("att-in").value,
    check_out: document.getElementById("att-out").value,
    overtime_hours: parseFloat(document.getElementById("att-ot").value || 0),
    remarks: "بذریعہ ایچ آر پینل"
  };

  db.attendances.unshift(newAtt);
  saveLocalDB();
  closeModal();
  loadAttendance();
  loadDashboardStats();
}

async function loadPieceWorks() {
  const pws = isLocalBackend ? await (await fetch(`${API_BASE}/api/piece-works`)).json() : db.pieceWorks;
  const tbody = document.getElementById("piecework-table-body");
  if (!tbody) return;

  if (pws.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">کوئی ٹھیکہ ورک ریکارڈ نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = pws.map(p => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3">${p.date}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${p.employee_name}</td>
      <td class="py-2.5 px-3 font-medium text-slate-700">${p.article_name}</td>
      <td class="py-2.5 px-3">${p.step_name}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${p.pieces_completed} پیس</td>
      <td class="py-2.5 px-3 text-slate-600">PKR ${p.rate_per_piece}</td>
      <td class="py-2.5 px-3 font-extrabold text-amber-700">PKR ${p.total_earning.toLocaleString()}</td>
      <td class="py-2.5 px-3 text-slate-500">${p.approved_by}</td>
    </tr>
  `).join("");
}

function openNewPieceWorkModal() {
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${e.full_name} (${e.department})</option>`).join("");
  const articleOptions = articlesCache.map(a => `<option value="${a.name}">${a.name}</option>`).join("");
  const today = new Date().toISOString().split("T")[0];

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="plus-circle" class="w-5 h-5 text-amber-600"></i>
          نئی ٹھیکہ انٹری درج کریں (Piece-Rate Log)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">کاریگر:</label>
            <select id="pw-emp" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">تاریخ:</label>
            <input type="date" id="pw-date" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">آرٹیکل:</label>
            <select id="pw-art" class="w-full border rounded-lg p-2 bg-white">${articleOptions}</select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">کام / مرحلہ:</label>
            <input type="text" id="pw-step" placeholder="e.g. تھیلی و سٹیکر پیکنگ" class="w-full border rounded-lg p-2">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">مکمل شدہ پیس:</label>
            <input type="number" id="pw-pcs" value="100" min="1" class="w-full border rounded-lg p-2 font-bold">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">فی پیس ریٹ (PKR):</label>
            <input type="number" id="pw-rate" value="5" min="0.5" step="0.5" class="w-full border rounded-lg p-2 font-bold text-amber-700">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitPieceWork()" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow">اجرت اندراج کریں</button>
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
    emp_code: empObj ? empObj.emp_code : "EMP",
    article_name: document.getElementById("pw-art").value,
    step_name: document.getElementById("pw-step").value,
    date: document.getElementById("pw-date").value,
    pieces_completed: pcs,
    rate_per_piece: rate,
    total_earning: pcs * rate,
    approved_by: "Supervisor"
  };

  db.pieceWorks.unshift(newPW);
  saveLocalDB();
  closeModal();
  loadPieceWorks();
  alert("ٹھیکہ ورک کامیابی سے محفوظ ہو گیا!");
}

async function loadLeaves() {
  const leaves = isLocalBackend ? await (await fetch(`${API_BASE}/api/leaves`)).json() : db.leaves;
  const tbody = document.getElementById("leaves-table-body");
  if (!tbody) return;

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">کوئی چھٹی کی درخواست نہیں ہے</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves.map(l => `
    <tr class="hover:bg-slate-50">
      <td class="py-2.5 px-3 font-bold text-slate-800">${l.employee_name}</td>
      <td class="py-2.5 px-3">${l.leave_type}</td>
      <td class="py-2.5 px-3">${l.start_date}</td>
      <td class="py-2.5 px-3">${l.end_date}</td>
      <td class="py-2.5 px-3 font-bold">${l.total_days} دن</td>
      <td class="py-2.5 px-3 text-slate-600">${l.reason}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${l.status}
        </span>
      </td>
      <td class="py-2.5 px-3 text-right space-x-1 rtl:space-x-reverse">
        ${l.status === 'Pending' ? `
          <button onclick="updateLeaveStatus(${l.id}, 'Approved')" class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-semibold">منظور</button>
        ` : '-'}
      </td>
    </tr>
  `).join("");
}

function updateLeaveStatus(id, status) {
  const lv = db.leaves.find(l => l.id === id);
  if (lv) {
    lv.status = status;
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
      <td class="py-2.5 px-3 font-bold text-slate-800">${e.full_name}</td>
      <td class="py-2.5 px-3">${e.designation}</td>
      <td class="py-2.5 px-3 font-medium">${e.department}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${e.employment_type === 'Piece-Rate' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
          ${e.employment_type === 'Piece-Rate' ? 'ٹھیکہ ورکر' : 'تنخواہ دار'}
        </span>
      </td>
      <td class="py-2.5 px-3 font-semibold">
        ${e.employment_type === 'Piece-Rate' ? `PKR ${e.piece_rate_default}/پیس` : `PKR ${e.base_salary.toLocaleString()}`}
      </td>
      <td class="py-2.5 px-3 text-slate-500 font-mono">${e.phone}</td>
    </tr>
  `).join("");
}

// ----------------- 11. RBAC & USER CONTROLS -----------------

async function loadRolesAndUsers() {
  const roles = isLocalBackend ? await (await fetch(`${API_BASE}/api/roles`)).json() : db.roles;
  const users = isLocalBackend ? await (await fetch(`${API_BASE}/api/users`)).json() : db.users;

  const rolesContainer = document.getElementById("roles-list-container");
  if (rolesContainer) {
    rolesContainer.innerHTML = roles.map(r => `
      <div class="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800">${r.name}</span>
          <span class="text-[11px] font-mono text-indigo-600 font-semibold">${r.permissions === '*' ? 'تمام ماڈیولز (Full Access)' : r.permissions}</span>
        </div>
        <p class="text-slate-500 text-[11px] mt-1">${r.description}</p>
      </div>
    `).join("");
  }

  const usersTbody = document.getElementById("users-table-body");
  if (usersTbody) {
    usersTbody.innerHTML = users.map(u => `
      <tr class="hover:bg-slate-50">
        <td class="py-2 px-3 font-mono font-semibold text-slate-700">${u.username}</td>
        <td class="py-2 px-3 font-medium text-slate-800">${u.full_name}</td>
        <td class="py-2 px-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">${u.role}</span>
        </td>
      </tr>
    `).join("");
  }
}

// ----------------- HELPERS & CACHE LOADERS -----------------

async function loadArticles() {
  articlesCache = isLocalBackend ? await (await fetch(`${API_BASE}/api/articles`)).json() : db.articles;
}

async function loadSuppliers() {
  suppliersCache = isLocalBackend ? await (await fetch(`${API_BASE}/api/suppliers`)).json() : db.suppliers;
}

async function loadEmployees() {
  employeesCache = isLocalBackend ? await (await fetch(`${API_BASE}/api/employees`)).json() : db.employees;
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
              <td style="text-align: center;">Packed with Theli, Sticker & Logo ✓</td>
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
