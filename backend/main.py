import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from backend.database import engine, Base, get_db
from backend import models, crud
from backend.seed_data import seed_database

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# Seed database with initial realistic auto parts data
with next(get_db()) as db_session:
    seed_database(db_session)

app = FastAPI(title="Mufti Auto Store - Production ERP API", version="1.0.0")

# Enable CORS for easy local access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class UserCreate(BaseModel):
    username: str
    password_hash: Optional[str] = "123456"
    full_name: str
    role_id: int

class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class RawMaterialCreate(BaseModel):
    code: str
    name: str
    category: str
    unit: str
    current_stock: float = 0.0
    min_alert_level: float = 10.0
    unit_price: float = 0.0
    location: Optional[str] = "Rack-A1"
    description: Optional[str] = None

class POItemSchema(BaseModel):
    material_id: int
    quantity: float
    unit_price: float

class POCreate(BaseModel):
    po_number: str
    supplier_id: int
    expected_date: Optional[str] = None
    notes: Optional[str] = None
    items: List[POItemSchema]

class GRNItemSchema(BaseModel):
    material_id: int
    received_qty: float
    rejected_qty: float = 0.0
    accepted_qty: float
    unit_price: float = 0.0

class GRNCreate(BaseModel):
    grn_number: str
    po_id: Optional[int] = None
    supplier_id: int
    delivery_challan_no: str
    received_by: str
    remarks: Optional[str] = None
    items: List[GRNItemSchema]

class ArticleCreate(BaseModel):
    article_code: str
    name: str
    category: str
    vehicle_model: str
    unit: str = "Piece"
    description: Optional[str] = None

class RecipeItemSchema(BaseModel):
    material_id: int
    component_type: str
    qty_per_unit: float
    unit: str
    notes: Optional[str] = None

class RecipeCreate(BaseModel):
    article_id: int
    recipe_name: str
    version: Optional[str] = "v1.0"
    notes: Optional[str] = None
    items: List[RecipeItemSchema]

class BOMCreate(BaseModel):
    bom_number: str
    article_id: int
    recipe_id: int
    planned_quantity: float
    created_by: Optional[str] = "Production Manager"
    items: List[dict]

class WorkOrderCreate(BaseModel):
    bom_id: int
    wo_number: str
    notes: Optional[str] = None
    steps: Optional[List[dict]] = None

class StepUpdate(BaseModel):
    step_id: int
    completed_add: float
    worker_id: Optional[int] = None
    date: Optional[str] = None

class DispatchItemSchema(BaseModel):
    article_id: int
    quantity: float
    batch_number: Optional[str] = None

class DispatchCreate(BaseModel):
    challan_number: str
    destination_type: str
    destination_name: str
    vehicle_no: str
    driver_name: str
    driver_phone: Optional[str] = None
    gate_pass_no: str
    notes: Optional[str] = None
    items: List[DispatchItemSchema]

class EmployeeCreate(BaseModel):
    emp_code: str
    full_name: str
    designation: str
    department: str
    phone: str
    employment_type: str = "Piece-Rate"
    base_salary: float = 0.0
    piece_rate_default: float = 0.0

class AttendanceLog(BaseModel):
    employee_id: int
    date: str
    status: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    overtime_hours: float = 0.0
    remarks: Optional[str] = None

class PieceWorkCreate(BaseModel):
    employee_id: int
    wo_id: Optional[int] = None
    step_name: str
    article_name: str
    date: str
    pieces_completed: float
    rate_per_piece: float
    notes: Optional[str] = None

class LeaveApply(BaseModel):
    employee_id: int
    leave_type: str
    start_date: str
    end_date: str
    total_days: int
    reason: str

# ----------------- API ROUTES -----------------

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

@app.get("/api/roles")
def list_roles(db: Session = Depends(get_db)):
    return crud.get_roles(db)

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    users = crud.get_users(db)
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.name if u.role else None,
            "permissions": u.role.permissions if u.role else "*",
            "is_active": u.is_active
        }
        for u in users
    ]

@app.post("/api/users")
def add_user(data: UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, data.dict())

