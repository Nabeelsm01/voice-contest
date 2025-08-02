from fastapi import APIRouter, HTTPException, status, Response, Depends, Request, File, Form, UploadFile, Body
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse, RedirectResponse
import shutil
import os
import random

# นำเข้า JSONResponse เพื่อจัดการ Cookie
from bson import ObjectId  # นำเข้า ObjectId สำหรับจัดการข้อมูล ObjectID ใน MongoDB

from app.models import User, LoginRequest, Register_request, AgreementRequest , EmailList,CountAbove50Response,UserInvites

# นำเข้า user_collection จาก app.database เพื่อใช้ในการเข้าถึงข้อมูลผู้ใช้ใน MongoDB
from app.database import user_collection
from typing import List, Dict
import requests  # นำเข้า requests สำหรับการส่งคำขอ HTTP
# นำเข้า jwt และ JWTError สำหรับการสร้างและตรวจสอบ JWT token
from jose import jwt, JWTError
# นำเข้า CryptContext สำหรับการแฮชรหัสผ่าน
from passlib.context import CryptContext
# นำเข้า timedelta สำหรับการคำนวณเวลา และ datetime สำหรับการจัดการเวลา
from datetime import datetime, timedelta
import pytz  # นำเข้า pytz สำหรับการจัดการ timezone
from pathlib import Path  # นำเข้า pathlib สำหรับจัดการ path ของไฟล์
import smtplib  # lib for send email
# นำเข้า MIMEText และ MIMEMultipart สำหรับสร้างเนื้อหาของอีเมล
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


from config import SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FRONTEND_URL, BACKEND_URL, GMAIL_USER, APP_PASSWORD

import requests
import random
from .list_set import get_set_count


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Router Configuration
router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"message": "Not found"}}
)



# ตั้งค่าโฟลเดอร์สำหรับเก็บไฟล์รูปสำหรับโปรไฟล์
UPLOAD_FOLDER = Path("../uploads_images")  # โฟลเดอร์สำหรับเก็บไฟล์่
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)  # สร้างโฟลเดอร์ถ้ายังไม่มี

# Google OAuth Configurations

GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/user/auth/google/callback"
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URI = "https://openidconnect.googleapis.com/v1/userinfo"

# Facebook OAuth Configurations

FACEBOOK_AUTH_URI = "https://www.facebook.com/v12.0/dialog/oauth"
FACEBOOK_TOKEN_URI = "https://graph.facebook.com/v12.0/oauth/access_token"
FACEBOOK_USERINFO_URI = "https://graph.facebook.com/me"
FACEBOOK_REDIRECT_URI = f"{BACKEND_URL}/user/auth/facebook/callback"

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


utc_time = datetime.utcnow()

# กำหนดเขตเวลา Bangkok (UTC+7)
bangkok_zone = pytz.timezone("Asia/Bangkok")

# ทำให้เวลานี้เป็น UTC ก่อน (หากเป็นเวลา UTC)
utc_time = pytz.utc.localize(utc_time)

# แปลงเป็นเวลาในกรุงเทพฯ (UTC+7)
bangkok_time = utc_time.astimezone(bangkok_zone)

# Helper Functions


def user_helper(user):
    return {
        "name_lastname": user["name_lastname"],
        "phone_number": user["phone_number"],
        "email": user["email"],
    }


def hash_password(password: str) -> str:
    """Hash the password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Generate a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def verify_access_token(request: Request):
    """
    Middleware-like function to verify JWT token in HttpOnly Cookie.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ไม่มีสิทธิ์เข้าถึง: ไม่พบ Token",
        )

    try:
        # Remove "Bearer " prefix from token
        if token.startswith("Bearer "):
            token = token[len("Bearer "):]
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: str = payload.get("sub")
        if not id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token ไม่ถูกต้อง: ไม่มีข้อมูลผู้ใช้",
            )

        # ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
        user = await user_collection.find_one({"email": id})
        if not user:
            user = await user_collection.find_one({"id": id})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="ไม่มีสิทธิ์เข้าถึง: ผู้ใช้ไม่มีในระบบ",
                )

        return user  # Return user information if verified
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token หมดอายุหรือไม่ถูกต้อง",
        )

