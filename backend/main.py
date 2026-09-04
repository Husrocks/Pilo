from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
import json

DB_FILE = "ecommerce.db"

# 1. Database Initialization & Seeding
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        # Create Products Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT,
                price REAL,
                category TEXT,
                img TEXT
            )
        ''')
        # Create Orders Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total REAL,
                items_json TEXT
            )
        ''')
        
        # Seed the 10 dairy products if the table is empty
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0:
            mock_products = [
                (1, "Farmhouse Whole Milk", 4.50, "milk", "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80"),
                (2, "Skimmed Cow's Milk", 3.80, "milk", "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80"),
                (3, "Aged Cheddar Block", 8.50, "cheese", "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=300&q=80"),
                (4, "Fresh Mozzarella", 6.00, "cheese", "https://images.unsplash.com/photo-1599557456722-d7b1d120a1db?auto=format&fit=crop&w=300&q=80"),
                (5, "Artisan Swiss Cheese", 9.20, "cheese", "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=300&q=80"),
                (6, "Plain Greek Yogurt", 5.00, "yogurt", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80"),
                (7, "Honey Vanilla Yogurt", 5.50, "yogurt", "https://images.unsplash.com/photo-1574624644081-344cb89d97f2?auto=format&fit=crop&w=300&q=80"),
                (8, "Unsalted Churned Butter", 4.20, "butter", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=300&q=80"),
                (9, "Garlic Herb Butter", 4.80, "butter", "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=300&q=80"),
                (10, "Rich Heavy Cream", 3.50, "milk", "https://images.unsplash.com/photo-1593333333333-placeholder?auto=format&fit=crop&w=300&q=80")
            ]
            cursor.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", mock_products)
            conn.commit()

# Lifespan runs init_db when the server starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# 2. CORS Middleware (Crucial for frontend-backend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Pydantic Models for Checkout validation
class CartItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    cart: List[CartItem]
    total: float

# 4. API Endpoints
@app.get("/products")
def get_products():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row  # Returns rows as dictionaries
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products")
        products = [dict(row) for row in cursor.fetchall()]
        return {"products": products}

@app.post("/checkout")
def process_checkout(request: CheckoutRequest):
    if not request.cart:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        # Save order to DB
        cursor.execute(
            "INSERT INTO orders (total, items_json) VALUES (?, ?)", 
            (request.total, json.dumps([item.dict() for item in request.cart]))
        )
        conn.commit()
        order_id = cursor.lastrowid
        
    return {"message": "Order placed successfully!", "order_id": order_id}