from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from typing import List
from database import get_db
from routers.auth import get_current_user
from schemas import CategoryCreate, CategoryUpdate, ProductCreate, ProductUpdate, OrderCreate, OrderUpdate

router = APIRouter(prefix="/api/data", tags=["data"])

def oid(s):
    try: return ObjectId(s)
    except: return None

def fmt_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ── SEED default data ─────────────────────────────────────────────────────────
@router.post("/seed")
async def seed(current_user=Depends(get_current_user)):
    db = get_db()
    if await db.categories.count_documents({}) > 0:
        return {"message": "Already seeded"}

    cats = await db.categories.insert_many([
        {"name": "Beverages", "color": "#4A90D9"},
        {"name": "Chaat",     "color": "#E8A020"},
        {"name": "Meals",     "color": "#D94F3D"},
        {"name": "Dessert",   "color": "#9B59B6"},
    ])
    ids = cats.inserted_ids
    bev, chaat, meals, dessert = ids[0], ids[1], ids[2], ids[3]

    await db.products.insert_many([
        {"name":"Masala Tea",   "category": bev,    "price":40,  "tax":5,"uom":"piece","desc":"Spiced Indian tea",    "emoji":"🍵"},
        {"name":"Coffee",       "category": bev,    "price":60,  "tax":5,"uom":"piece","desc":"Freshly brewed",       "emoji":"☕"},
        {"name":"Lassi",        "category": bev,    "price":80,  "tax":5,"uom":"piece","desc":"Sweet yogurt drink",   "emoji":"🥛"},
        {"name":"Lemonade",     "category": bev,    "price":50,  "tax":5,"uom":"piece","desc":"Fresh squeeze",        "emoji":"🍋"},
        {"name":"Samosa",       "category": chaat,  "price":30,  "tax":5,"uom":"piece","desc":"Crispy fried pastry",  "emoji":"🥟"},
        {"name":"Pav Bhaji",    "category": chaat,  "price":90,  "tax":5,"uom":"piece","desc":"Spiced mashed veggies","emoji":"🍛"},
        {"name":"Bhel Puri",    "category": chaat,  "price":60,  "tax":5,"uom":"piece","desc":"Crispy puffed rice",   "emoji":"🍿"},
        {"name":"Vada Pav",     "category": chaat,  "price":35,  "tax":5,"uom":"piece","desc":"Mumbai street burger", "emoji":"🍔"},
        {"name":"Cheese Burger","category": meals,  "price":150, "tax":5,"uom":"piece","desc":"Grilled with cheese",  "emoji":"🍔"},
        {"name":"Pizza",        "category": meals,  "price":250, "tax":5,"uom":"piece","desc":"Stone baked",          "emoji":"🍕"},
        {"name":"Maggie",       "category": meals,  "price":70,  "tax":5,"uom":"piece","desc":"Spiced noodles",       "emoji":"🍜"},
        {"name":"Fries",        "category": meals,  "price":120, "tax":5,"uom":"piece","desc":"Golden crispy",        "emoji":"🍟"},
        {"name":"Gulab Jamun",  "category": dessert,"price":60,  "tax":5,"uom":"piece","desc":"Syrup soaked sweets",  "emoji":"🍮"},
        {"name":"Ice Cream",    "category": dessert,"price":80,  "tax":5,"uom":"piece","desc":"Vanilla scoop",        "emoji":"🍨"},
        {"name":"Brownie",      "category": dessert,"price":100, "tax":5,"uom":"piece","desc":"Warm chocolate",       "emoji":"🍫"},
        {"name":"Jalebi",       "category": dessert,"price":50,  "tax":5,"uom":"piece","desc":"Crispy & sweet",       "emoji":"🍩"},
    ])
    return {"message": "Seeded successfully"}

