import React from "react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import config from "../../config";


const OTP = ({ otp, reset, email }) => {
    const [otpNumber, setOtpNumber] = useState(["", "", "", "", "", ""]);
    const [message, setMessage] = useState(""); // State for success/error message

    useEffect(() => {
        console.log("email",
            email)
    },
        [email])

    const handleChange = (value, index) => {
        // อนุญาตเฉพาะตัวเลข
        if (/^\d?$/.test(value)) {
            const newOtp = [...otpNumber];
            newOtp[index] = value;
            setOtpNumber(newOtp);

            // ย้าย focus ไปยังช่องถัดไปถ้ามี
            if (value && index < otpNumber.length - 1) {
                document.getElementById(`otpNumber-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpNumber[index] && index > 0) {
            // ย้อนกลับไปยังช่องก่อนหน้าเมื่อกด Backspace
            document.getElementById(`otpNumber-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages
        const otpValue = otpNumber.join(""); // รวมค่าจากทุกช่อง

        if (otpValue.length !== 6) {
            Swal.fire("กรุณากรอกเลข OTP ให้ครบ 6 หลัก", "", "warning");
            return;
        }

        try {
            // เรียก API เพื่อส่ง OTP และ email ไปตรวจสอบ
            const response = await fetch(
                `${config.apiBaseUrl}/user/password-reset/verify/?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otpValue)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                //Swal.fire("สำเร็จ!", data.message, "success");
                setMessage("OTP ถูกต้อง"); // แสดงข้อความ success
                Swal.fire({
                          icon: "success",
                          title: "สำเร็จ!",
                          text: "OTP ถูกต้อง",
                          showConfirmButton: false,
                          allowOutsideClick: true, // ปิดการคลิกพื้นที่ว่าง
                          allowEscapeKey: false,    // ปิดการกด Escape
                          timer: 1500,              // ตั้งเวลา popup หายไปอัตโนมัติ (ms)
                          timerProgressBar: true,   // แสดงแถบความคืบหน้า
                        }).then(() => {
                            reset(); // เรียกฟังก์ชัน reset

                        });
              // เพิ่มการกระทำหลังจาก OTP ถูกต้อง เช่น เปลี่ยนหน้า
                console.log("OTP Verified:", data);
                //redirectToResetPage(); // ฟังก์ชันเปลี่ยนหน้า (สมมติว่าคุณมี)
            } else {
                const errorData = await response.json();
                setMessage(errorData.detail || "ไม่สามารถยืนยัน OTP ได้"); // แสดงข้อความ error
                //Swal.fire("ผิดพลาด!", errorData.detail || "ไม่สามารถยืนยัน OTP ได้", "error");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
        }
    };

    const handleResendOTP = async () => {
        setMessage("กำลังส่งรหัส OTP..."); // แจ้งให้ผู้ใช้ทราบว่ากำลังดำเนินการ
        try {
            const url = `${config.apiBaseUrl}/user/password-reset/request/?email=${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                setMessage("ส่งรหัส OTP ใหม่แล้ว"); // แจ้งว่า OTP ถูกส่งแล้ว
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.detail || "Failed to resend OTP. Please try again.";
                setMessage(errorMessage); // แสดง error message
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6"
            onClick={otp}
        >
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()} >

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-20 h-20"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-center text-xl font-semibold text-red-500 mb-2">Check your mail</h2>
                <p className="text-center text-gray-600 mb-6">
                    We just sent an OTP to your registered email address
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <div className="flex gap-2 mb-4">
                        {otpNumber.map((digit, index) => (
                            <input
                                key={index}
                                id={`otpNumber-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-10 h-10 border border-gray-300 text-center text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-600"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white py-2 rounded-lg shadow hover:bg-red-600 hover:border-red-500 focus:outline-none transition duration-200"
                    //onClick={reset}
                    >
                        Verify OTP
                    </button>
                </form>
                {message && (
                    <p
                        className={`text-center mt-4 text-sm ${message.includes("error") || message.includes("หมดอายุ") || message.includes("ลองใหม่")
                            ? "text-red-500" // สีแดงสำหรับ error
                            : "text-green-500" // สีเขียวสำหรับ success
                            }`}
                    >
                        {message}
                    </p>
                )}
                {/* Request OTP Again Button */}
                <div className="text-center mt-6">
                    <span onClick={handleResendOTP} className="text-sm text-blue-500 hover:underline cursor-pointer">
                        Request OTP Again
                    </span>
                </div>
                {/* Back to Login */}
                <div className="text-center mt-6">
                    <a
                        className="text-sm text-gray-500 hover:underline cursor-pointer"
                        onClick={otp}
                    >
                        &larr; Return to the login screen
                    </a>

                </div>
            </div>
        </div>
    );
};

export default OTP;