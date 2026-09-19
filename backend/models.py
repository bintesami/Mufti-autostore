import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True) # Admin, Storekeeper, Production, HR, Dispatch
    description = Column(String(200))
    permissions = Column(Text, default="*") # JSON or comma-separated permissions

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password_hash = Column(String(100), default="123456")
    full_name = Column(String(100))
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    role = relationship("Role", back_populates="users")

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    contact_person = Column(String(100))
    phone = Column(String(30))
    email = Column(String(100), nullable=True)
    address = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class RawMaterial(Base):
    __tablename__ = "raw_materials"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(150), index=True)
    category = Column(String(50)) # Raw Metal, Child Part, Sub-Assembly, Packaging Bag, Sticker, Logo/Branding, Fastener
    unit = Column(String(20)) # Pieces, KG, Grams, Rolls, Packets, Meters
    current_stock = Column(Float, default=0.0)
    min_alert_level = Column(Float, default=10.0)
    unit_price = Column(Float, default=0.0)
    location = Column(String(50), default="Rack-A1")
    description = Column(String(250), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    po_items = relationship("PurchaseOrderItem", back_populates="material")
    grn_items = relationship("GRNItem", back_populates="material")
    recipe_items = relationship("RecipeItem", back_populates="material")
    bom_items = relationship("BOMItem", back_populates="material")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    expected_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="Pending") # Pending, Partially Received, Completed, Cancelled
    total_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    grns = relationship("GRN", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    material_id = Column(Integer, ForeignKey("raw_materials.id"))
    quantity = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    received_quantity = Column(Float, default=0.0)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    material = relationship("RawMaterial", back_populates="po_items")

class GRN(Base):
    __tablename__ = "grns"
    id = Column(Integer, primary_key=True, index=True)
    grn_number = Column(String(50), unique=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    delivery_challan_no = Column(String(50)) # Supplier Delivery Challan / Bilty No
    receiving_date = Column(DateTime, default=datetime.datetime.utcnow)
    received_by = Column(String(100))
    remarks = Column(Text, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="grns")
    items = relationship("GRNItem", back_populates="grn", cascade="all, delete-orphan")

class GRNItem(Base):
    __tablename__ = "grn_items"
    id = Column(Integer, primary_key=True, index=True)
    grn_id = Column(Integer, ForeignKey("grns.id"))
    material_id = Column(Integer, ForeignKey("raw_materials.id"))
    received_qty = Column(Float, default=0.0)
    rejected_qty = Column(Float, default=0.0)
    accepted_qty = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)

    grn = relationship("GRN", back_populates="items")
    material = relationship("RawMaterial", back_populates="grn_items")

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    article_code = Column(String(50), unique=True, index=True)
    name = Column(String(150), index=True) # e.g. Motorcycle Brake Shoe CD70, Side Mirror Assembly
    category = Column(String(50)) # Brakes, Engine Parts, Body Parts, Electrical
    vehicle_model = Column(String(100)) # e.g. Honda CD70, Toyota Corolla, Universal
    unit = Column(String(20), default="Piece")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recipes = relationship("SamplingRecipe", back_populates="article")
    boms = relationship("BOM", back_populates="article")
    work_orders = relationship("WorkOrder", back_populates="article")
    finished_goods = relationship("FinishedGood", back_populates="article")
    dispatch_items = relationship("DispatchItem", back_populates="article")

class SamplingRecipe(Base):
    __tablename__ = "sampling_recipes"
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"))
    recipe_name = Column(String(150))
    version = Column(String(20), default="v1.0")
    notes = Column(Text, nullable=True) # Specifications, master sample notes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="recipes")
    items = relationship("RecipeItem", back_populates="recipe", cascade="all, delete-orphan")
    boms = relationship("BOM", back_populates="recipe")

class RecipeItem(Base):
    __tablename__ = "recipe_items"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("sampling_recipes.id"))
    material_id = Column(Integer, ForeignKey("raw_materials.id"))
    component_type = Column(String(50)) # Raw Metal, Child Part, Packaging Bag (تھیلی), Sticker (سٹیکر), Logo (لوگو), Fastener
    qty_per_unit = Column(Float, default=1.0) # Quantity needed to produce 1 finished unit
    unit = Column(String(20))
    notes = Column(String(150), nullable=True)

    recipe = relationship("SamplingRecipe", back_populates="items")
    material = relationship("RawMaterial", back_populates="recipe_items")

class BOM(Base):
    __tablename__ = "boms"
    id = Column(Integer, primary_key=True, index=True)
    bom_number = Column(String(50), unique=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"))
    recipe_id = Column(Integer, ForeignKey("sampling_recipes.id"))
    planned_quantity = Column(Float, default=1.0) # e.g. 200 Pieces
    status = Column(String(30), default="Calculated") # Calculated, Approved, ConvertedToWorkOrder
    created_by = Column(String(100), default="Production Manager")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="boms")
    recipe = relationship("SamplingRecipe", back_populates="boms")
    items = relationship("BOMItem", back_populates="bom", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="bom")

