// Mufti Auto Store Production ERP - Core JavaScript

const API_BASE = "";

// State
let currentRole = "Admin";
let currentView = "dashboard";
let currentBOMData = null;
let articlesCache = [];
let rawMaterialsCache = [];
let suppliersCache = [];
let employeesCache = [];

// Role-Based Access Control Definitions
const ROLE_PERMISSIONS = {
  Admin: ["dashboard", "po", "grn", "raw_store", "sampling", "bom", "work_orders", "fg", "dispatch", "hr", "rbac"],
  Storekeeper: ["dashboard", "po", "grn", "raw_store"],
  Production: ["dashboard", "sampling", "bom", "work_orders", "fg"],
  HR: ["dashboard", "hr"],
  Dispatch: ["dashboard", "fg", "dispatch"]
};

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Set today's date in filters
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
  
  // If current view is not permitted in new role, redirect to dashboard
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
    alert("آپ کے مقررہ رول کو اس ماڈیول تک رسائی کی اجازت نہیں ہے۔ (Access Restricted for this Role)");
    return;
  }

  currentView = viewName;

  // Hide all views
  const views = document.querySelectorAll("main > section");
  views.forEach(v => v.classList.add("hidden"));

  // Show target view
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove("hidden");
  }

  // Update nav button active states
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("bg-slate-900", "text-white", "shadow-sm");
    btn.classList.add("text-slate-700");
  });

  const activeBtn = document.getElementById(`nav-${viewName}`);
  if (activeBtn) {
    activeBtn.classList.remove("text-slate-700");
    activeBtn.classList.add("bg-slate-900", "text-white", "shadow-sm");
  }

  // Refresh view specific data
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
  try {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    const data = await res.json();

    document.getElementById("stat-raw-items").innerText = data.raw_materials_count;
    document.getElementById("stat-low-stock").innerText = data.low_stock_count;
    document.getElementById("stat-active-wo").innerText = data.active_work_orders;
    document.getElementById("stat-fg-qty").innerText = data.finished_goods_qty;
    document.getElementById("stat-attendance").innerText = `${data.today_present_count} / ${data.total_employees}`;

    // Load recent work orders in dashboard
    const woRes = await fetch(`${API_BASE}/api/work-orders`);
    const wos = await woRes.json();
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

    // Load low stock items in dashboard
    const matRes = await fetch(`${API_BASE}/api/raw-materials`);
    const mats = await matRes.json();
    const lowMats = mats.filter(m => m.is_low_stock);
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

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

// ----------------- 2. PURCHASE ORDERS -----------------

async function loadPurchaseOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/purchase-orders`);
    const pos = await res.json();
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
  } catch (err) {
    console.error(err);
  }
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
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700">آرڈر آئٹمز (Order Items):</h4>
        </div>
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
  const matId = parseInt(document.getElementById("po-item-mat").value);
  const qty = parseFloat(document.getElementById("po-item-qty").value);
  const price = parseFloat(document.getElementById("po-item-price").value);

  const payload = {
    po_number: poNum,
    supplier_id: supplierId,
    items: [
      {
        material_id: matId,
        quantity: qty,
        unit_price: price
      }
    ]
  };

  try {
    const res = await fetch(`${API_BASE}/api/purchase-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      loadPurchaseOrders();
      alert("پرچیز آرڈر کامیابی سے جاری کر دیا گیا!");
    }
  } catch (err) {
    alert("Error creating PO: " + err);
  }
}

// ----------------- 3. GRN & RECEIVING -----------------