# Step 1: Redirect to Google's OAuth 2.0 server


@router.get("/auth/google/login")
def google_login(request: Request):
    invite = request.query_params.get("invite", "")
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": invite  # ส่งค่า invite ไปกับ state parameter
    }
    auth_url = f"{GOOGLE_AUTH_URI}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(auth_url)

# Step 2: Handle callback and exchange authorization code for tokens


@router.get("/auth/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    invite = request.query_params.get("state", "")  # รับค่า invite จาก state parameter
    if not code:
        return RedirectResponse(url=FRONTEND_URL)

    # Exchange authorization code for access token
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    token_response = requests.post(GOOGLE_TOKEN_URI, data=token_data).json()

    if "error" in token_response:
        raise HTTPException(status_code=400, detail=f"Error fetching token: {token_response['error']}")

    # Fetch user information
    access_token = token_response.get("access_token")

    userinfo_response = requests.get(
        GOOGLE_USERINFO_URI, headers={
            "Authorization": f"Bearer {access_token}"}
    ).json()

    if not userinfo_response.get("email"):
        raise HTTPException(status_code=400, detail="Unable to fetch user information")

    # ตรวจสอบว่า user มีอยู่ในฐานข้อมูลหรือไม่
    email = userinfo_response["email"]
    id = userinfo_response["sub"]
    same_email_user = await user_collection.find_one({"email": email})
    if same_email_user:
        existing_user = await user_collection.find_one({"email": email, "id": id})
        if existing_user:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            jwt_token = create_access_token(data={"sub": id}, expires_delta=access_token_expires)

            response = RedirectResponse(url=FRONTEND_URL)
            response.set_cookie(
                key="access_token",
                value=jwt_token,
                httponly=True,
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                path="/",
                secure=True,
                samesite="None",
            )
            return response
        else:
            redirect_url = f"{FRONTEND_URL}?error=email_used"
            return RedirectResponse(url=redirect_url)
    
    if not same_email_user:
        # หากยังไม่มีในฐานข้อมูล ให้สร้างเอกสารใหม่
        new_user = {
            "firstname": userinfo_response.get("given_name", ""),
            "lastname": userinfo_response.get("family_name", ""),
            "email": email,
            "phone_number": "",
            "address": "",
            "role": "user",
            "profile_picture": userinfo_response.get("picture", ""),
            "id": userinfo_response.get("sub"),
            "created_at": bangkok_time.isoformat(),
            "invited": invite,  # เพิ่มคอลัมน์ invited
        }
        
        await user_collection.insert_one(new_user)
        
        # ค้นหา inviting user โดยใช้อีเมลที่ได้จาก invite
        inviting_user = await user_collection.find_one({"email": invite})
        if inviting_user:
            # เพิ่มอีเมลของ new_user ในคอลัมน์ invited_users ของ inviting user
            await user_collection.update_one(
                {"email": invite},
                {"$push": {"invited_users": email}}
            )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = create_access_token(data={"sub": userinfo_response.get("sub")}, expires_delta=access_token_expires)

    response = JSONResponse(content={
        "message": "Login with Google successful",
        "user": userinfo_response,
    })

    response = RedirectResponse(url=FRONTEND_URL)

    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        secure=True,
        samesite="None",
    )

    return response

# Facebook
# Step 1: Redirect to Facebook Login

# @router.get("/auth/facebook/login")
# def facebook_login():
#     params = {
#         "client_id": FACEBOOK_CLIENT_ID,
#         "redirect_uri": FACEBOOK_REDIRECT_URI,
#         "client_secret": FACEBOOK_CLIENT_SECRET,
#         "scope": "public_profile",
#         "response_type": "code"
#     }
#     auth_url = f"{FACEBOOK_AUTH_URI}?{
#         '&'.join([f'{k}={v}' for k, v in params.items()])}"
#     return RedirectResponse(auth_url)

# # Step 2: Handle Callback

# @router.get("/auth/facebook/callback")
# async def facebook_callback(request: Request):
#     code = request.query_params.get("code")
#     if not code:
#         return RedirectResponse(url=FRONTEND_URL)

