import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend import models

# --- USERS & ROLES ---
def get_roles(db: Session):
    return db.query(models.Role).all()

def get_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, data: dict):
    user = models.User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# --- SUPPLIERS ---
def get_suppliers(db: Session):
    return db.query(models.Supplier).all()

def create_supplier(db: Session, data: dict):
    supplier = models.Supplier(**data)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

# --- RAW MATERIALS & INVENTORY ---
def get_raw_materials(db: Session, category: str = None):
    query = db.query(models.RawMaterial)
    if category:
        query = query.filter(models.RawMaterial.category == category)
    return query.all()

def create_raw_material(db: Session, data: dict):
    material = models.RawMaterial(**data)
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

# --- PURCHASE ORDERS ---
def get_purchase_orders(db: Session):
    return db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.id.desc()).all()

def create_purchase_order(db: Session, po_data: dict, items: list):
    po = models.PurchaseOrder(
        po_number=po_data["po_number"],
        supplier_id=po_data["supplier_id"],
        expected_date=po_data.get("expected_date"),
        notes=po_data.get("notes"),
        status="Pending"
    )
    total = 0.0
    db.add(po)
    db.flush()

    for item in items:
        qty = float(item["quantity"])
        price = float(item["unit_price"])
        total += (qty * price)
        po_item = models.PurchaseOrderItem(
            po_id=po.id,
            material_id=item["material_id"],
            quantity=qty,
            unit_price=price,
            received_quantity=0.0
        )
        db.add(po_item)

    po.total_amount = total
    db.commit()
    db.refresh(po)
    return po

# --- GRN & DELIVERY CHALLANS ---
def get_grns(db: Session):
    return db.query(models.GRN).order_by(models.GRN.id.desc()).all()

def create_grn(db: Session, grn_data: dict, items: list):
    grn = models.GRN(
        grn_number=grn_data["grn_number"],
        po_id=grn_data.get("po_id"),
        supplier_id=grn_data["supplier_id"],
        delivery_challan_no=grn_data["delivery_challan_no"],
        received_by=grn_data["received_by"],
        remarks=grn_data.get("remarks")
    )
    db.add(grn)
    db.flush()

    for item in items:
        rec_qty = float(item.get("received_qty", 0))
        rej_qty = float(item.get("rejected_qty", 0))
        acc_qty = float(item.get("accepted_qty", rec_qty - rej_qty))
        price = float(item.get("unit_price", 0))

        grn_item = models.GRNItem(
            grn_id=grn.id,
            material_id=item["material_id"],
            received_qty=rec_qty,
            rejected_qty=rej_qty,
            accepted_qty=acc_qty,
            unit_price=price
        )
        db.add(grn_item)

        # AUTOMATICALLY UPDATE RAW MATERIAL INVENTORY STORE!
        material = db.query(models.RawMaterial).filter(models.RawMaterial.id == item["material_id"]).first()
        if material:
            material.current_stock += acc_qty
            if price > 0:
                material.unit_price = price

        # If linked to PO, update PO received qty
        if grn.po_id:
            po_item = db.query(models.PurchaseOrderItem).filter(
                models.PurchaseOrderItem.po_id == grn.po_id,
                models.PurchaseOrderItem.material_id == item["material_id"]
            ).first()
            if po_item:
                po_item.received_quantity += acc_qty

    db.commit()
    db.refresh(grn)
    return grn

# --- ARTICLES & SAMPLING RECIPES ---
def get_articles(db: Session):
    return db.query(models.Article).all()

def create_article(db: Session, data: dict):
    article = models.Article(**data)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

def get_sampling_recipes(db: Session, article_id: int = None):
    query = db.query(models.SamplingRecipe)
    if article_id:
        query = query.filter(models.SamplingRecipe.article_id == article_id)
    return query.all()

def create_sampling_recipe(db: Session, recipe_data: dict, items: list):
    recipe = models.SamplingRecipe(
        article_id=recipe_data["article_id"],
        recipe_name=recipe_data["recipe_name"],
        version=recipe_data.get("version", "v1.0"),
        notes=recipe_data.get("notes"),
        is_active=True
    )
    db.add(recipe)
    db.flush()

    for it in items:
        item = models.RecipeItem(
            recipe_id=recipe.id,
            material_id=it["material_id"],
            component_type=it.get("component_type", "Child Part"),
            qty_per_unit=float(it["qty_per_unit"]),
            unit=it.get("unit", "Piece"),
            notes=it.get("notes")
        )
        db.add(item)

    db.commit()
    db.refresh(recipe)
    return recipe

