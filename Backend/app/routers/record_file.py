from fastapi import FastAPI, APIRouter, HTTPException,status, Depends, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.models import ScriptData,SetData,RecordFile
from app.database import script_collection, set_number_collection, record_file_collection, user_collection
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
import base64
import shutil
from pathlib import Path
from fastapi.responses import FileResponse
from .user import verify_access_token
import logging
# logging.basicConfig(level=logging.DEBUG)
# ตั้งค่า logger
logging.basicConfig(
    level=logging.INFO,  # ระดับของ log เช่น DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="%(asctime)s - %(levelname)s - %(message)s"  # รูปแบบข้อความ log
)
logger = logging.getLogger(__name__)  # สร้าง logger โดยใช้ชื่อโมดูลปัจจุบัน


app = FastAPI()

# สำหรับ script---
# API สำหรับเพิ่มข้อมูลใน MongoDB
# MAX_ITEMS_PER_SET = 50  # กำหนดจำนวนสูงสุดต่อชุด
# print("Debug - verify_access_token:", verify_access_token)
# ตั้งค่าโฟลเดอร์สำหรับเก็บไฟล์เสียง
UPLOAD_FOLDER = Path("../uploads")  # โฟลเดอร์สำหรับเก็บไฟล์
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)  # สร้างโฟลเดอร์ถ้ายังไม่มี

# Router Configuration
record_router = APIRouter(
    prefix="/record",
    tags=["Recorded"],
    responses={404: {"message": "Not found"}}
)

