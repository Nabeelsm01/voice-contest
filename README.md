# Record_Voice
📁 Project: Voice Recorder Web App 
แอปบันทึกเสียงด้วยเบราว์เซอร์ แยกฝั่ง Frontend (React/Vite) และ Backend (FastAPI)

📦 Requirements
Node >= v20.15.0 ,
Python >= 3.12.0 ,
npm / pip ,
Git

📂 โครงสร้างโปรเจค
voice-contest/
├── frontend/        # React + Vite ,
├── backend/         # FastAPI ,
└── README.md 

🚀 การติดตั้งและรันโปรเจค
1. Frontend (React + Vite)
cd frontend ,
npm install           # ติดตั้ง dependencies /package.json ,
npm run dev           # รัน dev server ที่ https://localhost:5173/ ,

2. Backend (FastAPI + Uvicorn)
cd backend ,
pip install -r requirements.txt  # ติดตั้ง dependencies /requirements.txt ,
env/scripts/activate             # เข้า .env  ,
uvicorn app.main:app --reload    # รัน db mongodb ที่ http://127.0.0.1:8000/docs#/ ,


❗ หมายเหตุสำคัญ
ห้าม อัพโหลดไฟล์ .env และ config.py ขึ้น GitHub เพราะเป็นไฟล์เก็บข้อมูลความลับ เช่น รหัสผ่าน คีย์ลับ URL ฯลฯ
ห้าม อัพโหลดไฟล์ config.py ที่มีการเก็บหรือกำหนดค่าความลับโดยตรง (ถ้ามี) ขึ้น GitHub เพื่อป้องกันข้อมูลรั่วไหล
ให้เก็บไฟล์ .env และไฟล์ที่มีข้อมูลสำคัญไว้ในเครื่องของคุณเท่านั้น
สำหรับคนที่ clone โปรเจค ให้ใช้ .env.example เป็นตัวอย่าง แล้วสร้าง .env ของตัวเองตามนั้น

ตัวอย่างไฟล์ .env 
SECRET_KEY=supersecretkey ,
MONGO_DETAILS=mongodb://localhost:27017/mydb ,

ตัวอย่างไฟล์ config.py
SECRET_KEY=your_secret_key_here ,
MONGO_DETAILS=your_mongodb_connection_string_here ,
GOOGLE_CLIENT_ID=your_google_client_id ,
GOOGLE_CLIENT_SECRET=your_google_client_secret ,
FACEBOOK_CLIENT_ID=your_facebook_client_id ,
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret ,
FRONTEND_URL=https://localhost:5173
BACKEND_URL=http://localhost:8000
GMAIL_USER=your_email@gmail.com
APP_PASSWORD=your_gmail_app_password