@app.get("/api/suppliers")
def list_suppliers(db: Session = Depends(get_db)):
    return crud.get_suppliers(db)

@app.post("/api/suppliers")
def add_supplier(data: SupplierCreate, db: Session = Depends(get_db)):
    return crud.create_supplier(db, data.dict())

@app.get("/api/raw-materials")
def list_raw_materials(category: Optional[str] = None, db: Session = Depends(get_db)):
    materials = crud.get_raw_materials(db, category)
    return [
        {
            "id": m.id,
            "code": m.code,
            "name": m.name,
            "category": m.category,
            "unit": m.unit,
            "current_stock": m.current_stock,
            "min_alert_level": m.min_alert_level,
            "unit_price": m.unit_price,
            "location": m.location,
            "is_low_stock": m.current_stock <= m.min_alert_level
        }
        for m in materials
    ]

@app.post("/api/raw-materials")
def add_raw_material(data: RawMaterialCreate, db: Session = Depends(get_db)):
    return crud.create_raw_material(db, data.dict())

@app.get("/api/purchase-orders")
def list_purchase_orders(db: Session = Depends(get_db)):
    pos = crud.get_purchase_orders(db)
    result = []
    for po in pos:
        result.append({
            "id": po.id,
            "po_number": po.po_number,
            "supplier_name": po.supplier.name if po.supplier else "",
            "order_date": po.order_date.strftime("%Y-%m-%d"),
            "expected_date": po.expected_date.strftime("%Y-%m-%d") if po.expected_date else None,
            "status": po.status,
            "total_amount": po.total_amount,
            "items_count": len(po.items),
            "items": [
                {
                    "material_name": it.material.name if it.material else "",
                    "material_code": it.material.code if it.material else "",
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "received_quantity": it.received_quantity
                }
                for it in po.items
            ]
        })
    return result

@app.post("/api/purchase-orders")
def add_purchase_order(data: POCreate, db: Session = Depends(get_db)):
    po_data = data.dict()
    items = po_data.pop("items")
    return crud.create_purchase_order(db, po_data, items)

@app.get("/api/grns")
def list_grns(db: Session = Depends(get_db)):
    grns = crud.get_grns(db)
    result = []
    for g in grns:
        result.append({
            "id": g.id,
            "grn_number": g.grn_number,
            "supplier_name": g.purchase_order.supplier.name if (g.purchase_order and g.purchase_order.supplier) else "Direct Supplier",
            "po_number": g.purchase_order.po_number if g.purchase_order else "N/A",
            "delivery_challan_no": g.delivery_challan_no,
            "receiving_date": g.receiving_date.strftime("%Y-%m-%d"),
            "received_by": g.received_by,
            "remarks": g.remarks,
            "items": [
                {
                    "material_name": it.material.name if it.material else "",
                    "received_qty": it.received_qty,
                    "accepted_qty": it.accepted_qty,
                    "unit": it.material.unit if it.material else ""
                }
                for it in g.items
            ]
        })
    return result

@app.post("/api/grns")
def add_grn(data: GRNCreate, db: Session = Depends(get_db)):
    grn_data = data.dict()
    items = grn_data.pop("items")
    return crud.create_grn(db, grn_data, items)

@app.get("/api/articles")
def list_articles(db: Session = Depends(get_db)):
    articles = crud.get_articles(db)
    return [
        {
            "id": a.id,
            "article_code": a.article_code,
            "name": a.name,
            "category": a.category,
            "vehicle_model": a.vehicle_model,
            "unit": a.unit,
            "description": a.description,
            "has_recipe": len(a.recipes) > 0
        }
        for a in articles
    ]

@app.post("/api/articles")
def add_article(data: ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db, data.dict())

