import React, { useState, useEffect } from "react";

import config from "../../config";

const ForgetPassword = ({ forgot, otp, put }) => {
    const [email, setEmail] = useState(""); // State for email input
    const [message, setMessage] = useState(""); // State for success/error message
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        console.log("email", email)
    }, [email])


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages
        setLoading(true); // เริ่มโหลด

        try {
            // สร้าง URL พร้อม query string
            const url = `${config.apiBaseUrl}/user/password-reset/request/?email=${encodeURIComponent(email)}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessage("รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว"); // แสดงข้อความ success
                otp();
            } else {
                const errorData = await response.json();
                const errorMessage =
                    errorData.detail && typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Failed to send reset code.";
                setMessage(errorMessage); // แสดงข้อความ error
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false); // หยุดโหลดเมื่อ API ตอบกลับ
        }
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6"
            onClick={forgot}> {/* กดด้านนอกปอปอัปจะปิด */}
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full "
                onClick={(e) => e.stopPropagation()} >  {/* กดพิมได้ */}
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
                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-center text-xl font-semibold text-red-500 mb-2">
                    Forget your password?
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email to reset it!
                </p>

                {/* Form */}
                <form className="p-5" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                            E-mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                put(e.target.value);
                            }} // Update state
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white text-gray-600"
                            required
                            disabled={loading} // ป้องกันการเปลี่ยนค่าระหว่างโหลด
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white py-2 rounded-lg shadow hover:bg-red-600 focus:outline-none transition duration-200 flex justify-center items-center"
                        disabled={loading} // ป้องกันการกดซ้ำ
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                กรุณาลองสักครู่...
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </button>

                    <a className="text-sm text-gray-500 hover:text-red-500 cursor-pointer" onClick={forgot}>
                        &larr; Return to the login screen
                    </a>
                </form>
                {/* Message Display */}
                {message && (
                    <p
                        className={`text-center mt-4 text-sm ${message.includes("error") || message.includes("Failed") || message.includes("ไม่พบ")
                            ? "text-red-500" // สีแดงสำหรับ error
                            : "text-green-500" // สีเขียวสำหรับ success
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>

        </div>
    );
};

export default ForgetPassword;