def get_active_recipe_for_article(db: Session, article_id: int):
    return db.query(models.SamplingRecipe).filter(
        models.SamplingRecipe.article_id == article_id,
        models.SamplingRecipe.is_active == True
    ).order_by(models.SamplingRecipe.id.desc()).first()

# --- BILL OF MATERIALS (BOM) ---
def calculate_bom_preview(db: Session, article_id: int, planned_quantity: float):
    """
    User selects Article from sampling -> Recipe auto loads -> Enter quantity (e.g. 200)
    Auto calculates required components, compares with store stock, flags shortages.
    """
    recipe = get_active_recipe_for_article(db, article_id)
    if not recipe:
        return {"error": "No active sampling recipe found for this article"}

    article = db.query(models.Article).filter(models.Article.id == article_id).first()

    calculated_items = []
    has_shortage = False

    for item in recipe.items:
        material = item.material
        req_qty = float(item.qty_per_unit) * float(planned_quantity)
        available = float(material.current_stock) if material else 0.0
        shortage = max(0.0, req_qty - available)
        if shortage > 0:
            has_shortage = True

        calculated_items.append({
            "material_id": item.material_id,
            "material_code": material.code if material else "",
            "material_name": material.name if material else "",
            "component_type": item.component_type, # Child Part, Raw Metal, Packaging Bag (تھیلی), Sticker, Logo
            "qty_per_unit": item.qty_per_unit,
            "required_qty": round(req_qty, 2),
            "available_stock": round(available, 2),
            "shortage_qty": round(shortage, 2),
            "unit": item.unit,
            "status": "Available" if shortage == 0 else "Shortage"
        })

    return {
        "article_id": article_id,
        "article_name": article.name if article else "",
        "article_code": article.code if hasattr(article, 'code') else article.article_code,
        "recipe_id": recipe.id,
        "recipe_name": recipe.recipe_name,
        "planned_quantity": planned_quantity,
        "has_shortage": has_shortage,
        "items": calculated_items
    }

def create_bom(db: Session, bom_data: dict, items: list):
    bom = models.BOM(
        bom_number=bom_data["bom_number"],
        article_id=bom_data["article_id"],
        recipe_id=bom_data["recipe_id"],
        planned_quantity=float(bom_data["planned_quantity"]),
        status="Approved",
        created_by=bom_data.get("created_by", "Production Manager")
    )
    db.add(bom)
    db.flush()

    for it in items:
        bom_item = models.BOMItem(
            bom_id=bom.id,
            material_id=it["material_id"],
            component_type=it.get("component_type", "Material"),
            required_qty=float(it["required_qty"]),
            available_stock=float(it["available_stock"]),
            shortage_qty=float(it.get("shortage_qty", 0.0)),
            unit=it.get("unit", "Piece")
        )
        db.add(bom_item)

    db.commit()
    db.refresh(bom)
    return bom

def get_boms(db: Session):
    return db.query(models.BOM).order_by(models.BOM.id.desc()).all()