@app.get("/api/sampling-recipes")
def list_sampling_recipes(article_id: Optional[int] = None, db: Session = Depends(get_db)):
    recipes = crud.get_sampling_recipes(db, article_id)
    result = []
    for r in recipes:
        result.append({
            "id": r.id,
            "recipe_name": r.recipe_name,
            "article_id": r.article_id,
            "article_name": r.article.name if r.article else "",
            "version": r.version,
            "notes": r.notes,
            "items": [
                {
                    "material_id": it.material_id,
                    "material_name": it.material.name if it.material else "",
                    "component_type": it.component_type,
                    "qty_per_unit": it.qty_per_unit,
                    "unit": it.unit,
                    "notes": it.notes
                }
                for it in r.items
            ]
        })
    return result

@app.post("/api/sampling-recipes")
def add_sampling_recipe(data: RecipeCreate, db: Session = Depends(get_db)):
    r_data = data.dict()
    items = r_data.pop("items")
    return crud.create_sampling_recipe(db, r_data, items)

# BOM CALCULATION ENDPOINT (Recipe auto-calculation for user quantity)
@app.get("/api/bom/calculate")
def calculate_bom(article_id: int = Query(...), planned_quantity: float = Query(200.0), db: Session = Depends(get_db)):
    res = crud.calculate_bom_preview(db, article_id, planned_quantity)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.get("/api/boms")
def list_boms(db: Session = Depends(get_db)):
    boms = crud.get_boms(db)
    result = []
    for b in boms:
        result.append({
            "id": b.id,
            "bom_number": b.bom_number,
            "article_name": b.article.name if b.article else "",
            "planned_quantity": b.planned_quantity,
            "status": b.status,
            "created_by": b.created_by,
            "created_at": b.created_at.strftime("%Y-%m-%d"),
            "items": [
                {
                    "material_name": it.material.name if it.material else "",
                    "component_type": it.component_type,
                    "required_qty": it.required_qty,
                    "available_stock": it.available_stock,
                    "shortage_qty": it.shortage_qty,
                    "unit": it.unit
                }
                for it in b.items
            ]
        })
    return result

@app.post("/api/boms")
def add_bom(data: BOMCreate, db: Session = Depends(get_db)):
    bom_data = data.dict()
    items = bom_data.pop("items")
    return crud.create_bom(db, bom_data, items)

@app.get("/api/work-orders")
def list_work_orders(db: Session = Depends(get_db)):
    wos = crud.get_work_orders(db)
    result = []
    for w in wos:
        result.append({
            "id": w.id,
            "wo_number": w.wo_number,
            "article_name": w.article.name if w.article else "",
            "target_quantity": w.target_quantity,
            "produced_quantity": w.produced_quantity,
            "status": w.status,
            "current_step": w.current_step,
            "start_date": w.start_date.strftime("%Y-%m-%d"),
            "steps": [
                {
                    "id": s.id,
                    "step_number": s.step_number,
                    "step_name": s.step_name,
                    "required_pieces": s.required_pieces,
                    "completed_pieces": s.completed_pieces,
                    "piece_rate": s.piece_rate,
                    "status": s.status,
                    "assigned_worker_name": s.assigned_worker.full_name if s.assigned_worker else "Unassigned"
                }
                for s in w.steps
            ]
        })
    return result

@app.post("/api/work-orders/from-bom")
def generate_work_order(data: WorkOrderCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_work_order_from_bom(db, data.bom_id, {"wo_number": data.wo_number, "notes": data.notes}, data.steps)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/work-orders/step-update")
def update_step(data: StepUpdate, db: Session = Depends(get_db)):
    step = crud.update_production_step(db, data.step_id, data.completed_add, data.worker_id, data.date)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"message": "Step updated successfully", "completed_pieces": step.completed_pieces, "status": step.status}

@app.get("/api/finished-goods")
def list_finished_goods(db: Session = Depends(get_db)):
    fgs = crud.get_finished_goods(db)
    return [
        {
            "id": f.id,
            "article_name": f.article.name if f.article else "",
            "article_code": f.article.article_code if f.article else "",
            "batch_number": f.batch_number,
            "quantity": f.quantity,
            "packaging_status": f.packaging_status,
            "qc_passed": f.qc_passed,
            "storage_location": f.storage_location,
            "created_at": f.created_at.strftime("%Y-%m-%d")
        }
        for f in fgs
    ]

