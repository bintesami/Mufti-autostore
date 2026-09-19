import datetime
from sqlalchemy.orm import Session
from backend import models

def seed_database(db: Session):
    # Check if already seeded
    if db.query(models.Role).first():
        return

    # 1. Roles & Permissions
    roles_data = [
        {"name": "Admin", "description": "مکمل سسٹم کنٹرول (Full System Access)", "permissions": "*"},
        {"name": "Storekeeper", "description": "را سٹور، پرچیز اور جی آر این کنٹرول", "permissions": "dashboard,po,grn,raw_store"},
        {"name": "Production", "description": "سیمپلنگ، بل آف مٹیریل (BOM) اور ورک آرڈر کنٹرول", "permissions": "dashboard,sampling,bom,work_orders,fg"},
        {"name": "HR", "description": "ملازمین، حاضری، اوور ٹائم، پر پیس ٹھیکہ اور چھٹیاں", "permissions": "dashboard,hr"},
        {"name": "Dispatch", "description": "فنش گڈز پیکنگ اور فیکٹری/گودام ڈسپیچ چالان", "permissions": "dashboard,fg,dispatch"}
    ]
    roles_map = {}
    for r in roles_data:
        role = models.Role(**r)
        db.add(role)
        db.flush()
        roles_map[r["name"]] = role.id

    # 2. Users
    users_data = [
        {"username": "admin", "full_name": "سسٹم ایڈمنسٹریٹر", "role_id": roles_map["Admin"]},
        {"username": "store_mgr", "full_name": "اصغر علی (سٹور انچارج)", "role_id": roles_map["Storekeeper"]},
        {"username": "prod_mgr", "full_name": "محمد راشد (پروڈکشن سپروائزر)", "role_id": roles_map["Production"]},
        {"username": "hr_mgr", "full_name": "شہزیب خان (ایچ آر آفیسر)", "role_id": roles_map["HR"]},
        {"username": "dispatch_mgr", "full_name": "طاہر محمود (ڈسپیچ آفیسر)", "role_id": roles_map["Dispatch"]},
    ]
    for u in users_data:
        user = models.User(username=u["username"], full_name=u["full_name"], role_id=u["role_id"], password_hash="123456")
        db.add(user)

    # 3. Suppliers
    suppliers_data = [
        {"name": "Pak Auto Casting Industries (Pvt) Ltd", "contact_person": "حاجی فاروق", "phone": "0300-1122334", "address": "بادامی باغ آٹو مارکیٹ، لاہور"},
        {"name": "National Friction Material Co.", "contact_person": "سلمان شیخ", "phone": "0321-4455667", "address": "سائٹ ایریا، کراچی"},
        {"name": "Standard Springs & Fasteners", "contact_person": "عرفان صاحب", "phone": "0333-7788990", "address": "گوجرانوالہ انڈسٹریل زون"},
        {"name": "Universal Poly Packaging & Bags", "contact_person": "کامران اکرم", "phone": "0345-6677889", "address": "اردو بازار، لاہور"},
        {"name": "Creative Printing & Hologram Labels", "contact_person": "وقاص بٹ", "phone": "0302-9988776", "address": "شاہ عالم مارکیٹ، لاہور"}
    ]
    suppliers_map = {}
    for s in suppliers_data:
        sup = models.Supplier(**s)
        db.add(sup)
        db.flush()
        suppliers_map[s["name"]] = sup.id

    # 4. Raw Materials (including Child Parts, Fasteners, Bags, Stickers, Logos)
    raw_materials_data = [
        {"code": "RM-ALU-01", "name": "Aluminum Alloy Ingot (ADC12)", "category": "Raw Metal", "unit": "KG", "current_stock": 650.0, "min_alert_level": 100.0, "unit_price": 750.0, "location": "Rack-A1"},
        {"code": "CP-BSC-02", "name": "Brake Shoe Core Castings (چائلڈ پارٹ - کور کاسٹنگ)", "category": "Child Part", "unit": "Pieces", "current_stock": 1500.0, "min_alert_level": 300.0, "unit_price": 95.0, "location": "Bin-B1"},
        {"code": "CP-BLS-03", "name": "Friction Brake Lining Strips (چائلڈ پارٹ - لائننگ پیڈ)", "category": "Child Part", "unit": "Pieces", "current_stock": 1800.0, "min_alert_level": 400.0, "unit_price": 45.0, "location": "Bin-B2"},
        {"code": "FST-TRS-04", "name": "Heavy Duty Tension Return Springs (سپرنگ)", "category": "Fastener", "unit": "Pieces", "current_stock": 2200.0, "min_alert_level": 500.0, "unit_price": 12.0, "location": "Bin-C1"},
        {"code": "FST-RIV-05", "name": "Solid Steel Rivets 4x10mm (ریوٹ)", "category": "Fastener", "unit": "Pieces", "current_stock": 10000.0, "min_alert_level": 2000.0, "unit_price": 2.5, "location": "Bin-C2"},
        {"code": "PKG-BAG-06", "name": "Branded Heavy Polybag 6x9 (تھیلی - Mufti Auto Store)", "category": "Packaging Bag", "unit": "Pieces", "current_stock": 3500.0, "min_alert_level": 500.0, "unit_price": 4.0, "location": "Shelf-P1"},
        {"code": "STK-BAR-07", "name": "Barcode & Part Spec Sticker (سٹیکر)", "category": "Sticker", "unit": "Pieces", "current_stock": 4000.0, "min_alert_level": 600.0, "unit_price": 1.5, "location": "Shelf-P2"},
        {"code": "LGO-HLG-08", "name": "Mufti Auto Store Hologram Verification Logo (لوگو)", "category": "Logo/Branding", "unit": "Pieces", "current_stock": 3000.0, "min_alert_level": 500.0, "unit_price": 3.0, "location": "Shelf-P3"},
        {"code": "PKG-BOX-09", "name": "Master Outer Carton Box (50 Pcs Capacity)", "category": "Packaging Bag", "unit": "Pieces", "current_stock": 250.0, "min_alert_level": 50.0, "unit_price": 65.0, "location": "Zone-D"}
    ]
    materials_map = {}
    for rm in raw_materials_data:
        mat = models.RawMaterial(**rm)
        db.add(mat)
        db.flush()
        materials_map[rm["code"]] = mat.id

    # 5. Articles (Finished Products)
    articles_data = [
        {
            "article_code": "ART-BS-70",
            "name": "Motorcycle Brake Shoe Assembly (CD70 / CG125)",
            "category": "Brakes",
            "vehicle_model": "Honda CD70 / CG125 / China 70cc",
            "unit": "Piece",
            "description": "مکمل بریک شو اسمبلی مع کور، لائننگ، سپرنگ، ریوٹ، برانڈڈ تھیلی، سٹیکر اور اوریجنل ہولوگرام لوگو"
        },
        {
            "article_code": "ART-CP-01",
            "name": "Heavy Duty Clutch Plate Assembly (Universal Auto)",
            "category": "Transmission",
            "vehicle_model": "Universal Rickshaw / Loader / Small Auto",
            "unit": "Piece",
            "description": "ہائی پرفارمنس کلچ پلیٹ اسمبلی مع ریوٹنگ اور کسٹم لوگو پیکنگ"
        },
        {
            "article_code": "ART-SM-02",
            "name": "Side Mirror Assembly with Base & Indicator",
            "category": "Body Parts",
            "vehicle_model": "Suzuki Alto / Mehran / WagonR",
            "unit": "Piece",
            "description": "مکمل سائیڈ مرر مع گلاس، بیس فٹنگ، لائٹ کنکشن اور برانڈڈ پیکنگ"
        }
    ]
    articles_map = {}
    for a in articles_data:
        art = models.Article(**a)
        db.add(art)
        db.flush()
        articles_map[a["article_code"]] = art.id

    # 6. Sampling Recipes (Master Recipe with Child parts, bag, sticker, logo)
    # For Brake Shoe Assembly ART-BS-70:
    # 1 Unit Finished Brake Shoe requires:
    # - 2 Brake Shoe Core Castings
    # - 2 Friction Brake Lining Strips
    # - 2 Tension Return Springs
    # - 8 Solid Steel Rivets
    # - 1 Branded Heavy Polybag (تھیلی)
    # - 1 Barcode Spec Sticker (سٹیکر)
    # - 1 Hologram Verification Logo (لوگو)
    recipe_bs = models.SamplingRecipe(
        article_id=articles_map["ART-BS-70"],
        recipe_name="Brake Shoe CD70 Master Production Recipe (مع تھیلی، سٹیکر، لوگو)",
        version="v2.1",
        notes="مستند سیمپلنگ ریسیپی: بریک شو اسمبلی میں ہر ایک پیس کے لیے 2 کور، 2 لائننگ، 2 سپرنگ، 8 ریوٹ، 1 تھیلی، 1 سٹیکر اور 1 لوگو درکار ہوتا ہے۔",
        is_active=True
    )
    db.add(recipe_bs)
    db.flush()

    recipe_items = [
        {"material_id": materials_map["CP-BSC-02"], "component_type": "Child Part", "qty_per_unit": 2.0, "unit": "Pieces", "notes": "مین کاسٹنگ کور"},
        {"material_id": materials_map["CP-BLS-03"], "component_type": "Child Part", "qty_per_unit": 2.0, "unit": "Pieces", "notes": "فرکشن لیدرز"},
        {"material_id": materials_map["FST-TRS-04"], "component_type": "Fastener", "qty_per_unit": 2.0, "unit": "Pieces", "notes": "ریٹرن سپرنگ"},
        {"material_id": materials_map["FST-RIV-05"], "component_type": "Fastener", "qty_per_unit": 8.0, "unit": "Pieces", "notes": "فٹنگ ریوٹس"},
        {"material_id": materials_map["PKG-BAG-06"], "component_type": "Packaging Bag", "qty_per_unit": 1.0, "unit": "Pieces", "notes": "برانڈڈ تھیلی مع پرنٹ"},
        {"material_id": materials_map["STK-BAR-07"], "component_type": "Sticker", "qty_per_unit": 1.0, "unit": "Pieces", "notes": "بارکوڈ و پارٹ نمبر سٹیکر"},
        {"material_id": materials_map["LGO-HLG-08"], "component_type": "Logo/Branding", "qty_per_unit": 1.0, "unit": "Pieces", "notes": "مفتی آٹو سٹور اوریجنل ہولوگرام"}
    ]
    for rit in recipe_items:
        db.add(models.RecipeItem(recipe_id=recipe_bs.id, **rit))

    # 7. Employees (Salaried & Piece-rate ٹھیکہ Workers)
    employees_data = [
        {"emp_code": "EMP-101", "full_name": "محمد افضل", "designation": "پریس آپریٹر (ٹھیکہ ورکر)", "department": "Production", "phone": "0301-1234567", "employment_type": "Piece-Rate", "base_salary": 0.0, "piece_rate_default": 4.5},
        {"emp_code": "EMP-102", "full_name": "طارق محمود", "designation": "اسمبلی کاریگر (ٹھیکہ ورکر)", "department": "Production", "phone": "0322-2345678", "employment_type": "Piece-Rate", "base_salary": 0.0, "piece_rate_default": 6.0},
        {"emp_code": "EMP-103", "full_name": "بلال احمد", "designation": "پیکنگ و سٹیکرنگ (ٹھیکہ ورکر)", "department": "Packaging", "phone": "0334-3456789", "employment_type": "Piece-Rate", "base_salary": 0.0, "piece_rate_default": 2.5},
        {"emp_code": "EMP-104", "full_name": "اصغر علی", "designation": "ہیڈ سٹور کیپر", "department": "Raw Store", "phone": "0345-4567890", "employment_type": "Salaried", "base_salary": 45000.0, "piece_rate_default": 0.0},
        {"emp_code": "EMP-105", "full_name": "کامران نواز", "designation": "کوالٹی کنٹرول انسپکٹر", "department": "QC", "phone": "0312-5678901", "employment_type": "Salaried", "base_salary": 50000.0, "piece_rate_default": 0.0}
    ]
    emp_map = {}
    for e in employees_data:
        emp = models.Employee(**e)
        db.add(emp)
        db.flush()
        emp_map[e["emp_code"]] = emp.id

    # 8. Today's Attendance & Overtime Sample
    today = datetime.date.today().strftime("%Y-%m-%d")
    att_samples = [
        {"employee_id": emp_map["EMP-101"], "date": today, "status": "Present", "check_in": "08:00 AM", "check_out": "06:00 PM", "overtime_hours": 2.0, "remarks": "اوور ٹائم پریسنگ"},
        {"employee_id": emp_map["EMP-102"], "date": today, "status": "Present", "check_in": "08:15 AM", "check_out": "05:00 PM", "overtime_hours": 0.0, "remarks": "آن ٹائم"},
        {"employee_id": emp_map["EMP-103"], "date": today, "status": "Present", "check_in": "08:00 AM", "check_out": "07:00 PM", "overtime_hours": 3.0, "remarks": "پیکنگ اوور ٹائم"},
        {"employee_id": emp_map["EMP-104"], "date": today, "status": "Present", "check_in": "08:30 AM", "check_out": "05:30 PM", "overtime_hours": 0.5, "remarks": "جی آر این انٹری"},
        {"employee_id": emp_map["EMP-105"], "date": today, "status": "Present", "check_in": "08:00 AM", "check_out": "05:00 PM", "overtime_hours": 0.0, "remarks": "اوکے"}
    ]
    for att in att_samples:
        db.add(models.Attendance(**att))

    # 9. Initial Finished Goods in Store
    fg_sample = models.FinishedGood(
        article_id=articles_map["ART-BS-70"],
        batch_number="BATCH-BS70-0919",
        quantity=350.0,
        packaging_status="Packed with Theli, Sticker & Logo",
        qc_passed=True,
        storage_location="FG-Store-Rack-1"
    )
    db.add(fg_sample)

    db.commit()
    print("Database successfully seeded with realistic Auto Parts manufacturing data!")