# --- WORK ORDERS & MULTI-STEP PRODUCTION ---
def create_work_order_from_bom(db: Session, bom_id: int, wo_data: dict, steps: list = None):
    bom = db.query(models.BOM).filter(models.BOM.id == bom_id).first()
    if not bom:
        raise ValueError("BOM not found")

    wo = models.WorkOrder(
        wo_number=wo_data["wo_number"],
        bom_id=bom.id,
        article_id=bom.article_id,
        target_quantity=bom.planned_quantity,
        produced_quantity=0.0,
        status="In Progress",
        notes=wo_data.get("notes")
    )
    db.add(wo)
    db.flush()

    # Default multi-step process for auto parts if not custom provided:
    # Step 1: Cutting / Stamping
    # Step 2: Sub-Assembly / Child Parts Fitting
    # Step 3: Welding / Fastening / Riveting
    # Step 4: Quality Inspection & Finishing
    # Step 5: Final Packaging (Theli, Sticker, Logo)
    default_steps = [
        {"step_number": 1, "step_name": "Step 1: Stamping & Cutting (پریسنگ / کٹنگ)", "piece_rate": 2.5},
        {"step_number": 2, "step_name": "Step 2: Sub-Assembly & Child Parts (چھوٹے پرزوں کی فٹنگ)", "piece_rate": 4.0},
        {"step_number": 3, "step_name": "Step 3: Riveting / Welding / Fastening (ریوٹنگ / ویلڈنگ)", "piece_rate": 3.5},
        {"step_number": 4, "step_name": "Step 4: Quality Check & Surface Polish (کوالٹی چیک و پالش)", "piece_rate": 1.5},
        {"step_number": 5, "step_name": "Step 5: Final Packing (تھیلی، سٹیکر اور لوگو پیکنگ)", "piece_rate": 2.0},
    ]

    steps_to_use = steps if steps else default_steps
    for s in steps_to_use:
        step = models.ProductionStep(
            wo_id=wo.id,
            step_number=s["step_number"],
            step_name=s["step_name"],
            description=s.get("description", ""),
            required_pieces=wo.target_quantity,
            completed_pieces=0.0,
            piece_rate=float(s.get("piece_rate", 0.0)),
            status="Pending"
        )
        db.add(step)

    bom.status = "ConvertedToWorkOrder"
    db.commit()
    db.refresh(wo)
    return wo

def get_work_orders(db: Session):
    return db.query(models.WorkOrder).order_by(models.WorkOrder.id.desc()).all()

def update_production_step(db: Session, step_id: int, completed_add: float, worker_id: int = None, date_str: str = None):
    step = db.query(models.ProductionStep).filter(models.ProductionStep.id == step_id).first()
    if not step:
        return None

    step.completed_pieces += completed_add
    if step.completed_pieces >= step.required_pieces:
        step.status = "Completed"
    else:
        step.status = "In Progress"

    if worker_id:
        step.assigned_worker_id = worker_id
        # Log to PieceWorkRecord for HR / Payroll!
        worker = db.query(models.Employee).filter(models.Employee.id == worker_id).first()
        earning = completed_add * step.piece_rate
        today = date_str or datetime.date.today().strftime("%Y-%m-%d")
        
        piece_rec = models.PieceWorkRecord(
            employee_id=worker_id,
            wo_id=step.wo_id,
            step_name=step.step_name,
            article_name=step.work_order.article.name if step.work_order and step.work_order.article else "Auto Part",
            date=today,
            pieces_completed=completed_add,
            rate_per_piece=step.piece_rate,
            total_earning=earning,
            approved_by="Supervisor"
        )
        db.add(piece_rec)

    # Check overall WO status
    wo = step.work_order
    all_steps = wo.steps
    all_completed = all(s.status == "Completed" for s in all_steps)
    if all_completed:
        wo.status = "Completed"
        wo.produced_quantity = wo.target_quantity
        # Deduct raw materials from RawStore based on BOM!
        if wo.bom:
            for b_item in wo.bom.items:
                mat = db.query(models.RawMaterial).filter(models.RawMaterial.id == b_item.material_id).first()
                if mat:
                    mat.current_stock = max(0.0, mat.current_stock - b_item.required_qty)

        # Add to Finished Goods automatically!
        batch_no = f"BATCH-{wo.wo_number}-{datetime.date.today().strftime('%m%d')}"
        fg = models.FinishedGood(
            article_id=wo.article_id,
            batch_number=batch_no,
            quantity=wo.produced_quantity,
            packaging_status="Packed with Theli, Sticker & Logo",
            qc_passed=True,
            storage_location="FG-Store-Main"
        )
        db.add(fg)

    db.commit()
    db.refresh(step)
    return step

# --- FINISHED GOODS & DISPATCH ---
def get_finished_goods(db: Session):
    return db.query(models.FinishedGood).order_by(models.FinishedGood.id.desc()).all()

def get_dispatch_challans(db: Session):
    return db.query(models.DispatchChallan).order_by(models.DispatchChallan.id.desc()).all()