@record_router.post("/add_record")
async def add_record(data: RecordFile, user: dict = Depends(verify_access_token)):
    try:
        # ตรวจสอบข้อมูลซ้ำ
        # existing_record = await record_file_collection.find_one({
        #     "user_id": data.user_id,
        #     "set_id": data.set_id,
        #     "script_number": data.script_number,
        #     "textinput_id": data.textinput_id
        # })

        # if existing_record:
        #     raise HTTPException(status_code=400, detail="ข้อมูลนี้เคยบันทึกแล้ว")

        # ตรวจสอบ Base64 ว่ามีข้อมูลหรือไม่
        if not data.record_file:
            raise HTTPException(status_code=400, detail="ไฟล์เสียงไม่มีข้อมูล (record_file is empty)")

        # ตรวจสอบข้อมูลที่ได้รับ
        # print(f"Received data: {data}")
        
        # แปลง Base64 เป็น Buffer
        file_data = base64.b64decode(data.record_file)

        # สร้างชื่อไฟล์สำหรับบันทึก
        filename = f"0{data.set_id}_{data.script_number}_{data.user_id}_{datetime.now().timestamp()}.wav"
        file_path = UPLOAD_FOLDER / filename
        
        # เขียนไฟล์ลงในระบบ
        with open(file_path, "wb") as f:
            f.write(file_data)
            
        # เพิ่มข้อมูลใน MongoDB (เก็บ path ของไฟล์ในฐานข้อมูล)
        record_data = { 
            "user_id": data.user_id, 
            "set_id": data.set_id,   
            "script_number": data.script_number,
            "textinput_id": data.textinput_id,
            "record_file": filename,  # เก็บแค่ชื่อไฟล์
            "status_record": data.status_record,
            "created_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S")  # ตัวอย่าง: 2024-12-18 14:25:30
        }

        # แปลงข้อมูลจาก Pydantic Model (RecordFile) ให้เป็น dict
        record_data["_id"] = ObjectId()  # สร้าง _id เป็น ObjectId (หากไม่ต้องการให้ MongoDB สร้าง)
        
        # เพิ่มข้อมูลใน MongoDB
        result = await record_file_collection.insert_one(record_data)

        # ดึงข้อมูลที่เพิ่มมาเพื่อส่งกลับ
        add_record = await record_file_collection.find_one({"_id": result.inserted_id})

        # แปลง ObjectId ให้เป็น string ก่อนส่งกลับ (ObjectId ไม่สามารถ serializable ได้ใน JSON)
        add_record["_id"] = str(add_record["_id"])

        return add_record
    except HTTPException as http_exc:
        # จัดการข้อผิดพลาดที่เกิดจากการตรวจสอบ
        raise http_exc

    except Exception as e:
        # บันทึกข้อผิดพลาดและส่งข้อความแจ้งกลับ
        logger.error(f"Error adding record: {str(e)}")
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดในการเพิ่มข้อมูล")

    
# ดึงข้อมูล set // ตัวอย่าง Backend API
@record_router.get(
    "/read_set",
    response_model=List[SetData],
    summary="ดึงข้อมูลชุดทั้งหมดหรือค้นหาชุดที่ระบุ",
    description="ใช้ API นี้เพื่อดึงข้อมูลชุดทั้งหมด หรือค้นหาชุดที่เฉพาะเจาะจงโดยใช้หมายเลขชุด (set_number)"
)
async def read_set(
    set_number: Optional[str] = Query(
        None,  # None หมายถึง ไม่บังคับระบุค่า
        description="หมายเลขชุดที่ต้องการค้นหา เช่น 'ชุดที่ 1' หากไม่ระบุจะดึงข้อมูลทั้งหมด"
    ), user: dict = Depends(verify_access_token)
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


# สำหรับ script---
# API สำหรับเพิ่มข้อมูลใน MongoDB
MAX_ITEMS_PER_SET = 50  # กำหนดจำนวนสูงสุดต่อชุด

# API: อ่าน Script
@record_router.get("/read_scripts")
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



@record_router.get("/get_records_all", summary="ดึงไฟล์เสียงทั้งหมด", description="ดึงไฟล์เสียงทั้งหมดที่ถูกบันทึกไว้")
async def get_records_all(user: dict = Depends(verify_access_token)):
      # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        # ดึงข้อมูลไฟล์เสียงทั้งหมด
        records = await record_file_collection.find().to_list(length=None)

        if not records:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลไฟล์เสียง")

        # แปลงข้อมูลจาก MongoDB (BSON -> JSON) และเพิ่มชื่อผู้ใช้
        result = []
        for record in records:
            # ดึงข้อมูลผู้ใช้จาก user_collection โดยใช้ user_id
            user = await user_collection.find_one({"_id": record["user_id"]})

            result.append({
                "id": str(record["_id"]),
                "user_id": record["user_id"],
                "firstname": user["firstname"] if user else None,  # เพิ่มชื่อผู้ใช้
                "lastname": user["lastname"] if user else None,  # เพิ่มชื่อผู้ใช้
                "set_id": record["set_id"],
                "script_number": record["script_number"],
                "textinput_id": record["textinput_id"],
                "file_path": record["record_file"],  # เส้นทางหรือ URL ไฟล์เสียง
                "status_record": record["status_record"],
                "created_at": record["created_at"],
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
    
    
@record_router.get("/get_records", summary="ดึงไฟล์เสียงของผู้ใช้", description="ดึงไฟล์เสียงที่ถูกบันทึกไว้ของผู้ใช้")
async def get_records(user_id: str, user: dict = Depends(verify_access_token)):
    try:
        # ตรวจสอบว่ามี user_id ถูกส่งมาหรือไม่
        if not user_id:
            raise HTTPException(status_code=400, detail="ต้องระบุ user_id")

        # กรองข้อมูลด้วย user_id
        records = await record_file_collection.find({"user_id": user_id}).to_list(length=None)

        # แปลงข้อมูลจาก MongoDB (BSON -> JSON)
        result = [
            {
                "id": str(record["_id"]),
                "user_id": record["user_id"],
                "set_id": record["set_id"],
                "script_number": record["script_number"],
                "textinput_id": record["textinput_id"],
                "file_path": record["record_file"],  # เส้นทางหรือ URL ไฟล์เสียง
                "status_record": record["status_record"],
                "created_at": record["created_at"],
                "updated_at": record.get("updated_at", None),  # ดึง updated_at ถ้ามี; ถ้าไม่มีให้เป็น None
            }
            for record in records
        ]

        # ตรวจสอบว่ามีข้อมูลหรือไม่
        if not result:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลไฟล์เสียง")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")

    

# API สำหรับเล่นไฟล์เสียง
@record_router.get("/play/{filename}", summary="เล่นไฟล์เสียง", description="ให้ URL สำหรับเล่นไฟล์เสียง")
async def play_audio(filename: str, user: dict = Depends(verify_access_token)):
    try:
        # กำหนดเส้นทางไปยังไฟล์เสียง
        file_path = UPLOAD_FOLDER / filename
        
        # ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # ส่งไฟล์เสียงกลับไปให้ผู้ใช้
        return FileResponse(file_path)  # ใช้ FileResponse เพื่อให้ผู้ใช้สามารถดาวน์โหลดหรือเล่นไฟล์เสียงได้
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API สำหรับเล่นไฟล์เสียงตัวอย่าง ไม่ใช่ไฟล์สำหรับผู้ใช้ กำหนด folder แยก
FOLDER_SAMPLE = Path("../uploads/audiosample")  # โฟลเดอร์สำหรับเก็บไฟล์
@record_router.get("/playaudiosample/{filename}", summary="เล่นไฟล์เสียงตัวอย่าง", description="ให้ URL สำหรับเล่นไฟล์เสียงตัวอย่าง")
async def play_audio(filename: str, user: dict = Depends(verify_access_token)):
    try:
        # กำหนดเส้นทางไปยังไฟล์เสียง
        file_path = FOLDER_SAMPLE / filename
        
        # ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # ส่งไฟล์เสียงกลับไปให้ผู้ใช้
        return FileResponse(file_path)  # ใช้ FileResponse เพื่อให้ผู้ใช้สามารถดาวน์โหลดหรือเล่นไฟล์เสียงได้
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @record_router.get("/check_record")
# async def check_all_records():
#     try:
#         records = await record_file_collection.find().to_list(length=None)
#         # แปลง ObjectId ให้เป็น string ก่อนส่งออก
#         for record in records:
#             record["_id"] = str(record["_id"])
#         return records  # ส่งข้อมูลทั้งหมดกลับไป
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
@record_router.get("/check_record", summary="เช็กสถานะไฟล์เสียง", description="เช็กสถานะไฟล์เสียงสำหรับผู้ใช้")
async def check_all_records(user_id: str, user: dict = Depends(verify_access_token)):
    try:
        # กรองข้อมูลเฉพาะ user_id ที่ส่งมาจาก frontend
        records = await record_file_collection.find({"user_id": user_id}).to_list(length=None)

        # แปลง ObjectId ให้เป็น string ก่อนส่งออก
        for record in records:
            record["_id"] = str(record["_id"])

        if not records:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลไฟล์เสียง")

        return records  # ส่งข้อมูลทั้งหมดกลับไป
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


# // ตัวอย่างใน FastAPI
# @record_router.get("/check_record")
# async def check_record(user_id: str, set_id: str, script_number: int):
#     record = await record_file_collection.find_one(
#         {"user_id": user_id, "set_id": set_id, "script_number": script_number},
#         {"_id": 0, "user_id": 1, "set_id": 1, "script_number": 1, "record_file": 1, "status_record": 1}, # ดึงเฉพาะฟิลด์ที่ต้องการ
#     )
#     return record if record else {"detail": "No record found"}

@record_router.put("/update_record")
async def update_record(data: RecordFile, user: dict = Depends(verify_access_token)):
    try:
        if not data.record_file:
            raise HTTPException(status_code=400, detail="ไฟล์เสียงไม่มีข้อมูล")

        # ค้นหาระเบียนเดิมด้วยเงื่อนไขที่เฉพาะเจาะจงมากขึ้น
        existing_record = await record_file_collection.find_one({
            "user_id": data.user_id,
            "set_id": data.set_id,
            "script_number": data.script_number,
            "textinput_id": data.textinput_id
        })

        # แปลง Base64 เป็น binary data
        file_data = base64.b64decode(data.record_file)
        
        # สร้างชื่อไฟล์ใหม่
        filename = f"0{data.set_id}_{data.script_number}_{data.user_id}_{datetime.now().timestamp()}(update).wav"
        file_path = UPLOAD_FOLDER / filename

        if existing_record:
            try:
                # ลบไฟล์เก่า (ถ้ามี)
                old_file = existing_record.get("record_file")
                if old_file:
                    old_file_path = UPLOAD_FOLDER / old_file
                    if old_file_path.exists():
                        try:
                            old_file_path.unlink()
                            logger.info(f"ลบไฟล์เก่า {old_file} สำเร็จ")
                        except Exception as e:
                            logger.error(f"ไม่สามารถลบไฟล์เก่า {old_file}: {str(e)}")
            except Exception as e:
                logger.error(f"เกิดข้อผิดพลาดในการจัดการไฟล์เก่า: {str(e)}")

        # บันทึกไฟล์ใหม่
        try:
            with open(file_path, "wb") as f:
                f.write(file_data)
            logger.info(f"บันทึกไฟล์ใหม่ {filename} สำเร็จ")
        except Exception as e:
            logger.error(f"ไม่สามารถบันทึกไฟล์ใหม่: {str(e)}")
            raise HTTPException(status_code=500, detail="ไม่สามารถบันทึกไฟล์เสียง")

        if existing_record:
            # อัปเดตข้อมูลในฐานข้อมูล
            result = await record_file_collection.update_one(
                {"_id": existing_record["_id"]},
                {
                    "$set": {
                        "record_file": filename,
                        "status_record": data.status_record,
                        "updated_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                    }
                }
            )
            if result.modified_count:
                return {"message": "อัปเดตไฟล์เสียงสำเร็จ"}
            else:
                raise HTTPException(status_code=500, detail="ไม่สามารถอัปเดตข้อมูลในฐานข้อมูล")
        else:
            # เพิ่มข้อมูลใหม่
            record_data = {
                "user_id": data.user_id,
                "set_id": data.set_id,
                "script_number": data.script_number,
                "textinput_id": data.textinput_id,
                "record_file": filename,
                "status_record": data.status_record,
                "created_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
            result = await record_file_collection.insert_one(record_data)
            return {"message": "เพิ่มไฟล์เสียงใหม่สำเร็จ", "record_id": str(result.inserted_id)}

    except Exception as e:
        logger.error(f"Error in update_record: {str(e)}")
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
        
@record_router.delete("/delete_record")
async def delete_record( user_id: str, set_id: str, script_number: int, user: dict = Depends(verify_access_token)):
    """
    ลบข้อมูลเสียงออกจากระบบทั้งในฐานข้อมูลและไฟล์ที่เก็บไว้
    """
    try:
        # ตรวจสอบว่ามีข้อมูลในฐานข้อมูลหรือไม่
        existing_record = await record_file_collection.find_one({"user_id": user_id, "set_id": set_id, "script_number": script_number})
        if not existing_record:
            return JSONResponse(
                status_code=404,
                content={"detail": "ไม่พบข้อมูลที่ต้องการลบ"}
            )

        # ลบข้อมูลออกจากฐานข้อมูล
        await record_file_collection.delete_one({"user_id": user_id, "set_id": set_id, "script_number": script_number})

        # ลบไฟล์เสียงออกจากโฟลเดอร์ (ถ้ามี)
        file_path = UPLOAD_FOLDER / existing_record["record_file"]
        if file_path.exists():
            file_path.unlink()  # ลบไฟล์เสียงออก

        return {"message": "ลบข้อมูลสำเร็จ"}
    except Exception as e:
        logger.error(f"Error deleting record: {str(e)}")
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดในการลบข้อมูล")


@record_router.delete("/delete_record_all")
async def delete_record_all(user_id: str, set_id: str, script_number: int, user: dict = Depends(verify_access_token)):
    """
    ลบข้อมูลเสียงออกจากระบบทั้งในฐานข้อมูลและไฟล์ที่เก็บไว้ ดึงข้อมูลผู้ใชทั้งหมด เพื่อลบ สำหรับแอดมิน หลังบ้าน
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    try:
        # ตรวจสอบว่ามีข้อมูลในฐานข้อมูลหรือไม่
        existing_record = await record_file_collection.find_one({"user_id": user_id, "set_id": set_id, "script_number": script_number})
        if not existing_record:
            return JSONResponse(
                status_code=404,
                content={"detail": "ไม่พบข้อมูลที่ต้องการลบ"}
            )

        # ลบข้อมูลออกจากฐานข้อมูล
        await record_file_collection.delete_one({"user_id": user_id, "set_id": set_id, "script_number": script_number})

        # ลบไฟล์เสียงออกจากโฟลเดอร์ (ถ้ามี)
        file_path = UPLOAD_FOLDER / existing_record["record_file"]
        if file_path.exists():
            file_path.unlink()  # ลบไฟล์เสียงออก

        return {"message": "ลบข้อมูลสำเร็จ"}
    except Exception as e:
        logger.error(f"Error deleting record: {str(e)}")
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดในการลบข้อมูล")


@record_router.put("/update_status")
async def update_record_status(user_id: str, set_id: str, script_number: int, status: str, user: dict = Depends(verify_access_token)):
    """
    อัปเดตสถานะของการบันทึกเสียง (completed / rejected)
    """
     # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    if status not in ["completed", "rejected"]:
        raise HTTPException(status_code=400, detail="สถานะไม่ถูกต้อง")

    try:
        existing_record = await record_file_collection.find_one(
            {"user_id": user_id, "set_id": set_id, "script_number": script_number}
        )
        if not existing_record:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลที่ต้องการอัปเดต")

        # อัปเดต status_record ในฐานข้อมูล
        await record_file_collection.update_one(
            {"user_id": user_id, "set_id": set_id, "script_number": script_number},
            {"$set": {"status_record": status}}
        )

        # ✅ อัปเดต sum_record ของ user_id หลังเปลี่ยนสถานะ
        await update_sum_record_for_user(user_id)
        
        return {"message": f"อัปเดตสถานะเป็น {status} สำเร็จ"}
    except Exception as e:
        logger.error(f"Error updating record status: {str(e)}")
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    
    
  #แยกฟังก์ชันออกจาก API
async def update_sum_record_for_user(user_id: str, user: dict = Depends(verify_access_token)):
    """
    อัปเดต sum_record ของผู้ใช้ที่ระบุ โดยนับเฉพาะ status ที่เป็น 'completed'
    """
    # นับจำนวน record ที่เป็น completed ของ user_id นั้น
    completed_count = await record_file_collection.count_documents(
        {"user_id": user_id, "status_record": "completed"}
    )

    # อัปเดตค่า sum_record ใน user_collection
    await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"sum_record": completed_count}}
    )