@app.get("/api/dispatch-challans")
def list_dispatch_challans(db: Session = Depends(get_db)):
    challans = crud.get_dispatch_challans(db)
    result = []
    for c in challans:
        result.append({
            "id": c.id,
            "challan_number": c.challan_number,
            "destination_type": c.destination_type,
            "destination_name": c.destination_name,
            "dispatch_date": c.dispatch_date.strftime("%Y-%m-%d"),
            "vehicle_no": c.vehicle_no,
            "driver_name": c.driver_name,
            "gate_pass_no": c.gate_pass_no,
            "status": c.status,
            "items": [
                {
                    "article_name": it.article.name if it.article else "",
                    "quantity": it.quantity,
                    "batch_number": it.batch_number
                }
                for it in c.items
            ]
        })
    return result

@app.post("/api/dispatch-challans")
def add_dispatch_challan(data: DispatchCreate, db: Session = Depends(get_db)):
    ch_data = data.dict()
    items = ch_data.pop("items")
    return crud.create_dispatch_challan(db, ch_data, items)

@app.get("/api/employees")
def list_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@app.post("/api/employees")
def add_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, data.dict())

@app.get("/api/attendance")
def list_attendance(date: Optional[str] = None, db: Session = Depends(get_db)):
    atts = crud.get_attendances(db, date)
    return [
        {
            "id": a.id,
            "employee_id": a.employee_id,
            "employee_name": a.employee.full_name if a.employee else "",
            "emp_code": a.employee.emp_code if a.employee else "",
            "department": a.employee.department if a.employee else "",
            "date": a.date,
            "status": a.status,
            "check_in": a.check_in,
            "check_out": a.check_out,
            "overtime_hours": a.overtime_hours,
            "remarks": a.remarks
        }
        for a in atts
    ]

@app.post("/api/attendance")
def log_attendance(data: AttendanceLog, db: Session = Depends(get_db)):
    return crud.log_attendance(db, data.dict())

@app.get("/api/piece-works")
def list_piece_works(employee_id: Optional[int] = None, date: Optional[str] = None, db: Session = Depends(get_db)):
    pws = crud.get_piece_works(db, employee_id, date)
    return [
        {
            "id": p.id,
            "employee_name": p.employee.full_name if p.employee else "",
            "emp_code": p.employee.emp_code if p.employee else "",
            "step_name": p.step_name,
            "article_name": p.article_name,
            "date": p.date,
            "pieces_completed": p.pieces_completed,
            "rate_per_piece": p.rate_per_piece,
            "total_earning": p.total_earning,
            "approved_by": p.approved_by
        }
        for p in pws
    ]

@app.post("/api/piece-works")
def add_piece_work(data: PieceWorkCreate, db: Session = Depends(get_db)):
    rec_data = data.dict()
    rec_data["total_earning"] = rec_data["pieces_completed"] * rec_data["rate_per_piece"]
    return crud.log_piece_work(db, rec_data)

@app.get("/api/leaves")
def list_leaves(employee_id: Optional[int] = None, db: Session = Depends(get_db)):
    leaves = crud.get_leaves(db, employee_id)
    return [
        {
            "id": l.id,
            "employee_name": l.employee.full_name if l.employee else "",
            "leave_type": l.leave_type,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "total_days": l.total_days,
            "reason": l.reason,
            "status": l.status
        }
        for l in leaves
    ]

@app.post("/api/leaves")
def apply_leave(data: LeaveApply, db: Session = Depends(get_db)):
    return crud.apply_leave(db, data.dict())

@app.post("/api/leaves/{leave_id}/status")
def change_leave_status(leave_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    return crud.update_leave_status(db, leave_id, status)

# ----------------- SERVE FRONTEND STATIC FILES -----------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

@app.get("/")
def serve_home():
    root_index = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/app.js")
def serve_app_js():
    root_js = os.path.join(BASE_DIR, "app.js")
    if os.path.exists(root_js):
        return FileResponse(root_js)
    return FileResponse(os.path.join(FRONTEND_DIR, "app.js"))

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
