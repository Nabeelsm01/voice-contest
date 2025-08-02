import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";

import config from '../../config';
import Swal from "sweetalert2";

const RegisterModal = ({ isOpen, aqree, login, put,Invite }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [searchParams] = useSearchParams();
  const [invite, setInvite] = useState("");
  // console.log(invite);

  useEffect(() => {
    // ดึงค่า invite จาก URL ถ้ามี
    let inviteCode = searchParams.get("invite");

    // ถ้าไม่มีใน URL ให้ใช้ค่าจาก localStorage แทน
    if (!inviteCode) {
      inviteCode = localStorage.getItem("invite") || "";
    }

    // อัปเดตค่า invite และบันทึกลง localStorage
    setInvite(inviteCode);
    if (inviteCode) {
      localStorage.setItem("invite", inviteCode);
    }
  }, [searchParams]);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!firstname || !lastname || !email || !phoneNumber || !password || !confirmPassword) {
      setResponseMessage('กรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      setResponseMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (email === invite) {
      setResponseMessage('Email และ Invite ไม่สามารถเหมือนกันได้');
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/user/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          phone_number: phoneNumber,
          email: email,
          password: password,
          profile_picture: "",
          invite: invite,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.message);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: "สมัครสมาชิกสำเร็จแล้ว",
          showConfirmButton: false,
          allowOutsideClick: false, // ป้องกันการคลิกพื้นที่ว่าง
          allowEscapeKey: false,   // ป้องกันการกด Escape
          timer: 1500,             // แสดง popup 1.5 วินาที
          timerProgressBar: true,
        }).then(() => {
          aqree();
          isOpen();

        });
      } else {
        const error = await response.json();
        const errorMessage = error.detail.split(": ").pop(); // แยกข้อความหลังจากเครื่องหมาย ": "
        console.log(errorMessage);
        setResponseMessage(errorMessage);
      }
    } catch (error) {
      setResponseMessage('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return ( // มี responsive เกือบทั้งหมด
    <div onClick={isOpen} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">  {/* Modal ถ้ากดด้านนอกจะปิด */}
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal ถ้ากดปุ่มจะปิด */}
        <button
          onClick={isOpen}
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

        <h2 className="text-center text-red-500 text-2xl font-bold mb-2">Register</h2>
        <p className="text-center text-gray-600 mb-4">Create your account</p>
        {/*   แบบฟอร์มการสมัคร   */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="firstname" className="block text-gray-700">First Name</label>
            <input
              type="text"
              id="firstname"
              placeholder="First Name"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="lastname" className="block text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastname"
              placeholder="Last Name"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                put(e.target.value);
              }}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              placeholder="Phone Number"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="invite" className="block text-gray-700">Invite</label>
            <input
              type="Email"
              id="invite"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-700"
              value={invite}
              onChange={(e) => {
                setInvite(e.target.value);
                Invite(e.target.value);
              }
              }
            />
          </div>


          {responseMessage && (
            <p
              className={`text-sm mt-2 ${responseMessage.includes('ไม่สามารถเชื่อมต่อกับ Server ได้') || responseMessage === 'กรอกข้อมูลให้ครบทุกช่อง' || responseMessage === 'รหัสผ่านไม่ตรงกัน' ||responseMessage === 'อีเมลนี้ถูกใช้งานแล้ว' || responseMessage === 'Email และ Invite ไม่สามารถเหมือนกันได้'
                ? 'text-red-500'
                : 'text-green-500'
                }`}
            >
              {responseMessage}
            </p>
          )}

          <div className="flex justify-between space-x-4 mt-4">
            <button
              type="button"
              onClick={login}
              className="w-full text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:border-gray-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 rounded-md hover:border-red-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