#     # Exchange code for access token
#     token_data = {
#         "client_id": FACEBOOK_CLIENT_ID,
#         "redirect_uri": FACEBOOK_REDIRECT_URI,
#         "client_secret": FACEBOOK_CLIENT_SECRET,
#         "code": code,
#     }
#     token_response = requests.get(FACEBOOK_TOKEN_URI, params=token_data).json()

#     if "error" in token_response:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Error fetching token: {token_response['error']}",
#         )

#     access_token = token_response.get("access_token")

#     # Fetch user info
#     userinfo_response = requests.get(
#         FACEBOOK_USERINFO_URI,
#         params={"access_token": access_token,
#                 "fields": "id,first_name,last_name,picture"},
#     ).json()

#     # Check if user exists in database
#     facebook_id = userinfo_response.get("id")
#     name_lastname = userinfo_response.get("name", "")

#     existing_user = await user_collection.find_one({"id": facebook_id})

#     if not existing_user:
#         # If user doesn't exist, create a new document
#         new_user = {
#             "id": userinfo_response.get("id"),
#             "firstname": userinfo_response.get("first_name"),
#             "lastname": userinfo_response.get("last_name"),
#             "email": "",
#             "phone_number": "",
#             "address": "",
#             "role": "user",
#             "profile_picture": userinfo_response["picture"]["data"]["url"],
#             "created_at": bangkok_time.isoformat(),
#         }
#         await user_collection.insert_one(new_user)

#     # Generate JWT token
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     jwt_token = create_access_token(
#         data={"sub": facebook_id}, expires_delta=access_token_expires
#     )

#     response = RedirectResponse(
#         url=FRONTEND_URL)  # Redirect to Home

#     # Set JWT token ใน Cookie Facebook
#     response.set_cookie(
#         key="access_token",
#         value=jwt_token,
#         httponly=True,  # ทำให้ frontend ไม่สามารถเข้าถึง cookie โดย JavaScript
#         max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         path="/",  # ให้ Cookie ใช้ได้ในทุกเส้นทาง
#         secure=True,  # Disable Secure for local
#         samesite="None",  # Allow cross-origin cookies
#     )
#     return userinfo_response


@router.post("/register/")
async def register_user(Register_request: Register_request):

    if not Register_request.email or not Register_request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="กรุณาระบุอีเมลและรหัสผ่าน",
        )
    try:
        # ตรวจสอบว่า email ซ้ำหรือไม่
        existing_user = await user_collection.find_one({"email": Register_request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="อีเมลนี้ถูกใช้งานแล้ว",
            )

        # แฮชรหัสผ่าน
        hashed_password = hash_password(Register_request.password)

        # สร้างเอกสารใหม่สำหรับ MongoDB
        new_user = Register_request.dict()
        new_user["password"] = hashed_password

        # บันทึกข้อมูลลง MongoDB
        result = await user_collection.insert_one(new_user)

        if result.inserted_id:
            # ตรวจสอบว่ามีผู้เชิญหรือไม่
            if new_user.get("invite") and new_user["invite"] != "":
                inviter_email = new_user["invite"]

                # ค้นหาผู้ใช้ที่เชิญ (inviter)
                inviter = await user_collection.find_one({"email": inviter_email})
                if inviter:
                    # อัปเดต invited_users array ของผู้เชิญ
                    await user_collection.update_one(
                        {"email": inviter_email},
                        {"$push": {"invited_users": new_user["email"]}},
                    )
                    
            # สร้าง JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": Register_request.email, "role": new_user.get("role")},
                expires_delta=access_token_expires
            )

            # ✅ **สร้าง Cookie สำหรับ JWT Token**
            response = JSONResponse(content={
                "message": "ลงทะเบียนสำเร็จ",
                "user_id": str(result.inserted_id),
            })
        
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                path="/",  # ให้ Cookie ใช้ได้ในทุกเส้นทาง
                secure=True,  # Disable Secure for local
                samesite="None",  # Allow cross-origin cookies
            )
            

            return response

        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="เกิดข้อผิดพลาดในการลงทะเบียน",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาด: {str(e)}",
        )

