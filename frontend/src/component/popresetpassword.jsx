import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import config from "../../config";


const ResetPass = ({ otp, reset,email }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  console.log("email", email)

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบถ้วน", "", "warning");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("รหัสผ่านไม่ตรงกัน", "", "error");
      return;
    }

    try {
      // เรียก API Reset Password
      const response = await fetch(
        `${config.apiBaseUrl}/user/password-reset/change-password/?email=${email}&newpassword=${password}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
                  icon: "success",
                  title: "สำเร็จ!",
                  text: "รีเซ็ตรหัสผ่านสำเร็จ",
                  showConfirmButton: false,
                  allowOutsideClick: true, // ปิดการคลิกพื้นที่ว่าง
                  allowEscapeKey: false,    // ปิดการกด Escape
                  timer: 1500,              // ตั้งเวลา popup หายไปอัตโนมัติ (ms)
                  timerProgressBar: true,   // แสดงแถบความคืบหน้า
                }).then(() => {
                  reset();
                });
      } else {
        Swal.fire(data.detail || "เกิดข้อผิดพลาด", "", "error");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      Swal.fire("เกิดข้อผิดพลาดในการเชื่อมต่อ", "", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6"
      onClick={reset} >

      {/* กดด้านนอกปอปอัปจะปิด */}
      <div
        className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full "
        onClick={(e) => e.stopPropagation()} >
        {/* กดพิมพ์ได้ */}
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
              />
            </svg>
          </div>
        </div>
        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-red-500 mb-2">
          Reset your password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your password to reset it!
        </p>
        {/* Form */}
        <form className="p-5" onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white text-gray-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your confirm password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white text-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg shadow hover:bg-red-600 hover:border-red-500 focus:outline-none transition duration-200"
          >
            Reset
          </button>
        </form>
        {/* Back to Login */}
        <div className="text-center mt-6">
          <a
            className="text-sm text-gray-500 hover:text-red-500"
            onClick={reset}
          >
            &larr; Return to the login screen
          </a>
        </div>
      </div>
    </div>
  );
};
export default ResetPass;
