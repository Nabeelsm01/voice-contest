import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import config from "../../../config";

const SlidebarUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะต้องเข้าสู่ระบบอีกครั้งหลังจากออกจากระบบ!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${config.apiBaseUrl}/user/logout/`, {
            method: "POST",
            credentials: "include", // ส่งคุกกี้ไปกับคำขอ
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data);
            Swal.fire({
              title: "ออกจากระบบสำเร็จ!",
              text: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              timerProgressBar: true,
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            console.error("ไม่สามารถออกจากระบบได้:", response.statusText);
            Swal.fire({
              title: "เกิดข้อผิดพลาด!",
              text: "ไม่สามารถออกจากระบบได้",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            icon: "error",
          });
        }
      }
    });
  };


  return (
    <div className="flex  shadow-lg">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg py-2 px-4 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <div className="flex items-center mb-6 ">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none "
          >
            <i
              className={`fas ${
                isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
              }`}
            ></i>
          </button>
        </div>

        {/* Admin Section */}
        {/* <div className="flex items-center mb-6">
          <span
            className={`ml-4 text-red-500 text-2xl font-bold transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            admin
          </span>
        </div> */}

        {/* Navigation */}
        <nav>
          <ul className="space-y-9">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                <i className="fas fa-tachometer-alt w-10 text-center"></i>
                <span
                  className={`ml-4  transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  แดชบอร์ด
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/input_script"
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                {/* <i className="fas fa-tachometer-alt w-10 text-center"></i> */}
                <i className="fa-solid fa-file-circle-plus w-10 text-center"></i>

                <span
                  className={`ml-4  transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  เพิ่มข้อมูลสคริป
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                <i className="fas fa-users w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  รายชื่อผู้ใช้
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/all_sound"
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                <i className="fas fa-folder-open w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ประวัติบันทึกเสียง
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fa-solid fa-house-user w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  เว็บไซต์
                </span>
              </Link>
            </li>
            <li>
              <Link
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                <i className="fas fa-sign-out-alt w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ออกจากระบบ
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default SlidebarUser;
