import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../poplogin";
import RegisterModal from "../popregister";
import AgreementModal from "../popagree";
import Invite from "../invite";
import Swal from "sweetalert2";
import config from "../../../config";
import { useAuth } from '../../context/authcontext'; // นำเข้า useAuth

const Header = () => {
  // สถานะของเมนู (เปิด/ปิด)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // ใช้สำหรับอ้างอิงเมนู
  const buttonRef = useRef(null); // ใช้สำหรับอ้างอิงปุ่ม
  const location = useLocation(); // ใช้เพื่อดักจับการเปลี่ยนหน้า
  const [error, setError] = useState(null); // เพิ่มสถานะสำหรับบันทึกข้อผิดพลาด

  const [email, setEmail] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const navigate = useNavigate();

  const [isOpenInvite, setOpenInvite] = useState(false);

  const { isAuthenticated, user, isLoading } = useAuth();


  // ฟังก์ชันเปิดเมนู
  const openMenu = () => setMenuOpen(true);
  // ฟังก์ชันปิดเมนู
  const closeMenu = () => setMenuOpen(false);

  // ฟังก์ชันสลับสถานะเมนู (เปิด/ปิด)
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // ดึงข้อมูลโปรไฟล์ผู้ใช้เมื่อ component ถูกโหลด
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       // ส่งคำขอไปยัง API เพื่อนำข้อมูลผู้ใช้
  //       const response = await fetch(`${config.apiBaseUrl}/user/me/`, {
  //         method: "GET",
  //         credentials: "include", // ส่งคุกกี้ไปยังเซิร์ฟเวอร์
  //       });
  //       if (response.ok) {
  //         const data = await response.json();
  //         setUser(data); // เซ็ตข้อมูลผู้ใช้ที่ดึงมาได้
  //         //console.log("User data:", data);
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
  // }, []); // ทำงานครั้งเดียวเมื่อ component ถูก mount

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

  // ฟังก์ชันสำหรับการคลิกนอกเมนูแล้วให้ปิดเมนู
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setMenuOpen(false); // ปิดเมนูเมื่อคลิกนอกเมนู
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // เพิ่ม listener เมื่อคลิกนอก
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // ลบ listener เมื่อ component ถูก unmount
    };
  }, []);

  const toggleModal = () => {
    if (isRegisterModalOpen) {
      setIsRegisterModalOpen(false);
    }
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  const toggleRegisterModal = () => {
    if (isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
    setIsRegisterModalOpen(!isRegisterModalOpen);
  };

  const toggleAqreementModal = () => {
    setIsAgreementModalOpen(!isAgreementModalOpen);
  };

  const openInvite = () => {
    setOpenInvite(!isOpenInvite);
  };

  const handleNavigation = async (redirectPath) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user/protected/`, {
        method: "GET",
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      });

      if (response.ok) {
        const userData = await response.json();
        //console.log("Protected API Response:", userData);
        window.location.href = redirectPath;
      } else {
        console.error("Access Denied");
        setIsLoginModalOpen(true); // เปิด Modal เพื่อเข้าสู่ระบบ
        try {
          const error = await response.json(); // โหลด JSON หลัง toggleModal()
          console.error(error);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
      }
    } catch (error) {
      console.error("Error calling protected API:", error);
      setIsLoginModalOpen(true); // เปิด Modal เพื่อเข้าสู่ระบบ
    }
  };

  const handleProfileClick = () => handleNavigation("/profile");

  const handleAgreeCallback = () => {
    setIsAgreementModalOpen(false); // ปิด modal
    //window.location.href = redirectPath; // ไปยังเส้นทางที่ระบุ
  };

  return (
    <header className="bg-white shadow py-4 px-2 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* แถบด้านบนสำหรับ Mobile */}
        <div className="flex sm:items-center justify-between ">
          {/* ชื่อแอปในกรณีที่เป็น Desktop */}
          <div className="">
            <Link
              to="/"
              className="text-red-500 font-bold text-xl  ml-4 text-center m-2"
            >
              Record
            </Link>
          </div>
          {/* ข้อความข้อความที่แสดงบน Desktop */}
          <div className="hidden md:flex items-center space-x-6 ">
            {user ? (
              <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center space-x-2">
                <i className="fas fa-envelope text-blue-500"></i>
                <span className="text-sm text-gray-600">
                  คุณได้รับเชิญจาก: <strong>{user.invited ? user.invited : "  -  "}</strong>
                </span>
              </div>
            ) : null}
          </div>
          <div
            className="flex items-center justify-center md:p-1 "
            onClick={openInvite}
          >
            {user ? (
              <button className="text-gray-600 text-[12px] bg-gray-200 rounded-[20px] border-2 hover:border-gray-300 p-2">
                เชิญเพื่อน
              </button>
            ) : null}
          </div>
        </div>
        {/* ข้อมูลผู้ใช้ (แสดงใน Desktop) */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <span className="text-[11px] md:text-sm text-gray-600 text-end">
              สวัสดี,
              <strong>
                {" "}
                {user.firstname} {user.lastname}
              </strong>
            </span>
          ) : (
            <span
              className="text-sm text-gray-600  cursor-pointer hover:underline"
              onClick={handleNavigation}
            >
              กรุณาเข้าสู่ระบบ
            </span>
          )}
          <div className="w-10 h-10 rounded-full ring-2 ring-orange-500">
            <div
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-500 cursor-pointer"
              onClick={handleProfileClick} // เพิ่ม event handler ที่รูปโปรไฟล์
            //onClick={toggleMenu} //เพิ่มฟังเปิดเมนู
            >
              <img // เพิ่มโปรไฟล์
                src={
                  user?.profile_picture
                    ? user.profile_picture.startsWith("https")
                      ? user.profile_picture // ใช้ URL ที่เริ่มต้นด้วย https
                      : `${config.apiBaseUrl}/${user.profile_picture}` // ใช้ URL ที่ต้องแปลง path เป็น URL
                    : "/src/assets/112.png" // รูปโปรไฟล์เริ่มต้น
                }
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>

            {/* เมนู Slide-out สำหรับมือถือ */}
            <div
              ref={menuRef}
              onClick={closeMenu}
              className={`fixed inset-0 bg-black/50 z-30 transform transition-all duration-300 ease-in-out sm:hidden
    ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
  `}
            >
              {/* ตัวเมนูที่ Slide-out จากด้านขวา */}
              <div
                className={`absolute top-0 right-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      ${menuOpen ? "translate-x-0" : "translate-x-full"} 
    `}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <img // เพิ่มโปรไฟล์
                    src={
                      user?.profile_picture
                        ? user.profile_picture.startsWith("https")
                          ? user.profile_picture // ใช้ URL ที่เริ่มต้นด้วย https
                          : `${config.apiBaseUrl}/${user.profile_picture}` // ใช้ URL ที่ต้องแปลง path เป็น URL
                        : "/src/assets/112.png" // ค่าเริ่มต้น
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-500 "
                  />
                  <div className="text-red-500 text-xl font-bold">เมนู</div>
                  {/* ปุ่มปิดเมนู */}
                  <button
                    onClick={toggleMenu}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                {/* รายการเมนูใน Mobile */}
                <ul className="p-4 space-y-4">
                  <li>
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-house"></i></span>
                      <span>หน้าแรก</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-user"></i></span>
                      <span>โปรไฟล์</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/user/history"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-file"></i></span>
                      <span>ประวัติบันทึกเสียง</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/leaderboard/trophy"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-ranking-star"></i></span>
                      <span>ประกาศผล</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/setting-record-voice"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-music"></i></span>
                      <span>การตั้งค่าเสียง</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/how-to-use"
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-circle-exclamation"></i></span>
                      <span>วิธีการใช้งาน</span>
                    </Link>
                  </li>

                  {/* ลิงก์ออกจากระบบ */}
                  <li>
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault(); // ป้องกันการเปลี่ยนเส้นทาง
                        handleLogout(); // เรียกฟังก์ชัน logout
                      }}
                      className="text-gray-700 hover:text-indigo-500 flex items-center space-x-2"
                    >
                      <span><i className="fa-solid fa-right-from-bracket"></i></span>
                      <span>ออกจากระบบ</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:hidden ">
            {user && (
              <button
                ref={buttonRef}
                onClick={openMenu}
                className="p-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                {/* ไอคอนสามขีด (Hamburger menu) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  />
                </svg>
              </button>
            )}
            {/* รูปโปรไฟล์บนมือถือ */}
            {/* <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-500 md:hidden">
              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div> */}
          </div>
        </div>
      </div>
      {isLoginModalOpen && (
        <LoginModal register={toggleRegisterModal} login={toggleModal} />
      )}
      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={toggleRegisterModal}
          aqree={toggleAqreementModal}
          login={toggleModal}
          put={setEmail}
        />
      )}
      {isAgreementModalOpen && (
        <AgreementModal
          email={user?.email || user?._id || email}
          onAgree={handleAgreeCallback} // Callback เมื่อผู้ใช้กด "ยอมรับ"
          onCancel={() => setIsAgreementModalOpen(false)} // Callback เมื่อผู้ใช้กด "ยกเลิก"
        />
      )}
      {isOpenInvite && <Invite Invite={openInvite} />}
    </header>
  );
};

export default Header;
