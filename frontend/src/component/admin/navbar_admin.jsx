import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; // นำเข้า useLocation
import "../../index.css";
import config from "../../../config";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false); // สถานะของเมนู (เปิดหรือปิด)
  const menuRef = useRef(null); // การอ้างอิงถึงเมนู
  const buttonRef = useRef(null);
  const location = useLocation(); // ใช้ useLocation เพื่อฟังการเปลี่ยนแปลงของ URL
  const [user, setUser] = useState({}); // ข้อมูลผู้ใช้
  const [error, setError] = useState(null); // ข้อผิดพลาดในการดึงข้อมูล
  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // เปลี่ยนสถานะของเมนู
  };

  // ปิดเมนูเมื่อคลิกนอกเมนู
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false); // ปิดเมนูถ้ามีการคลิกนอก
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // เพิ่ม event listener สำหรับคลิก
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // ลบ event listener เมื่อคอมโพเนนต์ถูกลบ
    };
  }, []);

  // รีเซ็ตสถานะเมนูเมื่อ URL เปลี่ยนแปลง
  useEffect(() => {
    setMenuOpen(false); // ปิดเมนูเมื่อมีการเปลี่ยนหน้า
  }, [location]);

    // ดึงข้อมูลโปรไฟล์ผู้ใช้เมื่อ component ถูกโหลด
    useEffect(() => {
      const fetchUser = async () => {
        try {
          // ส่งคำขอไปยัง API เพื่อนำข้อมูลผู้ใช้
          const response = await fetch(`${config.apiBaseUrl}/user/me/`, {
            method: "GET",
            credentials: "include", // ส่งคุกกี้ไปยังเซิร์ฟเวอร์
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data); // เซ็ตข้อมูลผู้ใช้ที่ดึงมาได้
            setError(null); // ล้างข้อผิดพลาดถ้าดึงข้อมูลสำเร็จ
          } else {
            console.error("Failed to fetch user");
            setError("ไม่สามารถโหลดข้อมูลแอดมินได");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        }
      };
  
      fetchUser();
    }, []); // ทำงานครั้งเดียวเมื่อ component ถูก mount

  return (
    <header className="bg-white shadow py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex space-x-6">
          <div className="relative">
            {/* ปุ่ม Hamburger (ปุ่มสามเส้น) */}
            {/* <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="p-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </button> */}

            {/* เมนูที่เลื่อนขึ้นมา */}
            <div
              ref={menuRef}
              className={`absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out 
                ${menuOpen
                  ? "opacity-100 translate-y-0" // ถ้าเมนูเปิด จะมีความทึบและเลื่อนขึ้นมา
                  : "opacity-0 -translate-y-4 pointer-events-none" // ถ้าเมนูปิด จะโปร่งใสและไม่สามารถคลิกได้
                }`}
            >
              <ul className="p-4 space-y-2">
                <li>
                  <Link
                    to="/"
                    className=" text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                  >
                    <span>🏠</span>
                    <span>หน้าแรก</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className=" text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                  >
                    <span>📜</span>
                    <span>ประวัติบันทึกเสียง</span>
                  </a>
                </li>
                <li>
                  <Link
                    to="profile"
                    className=" text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                  >
                    <span>👤</span>
                    <span>โปรไฟล์</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className=" text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>ออกจากระบบ</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* โลโก้และชื่อแบรนด์ */}
          <div className="text-red-500 text-2xl font-bold">
            admin
          </div>

        </div>
        <div className="flex items-center space-x-2">
        <span className="text-[11px] md:text-sm text-gray-600 text-end">
              สวัสดี,
              <strong>
                {" "}
                {user.firstname} {user.lastname}
              </strong>
            </span>
          {/* <span className="text-lg font-bold text-gray-600 mr-4">Admin</span>  border border-red-500 */}
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-500">
            <img
              src="/src/assets/112.png"
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;