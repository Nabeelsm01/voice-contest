import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import config from "../../../config";
import ProfilePage from "./pages/profile";
import { useAuth } from '../../context/authcontext'; // นำเข้า useAuth

const SlidebarUser = () => {
  //const { user, error } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null); // เพิ่มสถานะสำหรับบันทึกข้อผิดพลาด
  const { isAuthenticated, user, isLoading } = useAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch(`${config.apiBaseUrl}/user/me/`, {
  //         method: "GET",
  //         credentials: "include", // Cookie ถูกส่งไปยัง server
  //       });
  //       if (response.ok) {
  //         const data = await response.json();
  //         setUser(data);
  //         setError(null); // ล้างข้อผิดพลาดถ้าดึงข้อมูลสำเร็จ
  //       } else {
  //         console.error("Failed to fetch user");
  //         setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user profile:", error);
  //       setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
  //     }
  //   };
  //   fetchUser();
  // }, []);

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
            //console.log(data);
            Swal.fire({
              title: "ออกจากระบบสำเร็จ!",
              text: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              timerProgressBar: true,
            }).then(() => {
              localStorage.removeItem("authToken");
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

  if (error) {
    // แสดงข้อความข้อผิดพลาดเมื่อเกิดปัญหา
    return <div className="flex items-center justify-center h-full"></div>;
  }

  if (!user) {
    // แสดงข้อความหรือโหลดดิ้งระหว่างดึงข้อมูล
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600"></p>
      </div>
    );
  }

  return (
    <div className="flex ">
      {/* Sidebar */}
      <aside
        className={` bg-white py-2 px-4 transition-all duration-300 
        ${isSidebarOpen ? "w-64" : "w-20"} hidden md:block`}
      >
        <div className="flex items-center mb-6 "> 
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-600  text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <i
              className={`fas ${
                isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
              }`}
            ></i>
          </button>
        </div>

        <nav>
          <ul className="space-y-8 p-2">
            <li className="relative group">
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fa-solid fa-house w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  หน้าหลัก
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-8 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 หน้าหลัก
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                to="/profile"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fas fa-user w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-2 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  โปรไฟล์
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-4 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  โปรไฟล์
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                to="/user/history"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fas fa-folder-open w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-3 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ประวัติบันทึกเสียง
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-8 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  ประวัติบันทึกเสียง 
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                to="/setting-record-voice"
                className="flex items-center text-gray-700 hover:text-red-500 "
              >
               <i className="fa-solid fa-sliders w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-10 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  การตั้งค่าเสียง
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-5 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 การตั้งค่าเสียง
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                to="/leaderboard"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fa-solid fa-ranking-star w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-2 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                 จัดอันดับ
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-6 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    จัดอันดับ
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                to="/how-to-use"
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fa-solid fa-circle-exclamation w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-9 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                 วิธีการใช้งาน
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-6 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    วิธีการใช้งาน
                </div>
              )}
            </li>
            <li className="relative group">
              {user && user.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center text-gray-700 hover:text-red-500"
                >
                  <i className="fa-solid fa-users w-10 text-center"></i>
                  <span
                    className={`ml-4 transition-opacity duration-300 ${
                      isSidebarOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    เเอดมิน
                  </span>
                </Link>
              ) : null}
               {!isSidebarOpen && (
                <div className="z-50 absolute bottom-9 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    เเอดมิน
                </div>
              )}
            </li>
            <li className="relative group">
              <Link
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-500"
              >
                <i className="fas fa-sign-out-alt w-10 text-center"></i>
                <span
                  className={`ml-4 transition-opacity duration-300 -my-5 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ออกจากระบบ
                </span>
              </Link>
              {!isSidebarOpen && (
                <div className="z-50 absolute bottom-8 left-4 w-max bg-gray-500 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ออกจากระบบ
                </div>
              )}
            </li>
          </ul>
        </nav>
      
      </aside>
    </div>
  );
};

export default SlidebarUser;
