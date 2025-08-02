from fastapi import FastAPI, APIRouter, HTTPException,status, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.models import ScriptData,SetData
from app.database import script_collection, set_number_collection, user_collection
from typing import List, Optional
from jose import jwt
from jose.exceptions import JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pytz import timezone  # หรือใช้ zoneinfo ใน Python 3.9+

# Add this to your existing FastAPI script
from bson import ObjectId  # Import this for handling MongoDB ObjectId
from pymongo import ReturnDocument
from pydantic import BaseModel
from typing import Optional

from .user import get_all_users
from .user import verify_access_token

app = FastAPI()

# Router Configuration
script_router = APIRouter(
    prefix="/script",
    tags=["Script"],
    responses={404: {"message": "Not found"}}
)
# 
# สำหรับ script---
# API สำหรับเพิ่มข้อมูลใน MongoDB
MAX_ITEMS_PER_SET = 50  # กำหนดจำนวนสูงสุดต่อชุด
@script_router.post("/add_script")
async def add_script(data: ScriptData , user: dict = Depends(verify_access_token)):
    """
    เพิ่มข้อความใหม่ในชุด set_number โดยตรวจสอบจำนวนไม่เกิน MAX_ITEMS_PER_SET
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        # ตรวจสอบว่าชุดข้อมูลมีอยู่ใน set_number_collection
        set_exists = await set_number_collection.find_one({"set_number": data.set_number})
        if not set_exists:
            raise HTTPException(status_code=404, detail=f"Set '{data.set_number}' not found in the database.")

        # ตรวจสอบจำนวน Script ในชุด
        existing_count = await script_collection.count_documents({"set_number": data.set_number})
        if existing_count >= MAX_ITEMS_PER_SET:
            raise HTTPException(
                status_code=400,
                detail=f"Set '{data.set_number}' is full. Current count: {existing_count}, Max allowed: {MAX_ITEMS_PER_SET}"
            )

        # คำนวณ script_number ใหม่
        last_script = await script_collection.find_one(
            {"set_number": data.set_number},
            sort=[("script_number", -1)]  # เรียงจาก script_number มากไปน้อย
        )
        new_script_number = last_script["script_number"] + 1 if last_script else 1

        # เพิ่ม Script
        data_dict = data.dict()
        data_dict["script_number"] = new_script_number
        data_dict["created_at"] = datetime.now(timezone("Asia/Bangkok")).isoformat()

        result = await script_collection.insert_one(data_dict)

        return {
            "message": "Script added successfully.",
            "inserted_id": str(result.inserted_id),
            "remaining": MAX_ITEMS_PER_SET - (existing_count + 1),
        }
    except HTTPException as http_exc:
        raise http_exc  # ส่งต่อข้อผิดพลาดที่จัดการแล้ว
    except Exception as e:
        # Debug หากมีปัญหาอื่น
        raise HTTPException(status_code=500, detail=str(e))


# API: เพิ่ม Set Number
@script_router.post("/add_set")
async def add_set(data: SetData , user: dict = Depends(verify_access_token)):
    """
    เพิ่มชุดข้อมูลใหม่ใน set_number_collection
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        # ตรวจสอบว่าชุดข้อมูลซ้ำหรือไม่
        existing_set = await set_number_collection.find_one({"set_number": data.set_number})
        if existing_set:
            raise HTTPException(status_code=400, detail=f"Set '{data.set_number}' already exists.")

          # เพิ่ม text หรือข้อความใหม่
        if not data.description:
            data.description = "Default text here"  # กำหนดข้อความเริ่มต้นถ้ายังไม่ได้ใส่ 

        # เพิ่ม Set Number
        data.created_at = datetime.now(timezone("Asia/Bangkok")).isoformat()
            
        result = await set_number_collection.insert_one(data.dict())

        return {
            "message": "Set added successfully.",
            "inserted_id": str(result.inserted_id),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from .user import verify_access_token

# ดึงข้อมูล set // ตัวอย่าง Backend API
@script_router.get(
    "/read_set",
    response_model=List[SetData],
    summary="ดึงข้อมูลชุดทั้งหมดหรือค้นหาชุดที่ระบุ",
    description="ใช้ API นี้เพื่อดึงข้อมูลชุดทั้งหมด หรือค้นหาชุดที่เฉพาะเจาะจงโดยใช้หมายเลขชุด (set_number)"
)
async def read_set(
    set_number: Optional[str] = Query(
        None,  # None หมายถึง ไม่บังคับระบุค่า
        description="หมายเลขชุดที่ต้องการค้นหา เช่น 'ชุดที่ 1' หากไม่ระบุจะดึงข้อมูลทั้งหม"
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
# API: อ่าน Script
@script_router.get("/read_scripts")
async def read_scripts(set_number: Optional[str] = None, skip: int = 0, limit: Optional[int] = None):
    """
    ดึงข้อมูล Script ในชุด set_number พร้อมรองรับการแบ่งหน้า
    """
    try:
        query = {"set_number": set_number} if set_number else {}  # หากระบุ set_number ให้กรองตาม set_number
        cursor = script_collection.find(query).sort("created_at", 1).skip(skip)

        if limit:
            cursor = cursor.limit(limit)  # จำกัดจำนวนเฉพาะในกรณีที่มีการระบุ limit


        data = []
        async for item in cursor:
            item["_id"] = str(item["_id"])
            data.append(item)

        total_count = await script_collection.count_documents(query)  # คำนวณจำนวนทั้งหมด
        remaining = max(0, MAX_ITEMS_PER_SET - total_count)  # คำนวณ remaining

        return {
            "data": data,
            "total_count": total_count,
            "remaining": remaining,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API: ลบ Script
@script_router.delete("/delete_script/{script_id}")
async def delete_script(script_id: str , user: dict = Depends(verify_access_token)):
    """
    ลบข้อความใน Script โดยใช้ script_id
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        result = await script_collection.delete_one({"_id": ObjectId(script_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Script not found.")

        return {"message": "Script deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API: ลบ Set Number
@script_router.delete("/delete_set/{set_number}")
async def delete_set(set_number: str , user: dict = Depends(verify_access_token)):
    """
    ลบชุดข้อมูลใน set_number_collection พร้อม Script ที่เกี่ยวข้อง
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        set_result = await set_number_collection.delete_one({"set_number": set_number})
        if set_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Set not found.")

        script_result = await script_collection.delete_many({"set_number": set_number})
        return {
            "message": "Set and related scripts deleted successfully.",
            "deleted_scripts": script_result.deleted_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API: อัปเดต Script
@script_router.put("/update_script/{script_id}")
async def update_script(script_id: str, data: ScriptData , user: dict = Depends(verify_access_token)):
    """
    อัปเดตข้อความใน Script โดยใช้ script_id
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        updated_data = data.dict(exclude_unset=True)
        updated_data["updated_at"] = datetime.now(timezone("Asia/Bangkok")).isoformat()

        result = await script_collection.find_one_and_update(
            {"_id": ObjectId(script_id)},
            {"$set": updated_data},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Script not found.")

        return {"message": "Script updated successfully.", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
app.include_router(script_router)