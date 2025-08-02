from fastapi import FastAPI
from .routers import user
from .routers.script import script_router  # Import script router
from .routers.list_set import list_router  # Import script router
from .routers.list_script import list_script_router  # Import script router
from .routers.record_file import record_router  # Import script router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()
#app = FastAPI(docs_url=None, redoc_url=None)


origins = [
    "http://localhost:8000", # Backend
    "http://127.0.0.1:8000",
    "https://localhost:5173",  # ใส่ origin ที่อนุญาต
    "http://localhost:5173"   # สำหรับทั้ง http และ https
    "http://localhost:8080",
    "http://localhost:3000",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # อนุญาตเฉพาะโดเมนที่ระบุ
    allow_credentials=True,
    allow_methods=["*"],  # อนุญาตทุก Method (GET, POST, PUT, DELETE ฯลฯ)
    allow_headers=["*"],  # อนุญาตทุก Header
)

app.include_router(user.router)
# app.include_router(script.router)  # เรียกใช้ script.router
app.include_router(script_router)
app.include_router(list_router)
app.include_router(list_script_router)
app.include_router(record_router)

app.mount("/uploads_images", StaticFiles(directory="../uploads_images"), name="uploads_images")


@app.get("/")
async def root():
    return {"message": "Hello World"}

# @app.on_event("startup")    #บรรทัดเช็คว่าเชื่อมกับฐานข้อมูลได้ไหม
# async def test_db_connection():
#     try:
#         await script_collection.insert_one({"test": "connection"})
#         print("MongoDB connection: OK")
#     except Exception as e:
#         print(f"MongoDB connection error: {str(e)}")