def create_dispatch_challan(db: Session, challan_data: dict, items: list):
    challan = models.DispatchChallan(
        challan_number=challan_data["challan_number"],
        destination_type=challan_data["destination_type"], # External Factory, Customer Warehouse
        destination_name=challan_data["destination_name"],
        vehicle_no=challan_data["vehicle_no"],
        driver_name=challan_data["driver_name"],
        driver_phone=challan_data.get("driver_phone"),
        gate_pass_no=challan_data["gate_pass_no"],
        status="Dispatched",
        notes=challan_data.get("notes")
    )
    db.add(challan)
    db.flush()

    for it in items:
        qty = float(it["quantity"])
        disp_item = models.DispatchItem(
            challan_id=challan.id,
            article_id=it["article_id"],
            quantity=qty,
            batch_number=it.get("batch_number")
        )
        db.add(disp_item)

        # Deduct from Finished Goods stock
        fg = db.query(models.FinishedGood).filter(models.FinishedGood.article_id == it["article_id"]).first()
        if fg:
            fg.quantity = max(0.0, fg.quantity - qty)

    db.commit()
    db.refresh(challan)
    return challan

# --- HR & PAYROLL ---
def get_employees(db: Session):
    return db.query(models.Employee).all()

def create_employee(db: Session, data: dict):
    emp = models.Employee(**data)
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

def get_attendances(db: Session, date_str: str = None):
    query = db.query(models.Attendance)
    if date_str:
        query = query.filter(models.Attendance.date == date_str)
    return query.all()

def log_attendance(db: Session, data: dict):
    # Check if attendance already exists for this employee and date
    att = db.query(models.Attendance).filter(
        models.Attendance.employee_id == data["employee_id"],
        models.Attendance.date == data["date"]
    ).first()

    if att:
        att.status = data.get("status", att.status)
        att.check_in = data.get("check_in", att.check_in)
        att.check_out = data.get("check_out", att.check_out)
        att.overtime_hours = float(data.get("overtime_hours", att.overtime_hours))
        att.remarks = data.get("remarks", att.remarks)
    else:
        att = models.Attendance(**data)
        db.add(att)

    db.commit()
    db.refresh(att)
    return att

def get_piece_works(db: Session, employee_id: int = None, date_str: str = None):
    query = db.query(models.PieceWorkRecord)
    if employee_id:
        query = query.filter(models.PieceWorkRecord.employee_id == employee_id)
    if date_str:
        query = query.filter(models.PieceWorkRecord.date == date_str)
    return query.order_by(models.PieceWorkRecord.id.desc()).all()

def log_piece_work(db: Session, data: dict):
    rec = models.PieceWorkRecord(**data)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def get_leaves(db: Session, employee_id: int = None):
    query = db.query(models.Leave)
    if employee_id:
        query = query.filter(models.Leave.employee_id == employee_id)
    return query.order_by(models.Leave.id.desc()).all()

def apply_leave(db: Session, data: dict):
    leave = models.Leave(**data)
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

def update_leave_status(db: Session, leave_id: int, status: str):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if leave:
        leave.status = status
        db.commit()
        db.refresh(leave)
    return leave

# --- DASHBOARD SUMMARY ---
def get_dashboard_stats(db: Session):
    today = datetime.date.today().strftime("%Y-%m-%d")
    raw_materials_count = db.query(models.RawMaterial).count()
    low_stock_count = db.query(models.RawMaterial).filter(models.RawMaterial.current_stock <= models.RawMaterial.min_alert_level).count()
    active_wo_count = db.query(models.WorkOrder).filter(models.WorkOrder.status.in_(["In Progress", "Planned"])).count()
    fg_total_qty = db.query(func.sum(models.FinishedGood.quantity)).scalar() or 0.0
    today_present_count = db.query(models.Attendance).filter(models.Attendance.date == today, models.Attendance.status == "Present").count()
    total_employees = db.query(models.Employee).filter(models.Employee.is_active == True).count()
    recent_work_orders = db.query(models.WorkOrder).order_by(models.WorkOrder.id.desc()).limit(5).all()

    return {
        "raw_materials_count": raw_materials_count,
        "low_stock_count": low_stock_count,
        "active_work_orders": active_wo_count,
        "finished_goods_qty": round(fg_total_qty, 1),
        "today_present_count": today_present_count,
        "total_employees": total_employees,
        "today_date": today
    }