@router.post("/login/")
async def login_user(response: Response, login_request: LoginRequest):
    try:
        # ค้นหาผู้ใช้ในฐานข้อมูลตามอีเมล
        user = await user_collection.find_one({"email": login_request.email})
        if user and pwd_context.verify(login_request.password, user["password"]):
            # ตรวจสอบบทบาท (role) ของผู้ใช้
            # ค่าเริ่มต้นเป็น "user" ถ้าไม่มีฟิลด์ role
            role = user.get("role", "user")

            # Generate JWT token
            access_token_expires = timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                # เพิ่ม role ใน payload ของ token
                data={"sub": user["email"], "role": role},
                expires_delta=access_token_expires
            )

            # Set the token in HttpOnly Cookie
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                path="/",  # ให้ Cookie ใช้ได้ในทุกเส้นทาง
                secure=True,  # Disable Secure for local
                samesite="None",  # Allow cross-origin cookies
            )

            # ตอบกลับตามบทบาท
            if role == "admin":
                return {"message": "เข้าสู่ระบบสำเร็จ", "role": "admin","token": access_token} 
            else:
                return {"message": "เข้าสู่ระบบสำเร็จ", "role": "user","token": access_token}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ไม่สามารถเข้าสู่ระบบได้ ชื่อหรือรหัสผ่านไม่ถูกต้อง",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาด: {str(e)}",
        )


@router.get("/protected/")
async def protected_route(user: dict = Depends(verify_access_token)):
    return {"message": f"สวัสดี, {user['firstname']}. คุณสามารถเข้าถึงเนื้อหานี้ได้"}


@router.post("/logout/") 
async def logout_user(response: Response):
    """
    ลบ JWT Token ออกจาก HttpOnly Cookie เพื่อออกจากระบบ.
    """
    try:
        response.delete_cookie(
            "access_token",
            path="/",
            domain=None,  # ตรวจสอบว่าเหมือนกับตอนตั้งค่า
            samesite="None",  # หรือปรับให้เหมาะสมกับการใช้งาน
            secure=True,
        )
        return {"message": "ออกจากระบบสำเร็จ"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาด: {str(e)}",
        )


@router.get("/me/")
async def get_user_profile(user: dict = Depends(verify_access_token)):
    """
    ดึงข้อมูลผู้ใช้ปัจจุบันจาก JWT Token.
    """
    return {
        "_id": str(user["_id"]),  # แปลง ObjectId เป็น string
        "email": user["email"],
        "firstname": user["firstname"],
        "lastname": user["lastname"],
        "profile_picture": user["profile_picture"],
        "phone_number": user["phone_number"],
        "role": user.get("role", "user"),  # ค่าเริ่มต้นเป็น "user" ถ้าไม่มีฟิลด์ role
        "address": user["address"],
        "invited": user.get("invite"),  # สามารถมีหรือไม่มีก็ได้
        "invited_users": user.get("invited_users", []),
        "random_result": user.get("random_result", None),  # เพิ่มฟิลด์ random_result (ค่าเริ่มต้นเป็น None หากไม่มี)
    }


@router.put("/update/")
async def update_user_profile(
    updated_data: dict,  # ข้อมูลที่ต้องการอัปเดต
    user: dict = Depends(verify_access_token)
):
    """
    อัปเดตข้อมูลผู้ใช้ปัจจุบันในฐานข้อมูล MongoDB
    """
    try:
        # ตรวจสอบว่ามีข้อมูลอะไรบ้างที่ส่งมาเพื่ออัปเดต
        valid_fields = {"firstname", "lastname", "profile_picture",
                        "phone_number", "address"}  # ฟิลด์ที่อนุญาตให้อัปเดต
        updates = {key: value for key, value in updated_data.items()
                   if key in valid_fields}

        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ไม่มีข้อมูลที่สามารถอัปเดตได้",
            )

        # ดึง email หรือ id ของ user ที่ login มา
        user_id = user["_id"]  # `_id` ของ user ที่ login มา

        # ตรวจสอบว่า user มีอยู่ในระบบจริงไหม
        existing_user = await user_collection.find_one({"_id": user_id})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ไม่พบข้อมูลผู้ใช้ในระบบ",
            )

        # ตรวจสอบว่าข้อมูลซ้ำหรือไม่
        if all(existing_user.get(key) == value for key, value in updates.items()):
            return {"message": "อัปเดตข้อมูลสำเร็จ (ไม่มีการเปลี่ยนแปลง)"}

        # ดำเนินการอัปเดตในฐานข้อมูล
        result = await user_collection.update_one(
            {"_id": user_id},  # ค้นหาโดย `_id` ของ user ที่ login มา
            {"$set": updates},  # ข้อมูลที่ต้องการอัปเดต
        )

        # ดึงข้อมูลที่อัปเดตแล้วส่งกลับ
        updated_user = await user_collection.find_one({"_id": user_id})
        updated_user["_id"] = str(updated_user["_id"])  # แปลง ObjectId เป็น string

        return {"message": "อัปเดตข้อมูลสำเร็จ",}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในการอัปเดตข้อมูล: {str(e)}",
        )


