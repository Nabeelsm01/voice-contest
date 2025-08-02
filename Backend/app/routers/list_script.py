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
from .user import verify_access_token

app = FastAPI()

# Router Configuration
list_script_router = APIRouter(
    prefix="/list",
    tags=["List Script"],
    responses={404: {"message": "Not found"}}
)
# print("Debug - verify_access_token:", verify_access_token)
# สำหรับ script---
# API สำหรับเพิ่มข้อมูลใน MongoDB
MAX_ITEMS_PER_SET = 50  # กำหนดจำนวนสูงสุดต่อชุด

# API: อ่าน Script
@list_script_router.get("/read_scripts")
async def read_scripts(set_number: Optional[str] = None,  skip: int = 0, limit: int = 50, user: dict = Depends(verify_access_token)):
    """
    ดึงข้อมูล Script ในชุด set_number พร้อมรองรับการแบ่งหน้า
    """
    try:
        data = []
        # cursor = (
        #     script_collection.find({"set_number": set_number})
        #     .sort("created_at", 1)
        #     .skip(skip)
        #     .limit(limit)
        # )
        cursor = (
            script_collection.find({"set_number": set_number} if set_number else {})
            .sort("script_number", 1)
            .skip(skip)
            .limit(limit)
         )

        async for item in cursor:
            item["_id"] = str(item["_id"])
            data.append(item)

        # total_count = await script_collection.count_documents({"set_number": set_number})
          # นับจำนวนข้อมูลทั้งหมดในชุด (set_number)
        total_count = await script_collection.count_documents({"set_number": set_number} if set_number else {})
        
          # คำนวณ remaining โดยใช้ total_count
        # remaining = max(0, MAX_ITEMS_PER_SET - len(data))  # remaining ไม่ควรเกิน 0
        remaining = max(0, MAX_ITEMS_PER_SET - total_count)  # ใช้ total_count เพื่อคำนวณที่เหลือ

        
        return {
            "data": data,
            "total_count": total_count,
            "remaining": remaining,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))