# ── BOOTSTRAP — everything in one call ───────────────────────────────────────
@router.get("/bootstrap")
async def bootstrap(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    # Categories
    cats = []
    async for c in db.categories.find():
        cats.append({"_id": str(c["_id"]), "name": c["name"], "color": c.get("color","#E8A020")})

    # Products with category populated
    cat_map = {c["_id"]: c for c in cats}
    prods = []
    async for p in db.products.find().sort("name", 1):
        cat_id = str(p.get("category",""))
        prods.append({
            "_id": str(p["_id"]), "name": p["name"],
            "category": {"_id": cat_id, "name": cat_map.get(cat_id,{}).get("name",""), "color": cat_map.get(cat_id,{}).get("color","#888")},
            "price": p["price"], "tax": p.get("tax",5),
            "uom": p.get("uom","piece"), "desc": p.get("desc",""), "emoji": p.get("emoji","🍽"),
        })

    # Orders (latest 200)
    orders = []
    async for o in db.orders.find({"userId": user_id}).sort("createdAt", -1).limit(200):
        orders.append({
            "_id": str(o["_id"]), "num": o.get("num",0),
            "tableId": o.get("tableId"), "tableNum": o.get("tableNum"),
            "customer": o.get("customer","Guest"), "customerId": o.get("customerId"),
            "items": o.get("items",[]), "sub": o.get("sub",0), "tax": o.get("tax",0),
            "disc": o.get("disc",0), "discLabel": o.get("discLabel"),
            "total": o.get("total",0), "payMethod": o.get("payMethod","Cash"),
            "status": o.get("status","paid"), "date": str(o.get("date","")),
        })

    return {"categories": cats, "products": prods, "orders": orders}

# ── CATEGORIES ────────────────────────────────────────────────────────────────
@router.get("/categories")
async def list_categories(current_user=Depends(get_current_user)):
    db = get_db()
    result = []
    async for c in db.categories.find().sort("name",1):
        result.append({"_id": str(c["_id"]), "name": c["name"], "color": c.get("color","#E8A020")})
    return result

@router.post("/categories", status_code=201)
async def create_category(body: CategoryCreate, current_user=Depends(get_current_user)):
    db = get_db()
    doc = {"name": body.name, "color": body.color or "#E8A020", "createdAt": datetime.utcnow()}
    res = await db.categories.insert_one(doc)
    return {"_id": str(res.inserted_id), "name": body.name, "color": body.color}

@router.put("/categories/{cat_id}")
async def update_category(cat_id: str, body: CategoryUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db.categories.find_one_and_update(
        {"_id": ObjectId(cat_id)}, {"$set": update}, return_document=True)
    if not res: raise HTTPException(404, "Not found")
    return {"_id": str(res["_id"]), "name": res["name"], "color": res.get("color","#E8A020")}

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.categories.delete_one({"_id": ObjectId(cat_id)})
    return {"message": "Deleted"}

# ── PRODUCTS ──────────────────────────────────────────────────────────────────
def format_product(p, cat_map={}):
    cat_id = str(p.get("category",""))
    cat    = cat_map.get(cat_id, {})
    return {
        "_id": str(p["_id"]), "name": p["name"],
        "category": {"_id": cat_id, "name": cat.get("name",""), "color": cat.get("color","#888")},
        "price": p["price"], "tax": p.get("tax",5),
        "uom": p.get("uom","piece"), "desc": p.get("desc",""), "emoji": p.get("emoji","🍽"),
    }

@router.get("/products")
async def list_products(current_user=Depends(get_current_user)):
    db = get_db()
    cat_map = {}
    async for c in db.categories.find():
        cat_map[str(c["_id"])] = {"name": c["name"], "color": c.get("color","#888")}
    result = []
    async for p in db.products.find().sort("name",1):
        result.append(format_product(p, cat_map))
    return result

@router.post("/products", status_code=201)
async def create_product(body: ProductCreate, current_user=Depends(get_current_user)):
    db = get_db()
    cat_id = oid(body.category) if body.category else None
    doc = {"name": body.name, "category": cat_id, "price": body.price,
           "tax": body.tax, "uom": body.uom, "desc": body.desc, "emoji": body.emoji,
           "createdAt": datetime.utcnow()}
    res = await db.products.insert_one(doc)
    cat_map = {}
    if cat_id:
        c = await db.categories.find_one({"_id": cat_id})
        if c: cat_map[str(cat_id)] = {"name": c["name"], "color": c.get("color","#888")}
    doc["_id"] = res.inserted_id
    return format_product(doc, cat_map)

@router.put("/products/{prod_id}")
async def update_product(prod_id: str, body: ProductUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "category" in update:
        update["category"] = oid(update["category"])
    res = await db.products.find_one_and_update(
        {"_id": ObjectId(prod_id)}, {"$set": update}, return_document=True)
    if not res: raise HTTPException(404, "Not found")
    cat_map = {}
    if res.get("category"):
        c = await db.categories.find_one({"_id": res["category"]})
        if c: cat_map[str(res["category"])] = {"name": c["name"], "color": c.get("color","#888")}
    return format_product(res, cat_map)

@router.delete("/products/{prod_id}")
async def delete_product(prod_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.products.delete_one({"_id": ObjectId(prod_id)})
    return {"message": "Deleted"}

# ── ORDERS ────────────────────────────────────────────────────────────────────
@router.get("/orders")
async def list_orders(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    result = []
    async for o in db.orders.find({"userId": user_id}).sort("createdAt",-1).limit(200):
        result.append({
            "_id": str(o["_id"]), "num": o.get("num",0),
            "tableId": o.get("tableId"), "customer": o.get("customer","Guest"),
            "items": o.get("items",[]), "total": o.get("total",0),
            "status": o.get("status","paid"), "date": str(o.get("date","")),
        })
    return result

@router.post("/orders", status_code=201)
async def create_order(body: OrderCreate, current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    # Auto-increment order number
    counter = await db.counters.find_one_and_update(
        {"_id": "orderNum"}, {"$inc": {"value": 1}},
        upsert=True, return_document=True)
    num = counter["value"] if counter else 1

    doc = {
        "num": num, "userId": user_id,
        "tableId": body.tableId, "tableNum": body.tableNum,
        "customer": body.customer or "Guest", "customerId": body.customerId,
        "items": [i.model_dump() for i in body.items],
        "sub": body.sub, "tax": body.tax, "disc": body.disc or 0,
        "discLabel": body.discLabel, "total": body.total,
        "payMethod": body.payMethod, "status": body.status or "paid",
        "date": body.date or str(datetime.utcnow()),
        "createdAt": datetime.utcnow(),
    }
    res = await db.orders.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc

@router.put("/orders/{order_id}")
async def update_order(order_id: str, body: OrderUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db.orders.find_one_and_update(
        {"_id": ObjectId(order_id)}, {"$set": update}, return_document=True)
    if not res: raise HTTPException(404, "Not found")
    res["_id"] = str(res["_id"])
    return res

@router.delete("/orders/{order_id}")
async def delete_order(order_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.orders.delete_one({"_id": ObjectId(order_id)})
    return {"message": "Deleted"}