@router.post("/agreement/")
async def handle_agreement(data: AgreementRequest,user: dict = Depends(verify_access_token)):
    # ค้นหาผู้ใช้ในฐานข้อมูลตาม email
    user = await user_collection.find_one({"email": data.email})

    if not user:
        try:
            # ค้นหาผู้ใช้จาก _id
            user = await user_collection.find_one({"_id": ObjectId(data.email)})
        except Exception:
            raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

    # อัปเดตสถานะ agreement
    if data.agreement:
        update_data = {
            "agreement": True,
            "agreement_time": bangkok_time.isoformat()
        }
    else:
        update_data = {
            "agreement": False,
            "agreement_time": None
        }

    await user_collection.update_one(
        {"_id": user["_id"]},  # ใช้ _id ในการค้นหา
        {"$set": update_data}   # ข้อมูลที่จะอัปเดต
    )

    # ส่ง Response กลับไป
    return {
        "message": f"อัปเดต agreement สำหรับผู้ใช้ {data.email} สำเร็จ",
        "agreement": update_data["agreement"],
        "agreement_time": update_data["agreement_time"]
    }


@router.get("/agreement/status/")
async def check_agreement_status(email: str):
    """
    ตรวจสอบสถานะของ agreement สำหรับผู้ใช้จากอีเมล
    หากไม่พบผู้ใช้จากอีเมล, จะค้นหาด้วย _id
    """
    user = await user_collection.find_one({"email": email})

    if not user:
        # หากไม่พบผู้ใช้จากอีเมล, ให้ค้นหาด้วย _id
        try:
            user = await user_collection.find_one({"_id": ObjectId(email)})
        except Exception as e:
            raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

    agreement_status = user.get("agreement", False)
    agreement_time = user.get("agreement_time", None)

    return {
        "email": email,
        "agreement": agreement_status,
        "agreement_time": agreement_time
    }


# ข้อมูลผู้ใช้ทั้งหมด  user
@router.get("/all_users/")
async def get_all_users(user: dict = Depends(verify_access_token)):
    """
    ดึงข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
    """    
    # ตรวจสอบสิทธิ์ของผู้ใช้
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น",
        )
    
    try:
        # ดึงข้อมูลทั้งหมดจาก collection "users"
        users_cursor = user_collection.find({})
        users = []

        # ใช้ async for ในการวนลูปข้อมูลจาก cursor
        async for user_item in users_cursor:
            # แปลง ObjectId (_id) ให้เป็น string
            user_item["_id"] = str(user_item["_id"])
            users.append(user_item)

        # คืนค่าข้อมูลผู้ใช้ทั้งหมด
        return users

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"ไม่สามารถดึงข้อมูลได้: {str(e)}")