async function loadGRNs() {
  try {
    const res = await fetch(`${API_BASE}/api/grns`);
    const grns = await res.json();
    const tbody = document.getElementById("grn-table-body");
    
    if (grns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">کوئی GRN ریکارڈ موجود نہیں ہے</td></tr>`;
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
  } catch (err) {
    console.error(err);
  }
}

function openNewGRNModal() {
  const supplierOptions = suppliersCache.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${m.name} (${m.code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="package-check" class="w-5 h-5 text-emerald-600"></i>
          نئی GRN ریسیونگ و چالان اندراج (New Goods Received Note)
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
          <select id="grn-supplier" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
            ${supplierOptions}
          </select>
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
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">وصول شدہ مقدار (Received):</label>
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
          <label class="block font-semibold mb-1 text-slate-700">ریمارکس / کوالٹی رپورٹ:</label>
          <input type="text" id="grn-remarks" placeholder="مال بالکل درست اور اوکے ہے" class="w-full border border-slate-300 rounded-lg p-2 bg-white">
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
  const receiver = document.getElementById("grn-receiver").value;
  const remarks = document.getElementById("grn-remarks").value;

  const matId = parseInt(document.getElementById("grn-item-mat").value);
  const recQty = parseFloat(document.getElementById("grn-item-qty").value);
  const rejQty = parseFloat(document.getElementById("grn-item-rej").value);
  const price = parseFloat(document.getElementById("grn-item-price").value);
  const accQty = Math.max(0, recQty - rejQty);

  const payload = {
    grn_number: grnNum,
    delivery_challan_no: dcNum,
    supplier_id: supplierId,
    received_by: receiver,
    remarks: remarks,
    items: [
      {
        material_id: matId,
        received_qty: recQty,
        rejected_qty: rejQty,
        accepted_qty: accQty,
        unit_price: price
      }
    ]
  };

  try {
    const res = await fetch(`${API_BASE}/api/grns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      await loadRawMaterials();
      await loadGRNs();
      alert(`GRN کامیابی سے محفوظ ہوگئی! ${accQty} یونٹس را سٹور انوینٹری میں شامل کر دیے گئے ہیں۔`);
    }
  } catch (err) {
    alert("Error creating GRN: " + err);
  }
}

// ----------------- 4. RAW STORE INVENTORY -----------------

async function loadRawMaterials(categoryFilter = "") {
  try {
    const url = categoryFilter ? `${API_BASE}/api/raw-materials?category=${encodeURIComponent(categoryFilter)}` : `${API_BASE}/api/raw-materials`;
    const res = await fetch(url);
    const materials = await res.json();
    rawMaterialsCache = materials;

    const tbody = document.getElementById("raw-store-table-body");
    if (tbody) {
      tbody.innerHTML = materials.map(m => `
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-mono font-semibold text-slate-700">${m.code}</td>
          <td class="py-3 px-4 font-bold text-slate-800">${m.name}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
              ${m.category}
            </span>
          </td>
          <td class="py-3 px-4 font-bold ${m.is_low_stock ? 'text-red-600 font-extrabold' : 'text-slate-800'}">
            ${m.current_stock}
          </td>
          <td class="py-3 px-4 text-slate-500">${m.unit}</td>
          <td class="py-3 px-4">PKR ${m.unit_price}</td>
          <td class="py-3 px-4 text-slate-500">${m.location}</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${m.is_low_stock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
              ${m.is_low_stock ? 'کم سٹاک' : 'موجود'}
            </span>
          </td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error(err);
  }
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
  const payload = {
    code: document.getElementById("mat-code").value,
    name: document.getElementById("mat-name").value,
    category: document.getElementById("mat-category").value,
    unit: document.getElementById("mat-unit").value,
    current_stock: parseFloat(document.getElementById("mat-stock").value || 0),
    min_alert_level: parseFloat(document.getElementById("mat-alert").value || 50),
    unit_price: 0.0
  };

  if (!payload.code || !payload.name) {
    alert("برائے مہربانی کوڈ اور نام درج کریں!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/raw-materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      await loadRawMaterials();
      alert("نیا مٹیریل کامیابی سے سٹور میں شامل کر دیا گیا!");
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

// ----------------- 5. SAMPLING & RECIPES -----------------

async function loadSamplingRecipes() {
  try {
    const res = await fetch(`${API_BASE}/api/sampling-recipes`);
    const recipes = await res.json();
    const container = document.getElementById("recipes-container");

    if (recipes.length === 0) {
      container.innerHTML = `<div class="bg-white p-8 rounded-xl border text-center text-slate-400">کوئی سیمپلنگ ریسیپی موجود نہیں ہے</div>`;
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
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">فی 1 پیس بنانے کیلئے درکار پرزہ جات و میٹریل (Recipe Components):</h4>
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs text-left text-slate-600">
              <thead class="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th class="py-2 px-3">کمپوننٹ / میٹریل</th>
                  <th class="py-2 px-3">قسم (Type)</th>
                  <th class="py-2 px-3">فی 1 یونٹ ضرورت</th>
                  <th class="py-2 px-3">یونٹ</th>
                  <th class="py-2 px-3">تفصیل / نوٹس</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${r.items.map(it => `
                  <tr>
                    <td class="py-2 px-3 font-semibold text-slate-800">${it.material_name}</td>
                    <td class="py-2 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                        it.component_type === 'Packaging Bag' ? 'bg-amber-100 text-amber-800' :
                        it.component_type === 'Sticker' ? 'bg-blue-100 text-blue-800' :
                        it.component_type === 'Logo/Branding' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }">
                        ${it.component_type}
                      </span>
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
  } catch (err) {
    console.error(err);
  }
}

function useRecipeForBOM(articleId) {
  navigate("bom");
  const sel = document.getElementById("bom-article-select");
  if (sel) {
    sel.value = articleId;
    calculateBOM();
  }
}

function openNewRecipeModal() {
  const articleOptions = articlesCache.map(a => `<option value="${a.id}">${a.name} (${a.article_code})</option>`).join("");
  const materialOptions = rawMaterialsCache.map(m => `<option value="${m.id}">${m.name} (${m.category})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="flask-conical" class="w-5 h-5 text-purple-600"></i>
          نئی سیمپلنگ ریسیپی ڈیفائن کریں (New Master Recipe)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">آرٹیکل منتخب کریں:</label>
          <select id="rec-article" class="w-full border rounded-lg p-2 bg-white">
            ${articleOptions}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ریسیپی کا نام و ورژن:</label>
          <input type="text" id="rec-name" value="Master Recipe v1.0" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="border rounded-lg p-3 bg-slate-50 space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700">کمپوننٹ شامل کریں (Child Part / Theli / Sticker / Logo):</h4>
        </div>
        <div class="grid grid-cols-12 gap-2 text-xs">
          <div class="col-span-5">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">میٹریل:</label>
            <select id="rec-item-mat" class="w-full border rounded p-1.5 bg-white">${materialOptions}</select>
          </div>
          <div class="col-span-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">قسم (Type):</label>
            <select id="rec-item-type" class="w-full border rounded p-1.5 bg-white">
              <option value="Child Part">چائلڈ پارٹ</option>
              <option value="Raw Metal">خام میٹریل</option>
              <option value="Packaging Bag">تھیلی (Bag)</option>
              <option value="Sticker">سٹیکر</option>
              <option value="Logo/Branding">لوگو</option>
              <option value="Fastener">سپرنگ / ریوٹ</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">فی 1 پیس ضرورت:</label>
            <input type="number" id="rec-item-qty" value="1" step="0.1" min="0.1" class="w-full border rounded p-1.5 bg-white">
          </div>
          <div class="col-span-2 flex items-end">
            <button onclick="addRecipeItemRow()" type="button" class="w-full py-1.5 bg-purple-600 text-white rounded font-bold text-xs">+ شامل</button>
          </div>
        </div>

        <div class="mt-2 overflow-x-auto">
          <table class="w-full text-xs text-left bg-white border rounded">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="p-1.5">میٹریل</th>
                <th class="p-1.5">قسم</th>
                <th class="p-1.5">کوانٹٹی</th>
                <th class="p-1.5 text-center">حذف</th>
              </tr>
            </thead>
            <tbody id="recipe-rows-tbody">
              <!-- Dynamically added rows -->
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewRecipe()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow">ریسیپی محفوظ کریں</button>
      </div>
    </div>
  `;

  showModal(content);
  window.tempRecipeItems = [];
}

function addRecipeItemRow() {
  const matSelect = document.getElementById("rec-item-mat");
  const matId = parseInt(matSelect.value);
  const matName = matSelect.options[matSelect.selectedIndex].text;
  const compType = document.getElementById("rec-item-type").value;
  const qty = parseFloat(document.getElementById("rec-item-qty").value || 1);

  window.tempRecipeItems.push({
    material_id: matId,
    material_name: matName,
    component_type: compType,
    qty_per_unit: qty,
    unit: "Pieces"
  });

  renderRecipeRows();
}

function renderRecipeRows() {
  const tbody = document.getElementById("recipe-rows-tbody");
  if (!tbody) return;
  tbody.innerHTML = window.tempRecipeItems.map((it, idx) => `
    <tr>
      <td class="p-1.5 font-medium">${it.material_name}</td>
      <td class="p-1.5">${it.component_type}</td>
      <td class="p-1.5 font-bold">${it.qty_per_unit}</td>
      <td class="p-1.5 text-center">
        <button onclick="removeRecipeRow(${idx})" class="text-red-500 hover:text-red-700 font-bold">×</button>
      </td>
    </tr>
  `).join("");
}

function removeRecipeRow(idx) {
  window.tempRecipeItems.splice(idx, 1);
  renderRecipeRows();
}

async function submitNewRecipe() {
  if (!window.tempRecipeItems || window.tempRecipeItems.length === 0) {
    alert("براہ کرم ریسیپی میں کم از کم ایک پارٹ یا میٹریل شامل کریں!");
    return;
  }

  const payload = {
    article_id: parseInt(document.getElementById("rec-article").value),
    recipe_name: document.getElementById("rec-name").value,
    version: "v1.0",
    items: window.tempRecipeItems
  };

  try {
    const res = await fetch(`${API_BASE}/api/sampling-recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      await loadSamplingRecipes();
      alert("سیمپلنگ ریسیپی کامیابی سے محفوظ ہو گئی!");
    }
  } catch (err) {
    alert("Error: " + err);
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
  const articleId = document.getElementById("bom-article-select").value;
  const quantity = parseFloat(document.getElementById("bom-quantity-input").value || 200);

  try {
    const res = await fetch(`${API_BASE}/api/bom/calculate?article_id=${articleId}&planned_quantity=${quantity}`);
    if (!res.ok) {
      const err = await res.json();
      alert(err.detail || "BOM کیلکولیٹ کرنے میں خرابی");
      return;
    }

    const data = await res.json();
    currentBOMData = data;

    // Display Results
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
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
            it.component_type === 'Packaging Bag' ? 'bg-amber-100 text-amber-800' :
            it.component_type === 'Sticker' ? 'bg-blue-100 text-blue-800' :
            it.component_type === 'Logo/Branding' ? 'bg-purple-100 text-purple-800' :
            'bg-slate-100 text-slate-700'
          }">
            ${it.component_type}
          </span>
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

  } catch (err) {
    alert("Error: " + err);
  }
}

async function convertBOMToWorkOrder() {
  if (!currentBOMData) {
    alert("پہلے BOM کیلکولیٹ کریں!");
    return;
  }

  // 1. Save BOM
  const bomNum = `BOM-${Date.now().toString().slice(-5)}`;
  const bomPayload = {
    bom_number: bomNum,
    article_id: currentBOMData.article_id,
    recipe_id: currentBOMData.recipe_id,
    planned_quantity: currentBOMData.planned_quantity,
    created_by: "Production Manager",
    items: currentBOMData.items
  };

  try {
    const bomRes = await fetch(`${API_BASE}/api/boms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bomPayload)
    });
    const savedBOM = await bomRes.json();

    // 2. Convert to Work Order
    const woNum = `WO-${Date.now().toString().slice(-5)}`;
    const woPayload = {
      bom_id: savedBOM.id,
      wo_number: woNum,
      notes: `Generated from ${bomNum} for ${currentBOMData.planned_quantity} units.`
    };

    const woRes = await fetch(`${API_BASE}/api/work-orders/from-bom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(woPayload)
    });

    if (woRes.ok) {
      alert(`BOM (${bomNum}) محفوظ ہو گیا اور ورک آرڈر (${woNum}) جاری کر دیا گیا!`);
      navigate("work_orders");
    }
  } catch (err) {
    alert("Error creating work order: " + err);
  }
}

async function loadSavedBOMs() {
  try {
    const res = await fetch(`${API_BASE}/api/boms`);
    const boms = await res.json();
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
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.status === 'ConvertedToWorkOrder' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}">
            ${b.status}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}

// ----------------- 7. WORK ORDERS & MULTI-STEP PRODUCTION -----------------

async function loadWorkOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/work-orders`);
    const wos = await res.json();
    const container = document.getElementById("work-orders-container");

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
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold ${wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
              ${wo.status}
            </span>
          </div>
        </div>

        <!-- Production Steps Kanban / Progress Cards -->
        <div>
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">پروڈکشن کے مراحل (Production Stages & Piece-Rate ঠিকہ):</h4>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            ${wo.steps.map(s => {
              const pct = Math.min(100, Math.round((s.completed_pieces / s.required_pieces) * 100));
              const isDone = s.status === 'Completed';
              return `
                <div class="border rounded-xl p-3 ${isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between space-y-2">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                        مرحلہ ${s.step_number}
                      </span>
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
                        <button onclick="openStepProgressModal(${s.id}, '${s.step_name}', ${s.required_pieces - s.completed_pieces}, ${s.piece_rate})" class="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-[10px] shadow transition">
                          پیس درج کریں
                        </button>
                      ` : `
                        <span class="text-emerald-700 font-bold text-[10px]">مکمل ✓</span>
                      `}
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
  } catch (err) {
    console.error(err);
  }
}

function openStepProgressModal(stepId, stepName, remainingPieces, pieceRate) {
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
          <label class="block font-semibold mb-1 text-slate-700">کاریگر منتخب کریں (Assigned Worker):</label>
          <select id="step-worker" class="w-full border rounded-lg p-2 bg-white">
            ${workerOptions}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">آج کتنے پیس مکمل کیے؟</label>
          <input type="number" id="step-completed-add" value="${remainingPieces}" max="${remainingPieces}" min="1" class="w-full border rounded-lg p-2 font-bold text-slate-800 text-sm">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitStepProgress(${stepId})" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow">اندراج کریں و ٹھیکہ شامل کریں</button>
      </div>
    </div>
  `;

  showModal(content);
}

async function submitStepProgress(stepId) {
  const workerId = parseInt(document.getElementById("step-worker").value);
  const completedAdd = parseFloat(document.getElementById("step-completed-add").value || 0);

  if (completedAdd <= 0) {
    alert("پیس کی تعداد درج کریں!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/work-orders/step-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step_id: stepId,
        completed_add: completedAdd,
        worker_id: workerId
      })
    });

    if (res.ok) {
      closeModal();
      await loadWorkOrders();
      await loadFinishedGoods();
      alert("پروڈکشن اپڈیٹ ہو گئی اور کاریگر کے ٹھیکہ ریکارڈ میں اجرت شامل کر دی گئی!");
    }
  } catch (err) {
    alert("Error updating step: " + err);
  }
}

// ----------------- 8. FINISHED GOODS & PACKING -----------------

async function loadFinishedGoods() {
  try {
    const res = await fetch(`${API_BASE}/api/finished-goods`);
    const fgs = await res.json();
    const tbody = document.getElementById("fg-table-body");
    if (!tbody) return;

    if (fgs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">کوئی فنش گڈز سٹاک موجود نہیں ہے</td></tr>`;
      return;
    }

    tbody.innerHTML = fgs.map(f => `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-mono font-bold text-teal-700">${f.batch_number}</td>
        <td class="py-3 px-4 font-bold text-slate-800">${f.article_name}</td>
        <td class="py-3 px-4 font-mono text-slate-500">${f.article_code}</td>
        <td class="py-3 px-4 font-extrabold text-teal-600 text-sm">${f.quantity} پیس</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            ${f.packaging_status}
          </span>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-xs font-bold ${f.qc_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
            ${f.qc_passed ? 'QC پاس ✓' : 'زیر تفتیش'}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-500">${f.storage_location}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}

// ----------------- 9. DISPATCH CHALLAN & GATE PASS -----------------

async function loadDispatchChallans() {
  try {
    const res = await fetch(`${API_BASE}/api/dispatch-challans`);
    const challans = await res.json();
    const tbody = document.getElementById("dispatch-table-body");
    if (!tbody) return;

    if (challans.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">کوئی ڈسپیچ چالان موجود نہیں ہے</td></tr>`;
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
  } catch (err) {
    console.error(err);
  }
}

function openNewDispatchModal() {
  const articleOptions = articlesCache.map(a => `<option value="${a.id}">${a.name} (${a.article_code})</option>`).join("");

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="truck" class="w-5 h-5 text-cyan-600"></i>
          نیا ڈسپیچ چالان و گیٹ پاس تیار کریں (Dispatch Challan & Gate Pass)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">چالان نمبر:</label>
          <input type="text" id="disp-num" value="DC-OUT-${Date.now().toString().slice(-5)}" class="w-full border rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">منزل کی قسم (Destination Type):</label>
          <select id="disp-dest-type" class="w-full border rounded-lg p-2 bg-white">
            <option value="External Factory">بیرونی فیکٹری (External Factory)</option>
            <option value="Customer Warehouse">کسٹمر گودام (Customer Warehouse)</option>
            <option value="Wholesale Distributor">ہول سیل ڈسٹری بیوٹر</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">فیکٹری / گودام کا نام:</label>
          <input type="text" id="disp-dest-name" placeholder="e.g. سن رائز آٹو انڈسٹریز گودام #3" class="w-full border rounded-lg p-2">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">گاڑی نمبر (Vehicle No):</label>
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
        <h4 class="font-bold text-slate-700">روانہ کردہ فنش گڈز تفصیل:</h4>
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
        <button onclick="submitNewDispatch()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow">چالان جاری کریں اور فنش گڈز سے مائنس کریں</button>
      </div>
    </div>
  `;

  showModal(content);
}

async function submitNewDispatch() {
  const payload = {
    challan_number: document.getElementById("disp-num").value,
    destination_type: document.getElementById("disp-dest-type").value,
    destination_name: document.getElementById("disp-dest-name").value,
    vehicle_no: document.getElementById("disp-veh").value,
    driver_name: document.getElementById("disp-driver").value,
    gate_pass_no: document.getElementById("disp-gp").value,
    items: [
      {
        article_id: parseInt(document.getElementById("disp-item-art").value),
        quantity: parseFloat(document.getElementById("disp-item-qty").value || 100)
      }
    ]
  };

  if (!payload.destination_name || !payload.vehicle_no) {
    alert("براہ کرم منزل اور گاڑی نمبر درج کریں!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/dispatch-challans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal();
      await loadDispatchChallans();
      await loadFinishedGoods();
      alert("ڈسپیچ چالان کامیابی سے جاری ہو گیا اور فنش گڈز سٹاک اپڈیٹ ہو گیا!");
    }
  } catch (err) {
    alert("Error creating dispatch: " + err);
  }
}

// ----------------- 10. HR & PAYROLL -----------------

function switchHRTab(tabName) {
  const tabs = ["attendance", "piece_work", "leaves", "employees"];
  tabs.forEach(t => {
    const btn = document.getElementById(`hr-tab-${t}`);
    const content = document.getElementById(`hr-content-${t}`);
    if (btn) {
      btn.className = t === tabName ? "py-2.5 border-b-2 border-pink-600 text-pink-600" : "py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800";
    }
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
  const dateInput = document.getElementById("attendance-date-filter");
  const dateStr = dateInput ? dateInput.value : "";
  const url = dateStr ? `${API_BASE}/api/attendance?date=${dateStr}` : `${API_BASE}/api/attendance`;

  try {
    const res = await fetch(url);
    const atts = await res.json();
    const tbody = document.getElementById("attendance-table-body");
    if (!tbody) return;

    if (atts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">اس تاریخ کا کوئی حاضری ریکارڈ موجود نہیں ہے</td></tr>`;
      return;
    }

    tbody.innerHTML = atts.map(a => `
      <tr class="hover:bg-slate-50">
        <td class="py-2.5 px-3 font-mono text-slate-700">${a.emp_code}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800">${a.employee_name}</td>
        <td class="py-2.5 px-3">${a.department}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
            a.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
            a.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
          }">
            ${a.status === 'Present' ? 'حاضر (Present)' : a.status === 'Absent' ? 'غیر حاضر' : 'چھٹی'}
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
  } catch (err) {
    console.error(err);
  }
}

function openMarkAttendanceModal() {
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${e.full_name} (${e.emp_code} - ${e.department})</option>`).join("");
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
          <select id="att-emp" class="w-full border rounded-lg p-2 bg-white">
            ${workerOptions}
          </select>
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
              <option value="Leave">چھٹی (Leave)</option>
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
  const payload = {
    employee_id: parseInt(document.getElementById("att-emp").value),
    date: document.getElementById("att-date").value,
    status: document.getElementById("att-status").value,
    check_in: document.getElementById("att-in").value,
    check_out: document.getElementById("att-out").value,
    overtime_hours: parseFloat(document.getElementById("att-ot").value || 0),
    remarks: "بذریعہ ایچ آر پینل"
  };

  try {
    const res = await fetch(`${API_BASE}/api/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      loadAttendance();
      loadDashboardStats();
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

async function loadPieceWorks() {
  try {
    const res = await fetch(`${API_BASE}/api/piece-works`);
    const pws = await res.json();
    const tbody = document.getElementById("piecework-table-body");
    if (!tbody) return;

    if (pws.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-slate-400">کوئی ٹھیکہ ورک ریکارڈ موجود نہیں ہے</td></tr>`;
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
  } catch (err) {
    console.error(err);
  }
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
          نئی ٹھیکہ انٹری درج کریں (Direct Piece-Rate Log)
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
            <label class="block font-semibold mb-1 text-slate-700">کام / مرحلے کا نام:</label>
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
  const payload = {
    employee_id: parseInt(document.getElementById("pw-emp").value),
    date: document.getElementById("pw-date").value,
    article_name: document.getElementById("pw-art").value,
    step_name: document.getElementById("pw-step").value,
    pieces_completed: parseFloat(document.getElementById("pw-pcs").value || 0),
    rate_per_piece: parseFloat(document.getElementById("pw-rate").value || 0)
  };

  try {
    const res = await fetch(`${API_BASE}/api/piece-works`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      loadPieceWorks();
      alert("ٹھیکہ ورک کامیابی سے محفوظ ہو گیا!");
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

async function loadLeaves() {
  try {
    const res = await fetch(`${API_BASE}/api/leaves`);
    const leaves = await res.json();
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
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
            l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
            l.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
          }">
            ${l.status}
          </span>
        </td>
        <td class="py-2.5 px-3 text-right space-x-1 rtl:space-x-reverse">
          ${l.status === 'Pending' ? `
            <button onclick="updateLeaveStatus(${l.id}, 'Approved')" class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-semibold">منظور</button>
            <button onclick="updateLeaveStatus(${l.id}, 'Rejected')" class="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-semibold">مسترد</button>
          ` : '-'}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}

async function updateLeaveStatus(leaveId, status) {
  try {
    const res = await fetch(`${API_BASE}/api/leaves/${leaveId}/status?status=${status}`, { method: "POST" });
    if (res.ok) {
      loadLeaves();
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

function openApplyLeaveModal() {
  const workerOptions = employeesCache.map(e => `<option value="${e.id}">${e.full_name} (${e.department})</option>`).join("");
  const today = new Date().toISOString().split("T")[0];

  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="calendar" class="w-5 h-5 text-rose-600"></i>
          چھٹی کی درخواست (Apply Leave)
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ملازم:</label>
          <select id="lv-emp" class="w-full border rounded-lg p-2 bg-white">${workerOptions}</select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">چھٹی کی قسم:</label>
            <select id="lv-type" class="w-full border rounded-lg p-2 bg-white">
              <option value="Casual (اتفاقی)">اتفاقی چھٹی (Casual)</option>
              <option value="Sick (بیماری)">بیماری کی چھٹی (Sick)</option>
              <option value="Annual (سالانہ)">سالانہ چھٹی (Annual)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">کل دن:</label>
            <input type="number" id="lv-days" value="1" min="1" class="w-full border rounded-lg p-2">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">شروع تاریخ:</label>
            <input type="date" id="lv-start" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">اختتام تاریخ:</label>
            <input type="date" id="lv-end" value="${today}" class="w-full border rounded-lg p-2 bg-white">
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700">چھٹی کی وجہ:</label>
          <textarea id="lv-reason" rows="2" placeholder="ضروری گھریلو کام" class="w-full border rounded-lg p-2"></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitLeave()" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow">درخواست جمع کروائیں</button>
      </div>
    </div>
  `;

  showModal(content);
}

async function submitLeave() {
  const payload = {
    employee_id: parseInt(document.getElementById("lv-emp").value),
    leave_type: document.getElementById("lv-type").value,
    start_date: document.getElementById("lv-start").value,
    end_date: document.getElementById("lv-end").value,
    total_days: parseInt(document.getElementById("lv-days").value || 1),
    reason: document.getElementById("lv-reason").value || "ضروری کام"
  };

  try {
    const res = await fetch(`${API_BASE}/api/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      loadLeaves();
      alert("چھٹی کی درخواست جمع ہو گئی!");
    }
  } catch (err) {
    alert("Error: " + err);
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

function openNewEmployeeModal() {
  const content = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i data-lucide="user-plus" class="w-5 h-5 text-pink-600"></i>
          نیا ملازم / کاریگر شامل کریں
        </h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ملازم کوڈ:</label>
          <input type="text" id="emp-code" value="EMP-${Date.now().toString().slice(-4)}" class="w-full border rounded-lg p-2 font-mono bg-slate-50" readonly>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">مکمل نام:</label>
          <input type="text" id="emp-name" placeholder="e.g. محمد سلیم" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">عہدہ (Designation):</label>
          <input type="text" id="emp-desig" placeholder="e.g. پریس آپریٹر / کاریگر" class="w-full border rounded-lg p-2">
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">شعبہ (Department):</label>
          <select id="emp-dept" class="w-full border rounded-lg p-2 bg-white">
            <option value="Production">Production (پروڈکشن)</option>
            <option value="Packaging">Packaging (پیکنگ و سٹیکرنگ)</option>
            <option value="Raw Store">Raw Store (را سٹور)</option>
            <option value="FG Store">FG Store (فنش گڈز)</option>
            <option value="QC">Quality Control (کوالٹی چیک)</option>
            <option value="HR">HR & Admin</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">ملازمت کی قسم:</label>
          <select id="emp-type" class="w-full border rounded-lg p-2 bg-white">
            <option value="Piece-Rate">Piece-Rate (پر پیس ٹھیکہ)</option>
            <option value="Salaried">Salaried (ماہانہ تنخواہ)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">فون نمبر:</label>
          <input type="text" id="emp-phone" placeholder="0300-1234567" class="w-full border rounded-lg p-2 font-mono">
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">منسوخ کریں</button>
        <button onclick="submitNewEmployee()" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg shadow">محفوظ کریں</button>
      </div>
    </div>
  `;

  showModal(content);
}

async function submitNewEmployee() {
  const payload = {
    emp_code: document.getElementById("emp-code").value,
    full_name: document.getElementById("emp-name").value,
    designation: document.getElementById("emp-desig").value,
    department: document.getElementById("emp-dept").value,
    employment_type: document.getElementById("emp-type").value,
    phone: document.getElementById("emp-phone").value,
    base_salary: 0.0,
    piece_rate_default: 5.0
  };

  if (!payload.full_name) {
    alert("براہ کرم ملازم کا نام درج کریں!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      await loadEmployees();
      switchHRTab("employees");
      alert("نیا ملازم کامیابی سے شامل ہو گیا!");
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

// ----------------- 11. RBAC & USER CONTROLS -----------------

async function loadRolesAndUsers() {
  try {
    const [rolesRes, usersRes] = await Promise.all([
      fetch(`${API_BASE}/api/roles`),
      fetch(`${API_BASE}/api/users`)
    ]);
    const roles = await rolesRes.json();
    const users = await usersRes.json();

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
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
              ${u.role}
            </span>
          </td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------- HELPERS & CACHE LOADERS -----------------

async function loadArticles() {
  try {
    const res = await fetch(`${API_BASE}/api/articles`);
    articlesCache = await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function loadSuppliers() {
  try {
    const res = await fetch(`${API_BASE}/api/suppliers`);
    suppliersCache = await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function loadEmployees() {
  try {
    const res = await fetch(`${API_BASE}/api/employees`);
    employeesCache = await res.json();
  } catch (err) {
    console.error(err);
  }
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
          <td><strong>PO Reference:</strong> ${grn.po_number}</td>
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
