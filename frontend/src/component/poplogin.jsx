import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2'

import "../style/popup.css";
import '../style/register.css';
import RegisterModal from "./popregister";
import config from "../../config";


const LoginModal = ({ register, login, forgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const invite = localStorage.getItem('invite');

  // const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  // const FACEBOOK_REDIRECT_URI = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;

  const handleLogin = async () => {
    try {
      const url = `${config.apiBaseUrl}/user/login/`;

      const payload = {
        email,
        password,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("เข้าสู่ระบบสำเร็จ");
        login(); // ปิด modal
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: "เข้าสู่ระบบสำเร็จแล้ว",
          showConfirmButton: false,
          allowOutsideClick: true, // ปิดการคลิกพื้นที่ว่าง
          allowEscapeKey: false,    // ปิดการกด Escape
          timer: 1500,              // ตั้งเวลา popup หายไปอัตโนมัติ (ms)
          timerProgressBar: true,   // แสดงแถบความคืบหน้า
        }).then(() => {
          // เปลี่ยนเส้นทางตาม role
          if (data.role === "admin") {
            window.location.href = "/admin/dashboard"; // เปลี่ยนหน้าไปยังแดชบอร์ดของ admin
          } else if (data.role === "user") {
            window.location.reload(); // เปลี่ยนหน้าไปยังหน้าแรกของ user
          } else {
            console.error("Unknown role:", userRole);
            setMessage("ไม่สามารถระบุบทบาทของผู้ใช้ได้");
          }
        });
      }
      else if (response.status === 401) {
        setMessage("ชื่อหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setMessage("โปรดกรอกชื่อหรือรหัสผ่าน");
      }
    } catch (error) {
      console.error(error);
      setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };



  return (
    <div>
      {/* Modal */}
      <div onClick={login}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      >
        {" "}
        {/*  ปิด Modal เมื่อคลิกด้านนอก*/}
        <div
          className="card bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {" "}
          {/* หยุดการคลิกด้านใน */}

          {/* ไอคอนปิด */}
          <button
            onClick={login}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-red-500">Login</h1>
          <p className="mb-6 text-gray-500">
            Welcome to Call Voice Recording
          </p>
          {/* ฟอร์มล็อกอิน */}
          {/* <form >  */}
          <div className="form-group mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2 ">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700 bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* ข้อความแจ้งเตือน */}
          {message && <p className="text-red-500 text-sm mb-4">{message}</p>}
          {/* ปุ่มล็อกอิน */}
          <div className="button-group mb-6 flex gap-4">
            <button
              type="submit"
              onClick={handleLogin}
              className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200 hover:border-red-700"
            >
              Login
            </button>

            <button
              type="register"
              className="w-1/2 text-center text-black py-2 rounded-lg transition duration-200 bg-gray-100 hover:border-gray-200"
              onClick={register}
            >
              Register
            </button>
          </div>
          {/* ลิงก์สำหรับลืมรหัสผ่าน */}
          <div className="links mb-6">
            <a className="text-sm text-blue-500 hover:underline"
              onClick={forgot}>
              Forgot login or password?
            </a>
          </div>
          {/* ปุ่มเข้าสู่ระบบผ่าน Social */}
          <div className="social-login flex flex-col gap-2">
            <div className="flex justify-center">
              <button
                className="flex items-center justify-center w-full py-2 px-8 bg-gray-100 text-black rounded-lg text-center hover:border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                aria-label="Sign in with Google"
                onClick={() => {
                  window.location.href = `${config.apiBaseUrl}/user/auth/google/login?invite=${invite}`; // เปลี่ยน URL เป็นของ backend ของคุณ
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                <span className="pl-8">Sign in with Google</span>
              </button>
            </div>
            {/* <div className="flex justify-center">
              <button
                className="flex items-center justify-center space-x-4 w-full py-2 px-4 bg-gray-100 text-black rounded-lg text-center 
                               hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                aria-label="Sign in with Facebook"
                onClick={() => {
                  window.location.href = `${config.apiBaseUrl}/user/auth/facebook/login`;
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="facebookGradient"
                      x1="9.993"
                      x2="40.615"
                      y1="9.993"
                      y2="40.615"
                    >
                      <stop offset="0" stopColor="#007ad9"></stop>
                    </linearGradient>
                  </defs>
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="url(#facebookGradient)"
                  ></circle>
                  <path
                    fill="#fff"
                    d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 
                                   c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 
                                   C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"
                  ></path>
                </svg>
                <span>Sign in with Facebook</span>
              </button>
            </div> */}
            <div id="message" className="text-center text-gray-700 mt-4">
              {message && <span>{message}</span>}
            </div>
          </div>
          {/* </form> */}
        </div>
      </div>
      {/* )} */}
      {/*= {isRegisterModalOpen && <RegisterModal />} */}
    </div>
  );
};


export default LoginModal;