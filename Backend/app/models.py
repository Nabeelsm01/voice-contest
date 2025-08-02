from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Union
from datetime import datetime
from pytz import timezone  # หรือใช้ zoneinfo ใน Python 3.9+


class User(BaseModel):
    _id: Optional[str]  # เพิ่มฟิลด์นี้เพื่อรองรับ _id
    name_lastname: str
    phone_number: str
    email: str
    lastname: str
    phone_number: str
    password: str
    email: EmailStr
    created_at: str = datetime.now(timezone("Asia/Bangkok")).isoformat()  # เวลาไทย
    profile_picture: str = ""  # กำหนดค่าเริ่มต้นเป็นค่าว่าง
    address: str = ""  # กำหนดค่าเริ่มต้นเป็นค่าว่าง
    role: str = "user"  # กำหนดค่าเริ่มต้นเป็น "user"
    invite: Optional[str] = "-"  # สามารถมีหรือไม่มีก็ได้
    sum_record: int = ""  # เพิ่มฟิลด์ sum_record (ค่าเริ่มต้นเป็น None)
   

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Register_request(BaseModel):
    firstname: str
    lastname: str
    phone_number: str
    password: str
    email: EmailStr
    created_at: str = datetime.now(timezone("Asia/Bangkok")).isoformat()  # เวลาไทย
    profile_picture: str = ""  # กำหนดค่าเริ่มต้นเป็นค่าว่าง
    address: str = ""  # กำหนดค่าเริ่มต้นเป็นค่าว่าง
    role: str = "user"  # กำหนดค่าเริ่มต้นเป็น "user"
    random_result: Optional[int] = None  # เพิ่มฟิลด์ random_result (ค่าเริ่มต้นเป็น None)
    invite: Optional[str] = "-"  # สามารถมีหรือไม่มีก็ได้


class AgreementRequest(BaseModel):
    email: str
    _id: Optional[str]  # เพิ่มฟิลด์นี้เพื่อรองรับ `_id`
    agreement: bool


class AgreementStatus(BaseModel):
    email: str
    agreement: bool
    agreement_time: Optional[str] = None

# class ScriptData(BaseModel):
#     set_number: str
#     textinput: str
#     created_at: str = datetime.now(timezone("Asia/Bangkok")).isoformat()  # เวลาไทย


class ScriptData(BaseModel):
    set_number: str
    script_number: Optional[int] = None  # จะกำหนดใน API
    textinput: str
    created_at: str = datetime.now(
        timezone("Asia/Bangkok")).isoformat()  # เวลาไทย


class SetData(BaseModel):
    set_number: str
    description: str
    created_at: str = datetime.now(
        timezone("Asia/Bangkok")).isoformat()  # เวลาไทย


# class RecordFile(BaseModel):
#     user_id: str
#     set_id: str
#     textinput_id: str
#     record_file: str
#     status_record: str
#     created_record: str = datetime.now(timezone("Asia/Bangkok")).isoformat()  # เวลาไทย

class RecordFile(BaseModel):
    user_id: str = Field(..., description="ID ของผู้ใช้งาน")
    set_id: str = Field(..., description="ID ของชุดข้อมูล")
    script_number: int
    textinput_id: str = Field(..., description="ID ของข้อความหรือสคริปต์")
    record_file: str = Field(..., description="URL หรือ Path ของไฟล์เสียงที่บันทึก")
    status_record: str = Field(
        default="pending",
        description="สถานะของไฟล์เสียง (เช่น pending, approved, rejected)"
    )
    created_record: str = Field(
        default_factory=lambda: datetime.now(
            timezone("Asia/Bangkok")).isoformat(),
        description="วันเวลาที่บันทึกไฟล์เสียง (ค่าเริ่มต้นเป็นเวลาปัจจุบันในเขตเวลาไทย)"
    )

class EmailList(BaseModel):
    emails: List[EmailStr]

class UserRecord(BaseModel):
    email: str
    record: Union[int, str]  # record สามารถเป็น int หรือ string ได้
    
class CountAbove50Response(BaseModel):
    count_above_50: int
    
class UserInvites(BaseModel):
    name: str
    invite_count: int
    invited_users: Optional[List[str]]  # Add invited_users to the response model

