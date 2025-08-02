from fastapi import FastAPI, APIRouter, HTTPException,status, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.models import ScriptData,SetData
from app.database import script_collection, set_number_collection
from typing import List, Optional
from jose import jwt
from jose.exceptions import JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta


# Add this to your existing FastAPI script
from bson import ObjectId  # Import this for handling MongoDB ObjectId
from pymongo import ReturnDocument
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Router Configuration
list_router = APIRouter(
    prefix="/list",
    tags=["List Set"],
    responses={404: {"message": "Not found"}}
)

# สำหรับ script---
# API สำหรับเพิ่มข้อมูลใน MongoDB
MAX_ITEMS_PER_SET = 50  # กำหนดจำนวนสูงสุดต่อชุด

# ดึงข้อมูล set // ตัวอย่าง Backend API
@list_router.get(
    "/read_set",
    response_model=List[SetData],
    summary="ดึงข้อมูลชุดทั้งหมดหรือค้นหาชุดที่ระบุ",
    description="ใช้ API นี้เพื่อดึงข้อมูลชุดทั้งหมด หรือค้นหาชุดที่เฉพาะเจาะจงโดยใช้หมายเลขชุด (set_number)"
)
async def read_set(
    set_number: Optional[str] = Query(
        None,  # None หมายถึง ไม่บังคับระบุค่า
        description="หมายเลขชุดที่ต้องการค้นหา เช่น 'ชุดที่ 1' หากไม่ระบุจะดึงข้อมูลทั้งหมด"
    )
):
    """
    ดึงข้อมูล set ทั้งหมด หรือชุดที่ระบุ
    """
    try:
        # Query MongoDB
        query = {"set_number": set_number} if set_number else {}  # หากไม่มี set_number จะดึงทั้งหมด
        sets = await set_number_collection.find(query).to_list(length=None)

        # แปลง `_id` เป็น string
        for set_item in sets:
            set_item["id"] = str(set_item["_id"])
            del set_item["_id"]

        return sets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API ใหม่สำหรับนับจำนวน set ทั้งหมดหรือชุดที่ระบุ
@list_router.get(
    "/set_count",
    summary="ดึงจำนวนทั้งหมดของชุด",
    description="ใช้ API นี้เพื่อดึงจำนวนชุดทั้งหมด หรือชุดที่ระบุ"
)
async def get_set_count(set_number: Optional[str] = None):
    """
    ดึงจำนวนชุดทั้งหมด หรือชุดที่ระบุ
    """
    try:
        # คำสั่ง Query ตาม set_number หรือทั้งหมด
        query = {"set_number": set_number} if set_number else {}
        
        # นับจำนวนชุดในฐานข้อมูล
        count = await set_number_collection.count_documents(query)
        # ส่งคืนจำนวนชุด
        return {"set_count": count}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting sets: {str(e)}")