class BOMItem(Base):
    __tablename__ = "bom_items"
    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey("boms.id"))
    material_id = Column(Integer, ForeignKey("raw_materials.id"))
    component_type = Column(String(50))
    required_qty = Column(Float, default=0.0) # planned_quantity * qty_per_unit
    available_stock = Column(Float, default=0.0) # current stock at time of BOM calculation
    shortage_qty = Column(Float, default=0.0) # max(0, required - available)
    unit = Column(String(20))

    bom = relationship("BOM", back_populates="items")
    material = relationship("RawMaterial", back_populates="bom_items")

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id = Column(Integer, primary_key=True, index=True)
    wo_number = Column(String(50), unique=True, index=True)
    bom_id = Column(Integer, ForeignKey("boms.id"))
    article_id = Column(Integer, ForeignKey("articles.id"))
    target_quantity = Column(Float, default=0.0)
    produced_quantity = Column(Float, default=0.0)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    current_step = Column(String(100), default="Step 1: Stamping & Cutting")
    status = Column(String(30), default="In Progress") # Planned, In Progress, Ready for Packing, Completed
    notes = Column(Text, nullable=True)

    bom = relationship("BOM", back_populates="work_orders")
    article = relationship("Article", back_populates="work_orders")
    steps = relationship("ProductionStep", back_populates="work_order", cascade="all, delete-orphan")

class ProductionStep(Base):
    __tablename__ = "production_steps"
    id = Column(Integer, primary_key=True, index=True)
    wo_id = Column(Integer, ForeignKey("work_orders.id"))
    step_number = Column(Integer, default=1)
    step_name = Column(String(100)) # e.g. Step 1: Cutting, Step 2: Child Parts Assembly, Step 3: Welding, Step 4: Final Packing
    description = Column(String(200), nullable=True)
    required_pieces = Column(Float, default=0.0)
    completed_pieces = Column(Float, default=0.0)
    assigned_worker_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    piece_rate = Column(Float, default=0.0) # ٹھیکہ ریٹ فی پیس
    status = Column(String(30), default="Pending") # Pending, In Progress, Completed

    work_order = relationship("WorkOrder", back_populates="steps")
    assigned_worker = relationship("Employee", foreign_keys=[assigned_worker_id])

class FinishedGood(Base):
    __tablename__ = "finished_goods"
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"))
    batch_number = Column(String(50), index=True)
    quantity = Column(Float, default=0.0)
    packaging_status = Column(String(100), default="Packed with Theli, Sticker & Logo")
    qc_passed = Column(Boolean, default=True)
    storage_location = Column(String(50), default="FG-Warehouse-Row1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="finished_goods")

class DispatchChallan(Base):
    __tablename__ = "dispatch_challans"
    id = Column(Integer, primary_key=True, index=True)
    challan_number = Column(String(50), unique=True, index=True)
    destination_type = Column(String(50)) # External Factory, Customer Warehouse, Retailer
    destination_name = Column(String(150))
    dispatch_date = Column(DateTime, default=datetime.datetime.utcnow)
    vehicle_no = Column(String(50))
    driver_name = Column(String(100))
    driver_phone = Column(String(30), nullable=True)
    gate_pass_no = Column(String(50))
    status = Column(String(30), default="Dispatched") # Prepared, Dispatched, Delivered
    notes = Column(Text, nullable=True)

    items = relationship("DispatchItem", back_populates="challan", cascade="all, delete-orphan")

class DispatchItem(Base):
    __tablename__ = "dispatch_items"
    id = Column(Integer, primary_key=True, index=True)
    challan_id = Column(Integer, ForeignKey("dispatch_challans.id"))
    article_id = Column(Integer, ForeignKey("articles.id"))
    quantity = Column(Float, default=0.0)
    batch_number = Column(String(50), nullable=True)

    challan = relationship("DispatchChallan", back_populates="items")
    article = relationship("Article", back_populates="dispatch_items")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(30), unique=True, index=True)
    full_name = Column(String(100), index=True)
    designation = Column(String(100))
    department = Column(String(50)) # Production, Raw Store, FG Store, HR, QC, Packaging
    phone = Column(String(30))
    join_date = Column(DateTime, default=datetime.datetime.utcnow)
    employment_type = Column(String(50), default="Piece-Rate") # Salaried, Piece-Rate (ٹھیکہ), Daily-Wager
    base_salary = Column(Float, default=0.0)
    piece_rate_default = Column(Float, default=0.0) # Default Rs. per piece
    is_active = Column(Boolean, default=True)

    attendances = relationship("Attendance", back_populates="employee")
    piece_works = relationship("PieceWorkRecord", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(String(20), index=True) # YYYY-MM-DD
    status = Column(String(20), default="Present") # Present, Absent, Leave, Half-Day
    check_in = Column(String(20), nullable=True) # e.g. 08:00 AM
    check_out = Column(String(20), nullable=True) # e.g. 05:00 PM
    overtime_hours = Column(Float, default=0.0) # اوور ٹائم گھنٹے
    remarks = Column(String(150), nullable=True)

    employee = relationship("Employee", back_populates="attendances")

class PieceWorkRecord(Base):
    __tablename__ = "piece_work_records"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    wo_id = Column(Integer, ForeignKey("work_orders.id"), nullable=True)
    step_name = Column(String(100)) # مثلاً: ہینڈل فٹنگ، تھیلی پیکنگ، سٹیکر پیسٹنگ
    article_name = Column(String(150))
    date = Column(String(20), index=True) # YYYY-MM-DD
    pieces_completed = Column(Float, default=0.0) # کتنے پیس مکمل کیے
    rate_per_piece = Column(Float, default=0.0) # فی پیس ریٹ
    total_earning = Column(Float, default=0.0) # pieces * rate
    approved_by = Column(String(100), default="Production Supervisor")
    notes = Column(String(150), nullable=True)

    employee = relationship("Employee", back_populates="piece_works")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String(30)) # Casual (اتفاقی), Sick (بیماری), Annual (سالانہ)
    start_date = Column(String(20)) # YYYY-MM-DD
    end_date = Column(String(20)) # YYYY-MM-DD
    total_days = Column(Integer, default=1)
    reason = Column(Text)
    status = Column(String(20), default="Pending") # Pending, Approved, Rejected
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee", back_populates="leaves")