@router.post("/random_result/{user_id}")
async def generate_random_result_for_user(user_id: str):
    """
    ตรวจสอบว่า random_result มีหรือไม่ ถ้ามีแล้วไม่สุ่มใหม่ ถ้ายังไม่มีสุ่มแล้วบันทึกในเอกสารของผู้ใช้ตาม _id.
    """
    try:
        # แปลง user_id เป็น ObjectId
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # ค้นหาเอกสารของผู้ใช้ในฐานข้อมูล
    user = await user_collection.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

     # ดึงจำนวนชุดทั้งหมด
    count_set = await get_set_count()  # เรียก get_set_count() ด้วย await
    print(f"count_set from get_set_count: {count_set}")  # เพิ่มการพิมพ์ค่าที่ได้รับจาก get_set_count
    
    # ตรวจสอบว่า random_result มีอยู่ในฐานข้อมูลหรือยัง
    if user.get("random_result") is not None:
        # ถ้ามี random_result และไม่เป็น None ก็ไม่ต้องสุ่มใหม่
        return {"user_id": user_id, "random_result": user["random_result"], "message": "ข้อมูลเคยสุ่มไว้แล้ว"}

   # ตรวจสอบว่า count_set เป็น dictionary และเข้าถึงค่า set_count
    try:
        count_set_value = int(count_set.get("set_count", 0))  # ดึงค่า set_count และแปลงเป็น int
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid count_set value, expected a number. Error: {e}")

    # ตรวจสอบว่า count_set มีค่ามากกว่าหรือเท่ากับ 1 ก่อนการสุ่ม
    if count_set_value > 0:
        random_result = random.randint(1, count_set_value)
    else:
        raise HTTPException(status_code=400, detail="Invalid count_set value")

    # อัปเดตค่า random_result ในฐานข้อมูล
    await user_collection.update_one(
        {"_id": user_object_id},
        {"$set": {"random_result": random_result}},
        upsert=True
    )

    return {"user_id": user_id, "random_result": random_result, "count_set": count_set}

@router.get("/random_result/{user_id}")
async def get_random_result_for_user(user_id: str):
    """
    ดึงค่าผลลัพธ์ random_result ของผู้ใช้จาก _id.
    """
    try:
        # แปลง user_id เป็น ObjectId
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # ใช้ await กับ find_one
    user = await user_collection.find_one({"_id": user_object_id})
    if not user or "random_result" not in user:
        raise HTTPException(status_code=404, detail="No random result found for this user")

    return {"user_id": user_id, "random_result": user["random_result"]}

@router.post("/uploadimg/")
async def upload_image(
    id: str,  # รับค่า id ของผู้ใช้
    file: UploadFile = File(...),
    user: dict = Depends(verify_access_token)
):
    # ตรวจสอบว่าโฟลเดอร์สำหรับอัปโหลดมีอยู่หรือไม่ หากไม่มีให้สร้าง
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    # ตรวจสอบว่า id เป็น ObjectId ที่ถูกต้องหรือไม่
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # ค้นหาข้อมูลผู้ใช้ในฐานข้อมูล
    user = await user_collection.find_one({"_id": ObjectId(id)})
    if not user:  # หากไม่พบผู้ใช้
        raise HTTPException(status_code=404, detail="User not found")

    # ลบไฟล์รูปภาพเก่า (ถ้ามี)
    old_file_location = user.get("profile_picture")
    if old_file_location and os.path.exists(old_file_location):
        os.remove(old_file_location)

    # สร้างชื่อไฟล์ใหม่โดยใช้ id ของผู้ใช้และนามสกุลเดิม
    file_extension = os.path.splitext(file.filename)[1]  # ดึงนามสกุลไฟล์เดิม
    new_filename = f"{id}{file_extension}"  # ตั้งชื่อไฟล์ใหม่เป็น id + นามสกุล
    file_location = os.path.join(UPLOAD_FOLDER, new_filename)

    # เขียนไฟล์ลงในระบบ
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ค้นหาและอัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
    result = await user_collection.update_one(
        {"_id": ObjectId(id)},  # ค้นหาด้วย id
        {"$set": {"profile_picture": file_location}}  # อัปเดต path ของไฟล์
    )

    if result.matched_count == 0:  # ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "message": "File uploaded successfully and profile updated",
        "filename": file.filename,
        "file_location": file_location
    }


def send_email(to_email: str, subject: str, body: str):
    sender_email = GMAIL_USER
    sender_password = APP_PASSWORD

    # Email setup
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

   # Send email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

# # Forgot Password Endpoint

# # Reset Password Endpoint


# สร้างรหัสยืนยัน

def generate_verification_code():
    return random.randint(100000, 999999)  # 6 หลัก


