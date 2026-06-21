from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_default_database()
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.orders.create_index("userId")
    print("✅  MongoDB Atlas connected")

async def close_db():
    if client:
        client.close()

def get_db():
    return db
