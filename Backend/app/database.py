from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_DETAILS


if not MONGO_DETAILS:
    raise ValueError("MONGO_DETAILS is missing")

# สร้าง client
client = AsyncIOMotorClient(MONGO_DETAILS)

# เลือกฐานข้อมูล

# database = client["voice_contest"]
database = client["Test"]

# เลือก collection
user_collection = database.get_collection("users")

script_collection = database.get_collection("script")  # ใส่วงเล็บ () แทนการใช้ []
set_number_collection = database.get_collection("set_number")
record_file_collection = database.get_collection("record_file")