@router.post("/password-reset/request/")
async def request_password_reset(email: str):
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีนี้อยู๋ในระบบ")

    # สร้างรหัสและกำหนดเวลาหมดอายุ
    code = generate_verification_code()

    # เพิ่ม 15 นาทีในการหมดอายุ
    expire_time = datetime.utcnow() + timedelta(minutes=15)
    # expire_time = bangkok_time + timedelta(minutes=15)

    # แสดงเวลาในรูปแบบพร้อม timezone
    print("Bangkok Time:", bangkok_time.isoformat())  # เวลาปัจจุบันในกรุงเทพฯ
    print("Expire Time:", expire_time.isoformat())  # เวลา +15 นาที

    # อัปเดตฐานข้อมูล
    await user_collection.update_one(
        {"email": email},
        {"$set": {"reset_code": code, "reset_code_expiry": expire_time}}
    )

    # ส่งอีเมล
    subject = "Password Reset Code"
    body = f"""
    <p>เรียน คุณ {email},</p>
    <p>รหัสรีเซ็ตรหัสผ่านของคุณคือ:</p>
    <h2>{code}</h2>
    <p>โค้ดนี้จะหมดอายุใน 15 นาที</p>
    """
    send_email(email, subject, body)

    return {"message": "รหัสรีเซ็ตถูกส่งไปที่อีเมลของคุณ"}


@router.post("/password-reset/verify/")
async def verify_reset_code(email: str, code: int):
    # ค้นหาผู้ใช้ในฐานข้อมูล
    user = await user_collection.find_one({"email": email})

    if not user:
        # หากไม่พบผู้ใช้ ให้ส่ง Error 404
        raise HTTPException(
            status_code=404, detail="ไม่พบผู้ใช้ในระบบ กรุณาตรวจสอบอีเมลของคุณ")

    if "reset_code" not in user:
        # หากไม่มี reset_code ในข้อมูลผู้ใช้
        raise HTTPException(
            status_code=400, detail="ไม่สามารถรีเซ็ตรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่")

    # ตรวจสอบรหัส OTP และเวลาหมดอายุ
    if user["reset_code"] != code:
        # หากรหัส OTP ไม่ถูกต้อง
        raise HTTPException(
            status_code=400, detail="รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่")

    if datetime.utcnow() > user["reset_code_expiry"]:
        # หากรหัส OTP หมดอายุ
        raise HTTPException(
            status_code=400, detail="รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่")

    # หากรหัสถูกต้อง
    return {"message": "ยืนยันรหัสสำเร็จ คุณสามารถตั้งรหัสผ่านใหม่ได้แล้ว"}


@router.post("/password-reset/change-password/")
async def change_password(email: str, newpassword: str):
    # ค้นหาผู้ใช้จากอีเมล
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีผู้ใช้งาน")

    # แปลงรหัสผ่านเป็น hash ก่อนบันทึก
    hashed_password = hash_password(newpassword)

    # อัปเดตรหัสผ่านในฐานข้อมูล
    update_result = await user_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed_password, "updated_at": bangkok_time.isoformat()}}
    )

    # ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่
    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=500, detail="เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน")

    return {"message": "รีเซ็ตรหัสผ่านสำเร็จ"}

    
@router.post("/fetch_invite", response_model=CountAbove50Response)
async def fetch_invite_user(email_list: EmailList,
                            user: dict = Depends(verify_access_token)):
    count_above_50 = 0

    for email in email_list.emails:
        user = await user_collection.find_one({"email": email})
        if user:
            record = user.get("sum_record", 0)
            if isinstance(record, int) and record >= 50:
                count_above_50 += 1
    return CountAbove50Response(count_above_50=count_above_50)


    
@router.get("/invites_rank", response_model=List[UserInvites])
async def get_invites_rank():
    users = await user_collection.find().to_list(length=None)
    rank_list = []

    for user in users:
        invited_users = user.get("invited_users", [])
        if invited_users:  # Check if invited_users is not empty
            invite_count = 0
            valid_invited_users = []
            for invited_user_email in invited_users:
                invited_user = await user_collection.find_one({"email": invited_user_email})
                if invited_user and invited_user.get("sum_record", 0) >= 50:
                    invite_count += 1
                    valid_invited_users.append(invited_user_email)
            rank_list.append({
                "name": user.get("firstname", "Unknown"),
                "invite_count": invite_count,
                "invited_users": valid_invited_users
            })

    # Sort the rank list by invite_count in descending order
    rank_list.sort(key=lambda x: x["invite_count"], reverse=True)

    return rank_list

