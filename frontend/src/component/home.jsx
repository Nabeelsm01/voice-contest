import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import LoginModal from "./poplogin";
import RegisterModal from "./popregister";
import AgreementModal from "./popagree";
import ForgetPassword from "./popforgot";
import ResetPass from "./popresetpassword";
import OTP from "./popotp";

import Swal from "sweetalert2";
import useImage from "../assets/pop.png";
import popImage from "../assets/pop.png";
import backgroundImage from "../assets/animated-colored-shapes2.gif";
import config from "../../config";
import "../style/home.css";
import "../style/closehome.css";
import { useAuth } from '../context/authcontext'; // นำเข้า useAuth

const Home = () => {
  // const location = useLocation();
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const navigate = useNavigate();
  const [navbar, setNavbar] = useState("");
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchParams] = useSearchParams();
  const [invite, setInvite] = useState("");
  const [isUserFetched, setIsUserFetched] = useState(false); // เพิ่ม state เพื่อตรวจสอบการโหลด user
  const { isAuthenticated, user, isLoading } = useAuth();
  


  //console.log("invite = ", invite);

  // useEffect(() => {
  //   console.log("email", email)
  // }, [email])

  useEffect(() => {
    // อ่าน Cookie
    const cookies = document.cookie.split("; ");
    const errorCookie = cookies.find((cookie) => cookie.startsWith("error="));
    if (errorCookie) {
      const errorValue = decodeURIComponent(errorCookie.split("=")[1]); // Decode ข้อมูล
      document.cookie = "error=; Max-Age=0; path=/;"; // ลบ Cookie

      // แสดง Swal แจ้งเตือน
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด123",
        text:
          errorValue === "EmailAlreadyUsed"
            ? "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้บัญชีอื่น"
            : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    }
  }, []);

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
  //       } else {
  //         console.error("Failed to fetch user");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user profile:", error);
  //     } finally {
  //       setIsUserFetched(true); // ตั้งค่าเป็น true เมื่อดึงข้อมูลสำเร็จหรือเกิดข้อผิดพลาด
  //     }
  //   };

  //   fetchUser();
  // }, []);

  useEffect(() => {
    if (isUserFetched) {
      if (user) {
        //console.log("isUserFetched A = ", isUserFetched);
        return;
      }

      else {
        // ดึงค่า invite จาก URL ถ้ามี
        let inviteCode = searchParams.get("invite");

        if (inviteCode) {
          // ถ้ามีค่า invite ใน URL -> บันทึกลง state และ localStorage
          setInvite(inviteCode);
          localStorage.setItem("invite", inviteCode);
          sessionStorage.setItem("SweetAlert", "true");
          //console.log("isUserFetched B = ", isUserFetched);
          setIsLoginModalOpen(true); // เปิด modal เฉพาะเมื่อไม่ได้ fetch user สำเร็จ
        } else {
          // ถ้าไม่มีค่าใน URL -> ใช้ค่าจาก localStorage
          const storedInvite = localStorage.getItem("invite");
          if (storedInvite) {
            setInvite(storedInvite);
          }
        }
      }
    }

  }, [searchParams, isUserFetched]); // เพิ่ม isUserFetched เป็น dependency


  // Modal รางวัล
  useEffect(() => {
    const hasSeenAlert = sessionStorage.getItem("SweetAlert");
    if (!hasSeenAlert) {
      Swal.fire({
        html: `
        <div className="relative">
          <img 
            src="${useImage}" 
            alt="iPhone 16 Promotion" 
            className="w-full h-auto rounded-lg cursor-pointer"
            onclick="window.location.href='/condition';"
             style="border: none; margin: 0; padding: 0;"
          />
        </div>
      `,
        imageAlt: "iPhone 16 Promotion", // ข้อความสำรอง
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          popup: "p-0 bg-transparent shadow-none",
          closeButton: "custom-closehome-button",
        },
      }).then(() => {
        // บันทึกสถานะว่าเคยแสดงแล้ว
        sessionStorage.setItem("SweetAlert", "true");
      });
    }
  }, []);

  useEffect(() => {
    // ตรวจสอบ query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const error = queryParams.get("error");

    if (error === "email_used") {
      // แสดงข้อความแจ้งเตือน
      Swal.fire({
        icon: "error",
        title: "อีเมลนี้ถูกใช้งานแล้ว",
        text: "กรุณาใช้ที่อยู่อีเมลอื่น",
        confirmButtonText: "ตกลง",
      });

      // ลบ query parameter ออก (optional)
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);


  // เพิ่ม CSS เพื่อให้รูปครอบคลุมเต็มขอบ
  const style = document.createElement("style");
  style.textContent = `
   .custom-popup {
     padding: 0;
     margin: 0;
     width: 90%; 
     max-width: 600px; 
     border-radius: 10px; 
     overflow: hidden; 
   }
   .custom-popup img {
     width: auto;
     height: auto;
     display: block;
     margin: 0;
   }
 `;
  document.head.appendChild(style);
  // Modal รายละเอียดรางวัล
  const Thepop = () => {
    Swal.fire({
      title: `<h2 class="text-left font-prompt text-2xl text-red-600">รายละเอียดกฎกติกา</h2>`, // หัวข้อชิดขวา
      html: `
        <div class="text-left ">
       <div class="absolute  md:left-0 md:transform md:-translate-y-40 mt-3 left-0 transform -translate-y-36 w-full flex justify-center items-center text-center ">
        <button 
          class="bg-[#e1c61f] hover:bg-red-100 shadow-lg text-black rounded-full  border-2 border-white hover:border-white md:h-12 md:w-32 h-10 w-24 md:text-sm text-[12px] text-center font-bold"
          onclick="window.location.href='/condition';"
        >
          รายละเอียด
        </button>
      </div>
          <p class='font-prompt font-semibold text-gray-600'>1. รางวัล iPhone 16 - 128GB</p>
          <p class='font-prompt font-normal text-lg text-gray-500'>- ผู้แนะนำที่มีผู้มาบันทึกมากที่สุด</p>
          <p class='font-prompt font-semibold text-gray-600'>2. รางวัล iPhone 16 - 128GB</p>
          <p class='font-prompt font-normal text-lg text-gray-500'>- ผู้ได้รับเลือกจาก CALLVOICE COMMUNICATIONS<br> 
          เเละปฏิเสธข้อโต้เเย้งใดๆ การจัดสินของกรรมการเป็นที่สุด</p>
        </div>
      `,
      imageUrl: popImage, // ลิงก์รูปภาพ
      imageWidth: "auto", // กำหนดให้รูปเต็มขอบ
      imageHeight: "auto", // ให้คงอัตราส่วนของรูป
      imageAlt: "iPhone 16 Promotion", // ข้อความสำรอง
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "custom-swal-popup",
        closeButton: "custom-close-button",
      },
    });
  };
  // เพิ่ม CSS เพื่อให้รูปครอบคลุมเต็มขอบ
  const thestyle = document.createElement("style");
  thestyle.textContent = `
  .custom-swal-popup {
    padding: 0;
    margin: 0;
    width: 90%; 
    max-width: 500px; 
    border-radius: 20px; 
    overflow: hidden; 
  }
  .custom-swal-popup img {
    width: auto;
    height: auto;
    display: block;
    margin: 0;
  }
`;
  document.head.appendChild(thestyle);
  // คำอธิบาย
  const Modalll = () => {
    Swal.fire({
      html: `
        <div style="text-align: left;"> <!-- จัดข้อความให้อยู่ด้านขวา -->
          <p style="font-weight: bold; font-size: 16px;">1.เมื่อผู้ใช้ทำการอัดเสียงครบหนึ่งชุดข้อความ ระบบจะนับเป็นหนึ่งชุด และจะแสดงการเพิ่มขึ้นของแถบสีตามจำนวนชุดข้อความที่ผู้ใช้ได้
    อัดสำเร็จ</p> <br>
          <p style="font-weight: bold; font-size: 16px;">2. ผู้ใช้สามารถเชิญเพื่อนเข้าร่วมได้ หลังจากอัดเสียงครบหนึ่งชุดข้อความ เพื่อร่วมลุ้นรับ iPhone 16 โดยผู้ใช้ที่เชิญเพื่อนได้มากที่สุดจะได้รับ iPhone 16 เป็นของรางวัล</p>
        </div>
      `,
      color: "white",
      width: "50%",
      background: "#f17b44",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        closeButton: "custom-close-button",
      },
    });
  };
  // ปอปอัป login
  const toggleModal = () => {
    if (isRegisterModalOpen) {
      setIsRegisterModalOpen(false);
    }

    setIsLoginModalOpen(!isLoginModalOpen);
  };
  // ปอปอัป register
  const toggleRegisterModal = () => {
    if (isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
    setIsRegisterModalOpen(!isRegisterModalOpen);
  };

  // ปอปอัป aqreement
  const toggleAqreementModal = () => {
    setIsAgreementModalOpen(!isAgreementModalOpen);
  };

  // ปอปอัป forgot
  const popForgot = () => {
    if (isOtpOpen) {
      setIsOtpOpen(false);
    }
    setIsForgotOpen(!isForgotOpen);
  };

  // ปอปอัป otp
  const popOtp = () => {
    if (isForgotOpen) {
      setIsForgotOpen(false);
    }
    setIsLoginModalOpen(isLoginModalOpen);
    setIsOtpOpen(!isOtpOpen);
  };

  // ปอปอัป reset
  const popReset = () => {
    if (isOtpOpen) {
      setIsOtpOpen(false);
    }
    setIsResetOpen(!isResetOpen);
  };

  // การเชื่อมต่อกับฐานข้อมูล ระบบอัดเสียง

  const handleNavigation = async (redirectPath) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user/protected/`, {
        method: "GET",
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      });

      if (response.ok) {
        const userData = await response.json();
        //console.log("Protected API Response:", userData);

        // เรียก API /agreement/status/ ด้วย email ที่ได้รับ
        const agreementResponse = await fetch(
          `${config.apiBaseUrl}/user/agreement/status/?email=${user.email || user._id
          }`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (agreementResponse.ok) {
          const agreementData = await agreementResponse.json();
          console.log("Agreement Status Response:", agreementData);

          if (
            agreementData.agreement === false ||
            agreementData.agreement == null
          ) {
            // แสดง popup AgreementModal
            setIsAgreementModalOpen(true);
          } else {
            // เปลี่ยนหน้าไปยังเส้นทางที่ระบุ
            window.location.href = redirectPath;
          }
        } else {
          console.error("Failed to fetch agreement status.");
          try {
            const error = await agreementResponse.json();
            console.error(error);
          } catch (parseError) {
            console.error("Error parsing agreement response:", parseError);
          }
        }
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

  const handleRecordVoiceClick = () => handleNavigation("/user/list");
  const handleSettingRecordVoiceClick = () =>
    handleNavigation("/setting-record-voice");

  const handleAgreeCallback = () => {
    //setShowAgreementModal(false); // ปิด modal
    const redirectPath = "/";
    window.location.href = redirectPath; // ไปยังเส้นทางที่ระบุ
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // ถ้าคลิกนอก modal ให้ปิด
      const modal = document.querySelector("#loginModal");
      if (isLoginModalOpen && modal && !modal.contains(event.target)) {
        setIsLoginModalOpen(false);
      }
    };

    // เพิ่ม event listener
    document.addEventListener("mousedown", handleOutsideClick);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isLoginModalOpen]);

  const [progress, setProgress] = useState(0); // ความคืบหน้าในเปอร์เซ็นต์
  const [totalSets, setTotalSets] = useState(0); // จำนวนชุดทั้งหมด
  const [completedSets, setCompletedSets] = useState(0); // จำนวนชุดที่บันทึกครบแล้ว
  const [sets, setSets] = useState([]); // ข้อมูลชุดทั้งหมดจาก read_scripts
  const [records, setRecords] = useState({}); // ข้อมูลการบันทึกเสียงแยกตาม set_id

  // ดึงข้อมูล read_scripts
  useEffect(() => {
    const fetchReadScripts = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/script/read_scripts`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        
        if (!response.ok) {
          throw new Error("Failed to fetch sets");
        }
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error(
            "Invalid response structure: `data` field missing or not an array"
          );
        }

        // คำนวณจำนวนชุดทั้งหมด
        const uniqueSets = [
          ...new Set(result.data.map((set) => set.set_number)),
        ];
        setTotalSets(uniqueSets.length);
        setSets(result.data);
      } catch (error) {
        console.error("Error fetching sets:", error);
      }
    };

    fetchReadScripts();
  }, []);

  // ดึงข้อมูล get_records
  useEffect(() => {
    const fetchRecords = async () => { 
      try {
        if (!user || !user._id) return; // ตรวจสอบก่อน
        // console.log(user._id,"ได้ผลลัพท์");
        const response = await fetch(
          `${config.apiBaseUrl}/record/get_records?user_id=${user._id}`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!response.ok) {
          throw new Error("Failed to fetch records");
        }
        const result = await response.json();

        if (!Array.isArray(result)) {
          throw new Error(
            "Invalid response structure: Response is not an array"
          );
        }

        // // นับจำนวน script ในแต่ละ set_id
        // const recordCounts = result.reduce((acc, record) => {
        //   acc[record.set_id] = (acc[record.set_id] || 0) + 1;
        //   return acc;
        // }, {});
        // setRecords(recordCounts);
        // 🔹 กรองเฉพาะรายการที่มี `status_record === "completed"`
        const completedRecords = result.filter(record => record.status_record === "completed");

        // 🔹 นับจำนวน script ในแต่ละ set_id ที่เป็น completed เท่านั้น
        const recordCounts = completedRecords.reduce((acc, record) => {
          acc[record.set_id] = (acc[record.set_id] || 0) + 1;
          return acc;
        }, {});

        setRecords(recordCounts); // 🔹 อัปเดต state records เฉพาะที่ completed

      } catch (error) {
        console.error("Error fetching record data:", error);
      }
    };

    fetchRecords();
  }, [user]);

  // คำนวณ Progress Bar พร้อมตรวจสอบสคริปในแต่ละชุด
  useEffect(() => {
    if (sets.length > 0 && Object.keys(records).length > 0) {
      let completed = 0;

      // ตรวจสอบว่าชุดไหนอัดครบ
      const completedSetCount = [...new Set(sets.map((set) => set.set_number))].reduce(
        (count, setNumber) => {
          // กรองสคริปของชุดปัจจุบัน
          const scriptsInSet = sets.filter((set) => set.set_number === setNumber);
          const totalScriptsInSet = scriptsInSet.length; // จำนวนสคริปในชุด
          const recordedCount = records[setNumber] || 0; // จำนวนที่ผู้ใช้อัดเสียง

          // ตรวจสอบเงื่อนไข:
          // - ถ้าจำนวนสคริป >= 50 และอัดเสียงครบ 50
          // - หรือ ถ้าจำนวนสคริป < 50 แต่มีการอัดครบ
          if (
            (totalScriptsInSet >= 50 && recordedCount >= 50) ||
            (totalScriptsInSet < 50 && recordedCount >= totalScriptsInSet)
          ) {
            completed += 1; // ชุดที่ "สำเร็จ"
          }

          return completed;
        },
        0
      );

      // อัปเดตสถานะ
      setCompletedSets(completedSetCount);
      setProgress((completedSetCount / totalSets) * 100); // คำนวณเปอร์เซ็นต์
    }
  }, [sets, records, totalSets]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* เนื้อหาหลัก */}
      <main className="container mx-auto py-8 px-auto min-h-screen overflow-hidden">
        {/* reponsive */}
        <div className="relative flex flex-col justify-evenly item-center bg-white w-[90%] h-full md:h-[90%] lg:h-full shadow-lg rounded-[50px] px-5 lg:px-24 py-12 mx-auto overflow-hidden ">
          {/* ภาพพื้นหลัง */}
          <div
            className="absolute inset-0 z-0 "
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              opacity: '0.2' // ปรับความโปร่งใสตรงนี้ (0.0 - 1.0)
            }}
          />
          {/* modal รายละเอียดรางวัล reponsive*/}
          <div className="flex flex-col items-end lg:translate-x-10 translate-x-14 md:-translate-y-10 -translate-y-10 opacity-0 animate-fadeInRight ">
            <Link onClick={Thepop}>
              <svg className="outer-svg rounded-full hidden sm:block md:block  " width="100" height="100" >
                <circle cx="45.5" cy="45" r="21" fill="none" stroke="url(#gradientText)" style={{ animationDelay: '7s' }} strokeWidth="2" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="url(#gradientText)"
                className="icon-info block w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 drop-shadow-[1px_5px_3px_rgba(255,61,13,0.2)] rounded-full bg-red-50 hover:bg-red-100 duration-500 "
                style={{ color: "#ff967c", animationDelay: '8.2s' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </Link>
          </div>

          <div className="text-[60px] sm:text-[40px] md:text-[32px] lg:text-[40px] font-semibold text-orange-600 gradient-text animate-pulse animate-infinite animate-slowpulse animate-delay-[5s] animate-ease-linear animate-normal">
            <svg viewBox="0 0 600 150" className="w-full max-w-[600px] h-auto mx-auto " >
              <defs>
                <linearGradient id="gradientText" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="20%" stopColor="#ff3300">
                    <animate attributeName="offset" values="20%;100%;20%" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#ff9900">
                    <animate attributeName="offset" values="50%;150%;50%" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="80%" stopColor="#ff4800">
                    <animate attributeName="offset" values="80%;180%;80%" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <text x="50%" y="50%" textAnchor="middle" className="sm:text-[30px] md:text-[40px] lg:text-[50px]" stroke="url(#gradientText)" fill="url(#gradientText)">
                <tspan className="letter" style={{ animationDelay: '0s' }}>W</tspan>
                <tspan className="letter" style={{ animationDelay: '0.5s' }}>e</tspan>
                <tspan className="letter" style={{ animationDelay: '1s' }}>l</tspan>
                <tspan className="letter" style={{ animationDelay: '1.5s' }}>c</tspan>
                <tspan className="letter" style={{ animationDelay: '2s' }}>o</tspan>
                <tspan className="letter" style={{ animationDelay: '2.5s' }}>m</tspan>
                <tspan className="letter" style={{ animationDelay: '3s' }}>e</tspan>
                <tspan className="letter" style={{ animationDelay: '3.5s' }}> </tspan>
                <tspan className="letter" style={{ animationDelay: '4s' }}>R</tspan>
                <tspan className="letter" style={{ animationDelay: '4.5s' }}>e</tspan>
                <tspan className="letter" style={{ animationDelay: '5s' }}>c</tspan>
                <tspan className="letter" style={{ animationDelay: '5.5s' }}>o</tspan>
                <tspan className="letter" style={{ animationDelay: '6s' }}>r</tspan>
                <tspan className="letter" style={{ animationDelay: '6.5s' }}>d</tspan>
              </text>
            </svg>
          </div>

          {/* reponsive */}
          {/* <h1 className="text-center text-xl md:text-[40px] lg:text-[50px] font-bold text-orange-600 gradient-text">
            {" "} */}
          {/* reponsive */}
          {/* Welcome Record
          </h1> */}
          {/* ข้อความต้อนรับ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:gap-4 gap-6 mt-4 text-center opacity-0 animate-fadeInRight ">
            {" "}
            {/* reponsive */}
            {/* บันทึกเสียง */}
            <div
              onClick={handleRecordVoiceClick}
              className="cursor-pointer flex flex-col items-center justify-center  "
            >
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-0 bg-gray-100 border-2 border-white md:rounded-[50px] rounded-[40px] shadow-lg p-6 sm:h-full sm:w-full  transform hover:scale-105 focus:scale-105 transition-transform duration-200 ">
                {" "}
                {/* reponsive */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="url(#gradient-id)"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem]" /* reponsive */
                >
                  <defs>
                    <linearGradient
                      id="gradient-id"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34D399" /> {/* สีเขียว */}
                      <stop offset="100%" stopColor="#3B82F6" />{" "}
                      {/* สีน้ำเงิน */}
                    </linearGradient>
                  </defs>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
              </div>
              <h2 className="sm:mt-6 my-1 text-lg font-prompt font-semibold text-gray-400">
                บันทึกเสียง
              </h2>
            </div>

            {/* ประกาศผล */}
            <div
              onClick={() => navigate("/leaderboard")}
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-blue-0 bg-gray-100 border-2 border-white md:rounded-[50px] rounded-[40px] shadow-lg p-6  sm:h-full sm:w-full  transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  strokeWidth="1.5"
                  width="90"
                  height="90"
                  stroke="url(#gradient-id)"
                  fill="url(#gradient-id)"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem]"
                >
                  <defs>
                    <linearGradient
                      id="gradient-id"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34D399" /> {/* สีเขียว */}
                      <stop offset="100%" stopColor="#3B82F6" />{" "}
                      {/* สีน้ำเงิน */}
                    </linearGradient>
                  </defs>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M353.8 54.1L330.2 6.3c-3.9-8.3-16.1-8.6-20.4 0L286.2 54.1l-52.3 7.5c-9.3 1.4-13.3 12.9-6.4 19.8l38 37-9 52.1c-1.4 9.3 8.2 16.5 16.8 12.2l46.9-24.8 46.6 24.4c8.6 4.3 18.3-2.9 16.8-12.2l-9-52.1 38-36.6c6.8-6.8 2.9-18.3-6.4-19.8l-52.3-7.5zM256 256c-17.7 0-32 14.3-32 32l0 192c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-192c0-17.7-14.3-32-32-32l-128 0zM32 320c-17.7 0-32 14.3-32 32L0 480c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32L32 320zm416 96l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l-128 0c-17.7 0-32 14.3-32 32z"
                  />
                </svg>
              </div>
              <h2 className="sm:mt-6 my-1 text-lg font-prompt font-semibold text-gray-400">
                จัดอันดับ
              </h2>
            </div>
            {/* ตั้งค่าเสียง */}
            <div
              onClick={handleSettingRecordVoiceClick}
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-blue-0 bg-gray-100 border-2 border-white md:rounded-[50px] rounded-[40px]  shadow-lg p-6  sm:h-full sm:w-full  transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="url(#gradient-id)"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem]"
                >
                  <defs>
                    <linearGradient
                      id="gradient-id"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#3B82F6" />{" "}
                    </linearGradient>
                  </defs>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                  />
                </svg>
              </div>
              <h2 className="sm:mt-6 my-1 text-lg font-prompt font-semibold text-gray-400">
                ตั้งค่าเสียง
              </h2>
            </div>
            {/* วิธีการใช้งาน */}
            <div
              onClick={() => navigate("/how-to-use")}
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-blue-0 bg-gray-100 border-2 border-white md:rounded-[50px] rounded-[40px] shadow-lg p-6  sm:h-full sm:w-full   transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="url(#gradient-id)"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem] "
                >
                  <defs>
                    <linearGradient
                      id="gradient-id"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34D399" /> {/* สีเขียว */}
                      <stop offset="100%" stopColor="#3B82F6" />{" "}
                      {/* สีน้ำเงิน */}
                    </linearGradient>
                  </defs>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
              <h2 className="sm:mt-6 my-1 text-lg font-prompt font-semibold text-gray-400">
                วิธีการใช้งาน
              </h2>
            </div>
          </div>

          {/* จำนวนผู้ใช้อัด progess */}
          <div className="flex flex-col bg-white rounded-[40px] border-white  shadow-xl lg:h-auto lg:w-auto  md:h-auto md:w-auto lg:mx-40 w-auto h-1/2 border-2  mt-4 ">
            <div className="border-4 border-gray-200 rounded-[40px] ">
              <div className="flex md:justify-start justify-between items-center sm:mx-2 p-2 opacity-0 animate-fadeInRight ">
                <h2 className="text-sm font-bold text-gray-400 mr-1">
                  จำนวนที่อัดแล้ว
                </h2>
                {/* โมดอล อธิบาย */}
                <Link onClick={Modalll}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="block text-gray-500 rounded-full shadow-md w-6 h-6 md:w-5 md:h-5 lg:w-5 lg:h-5 "
                    style={{ color: "red", background: "white" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </Link>
              </div>
              {/* เปอร์เซนต์ */}
              {/* <div className="items-center w-full p-2">
                <div className="relative bg-gray-200 h-2 rounded mx-10">
                  <div
                    className="absolute h-2 bg-red-500 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-gray-500 text-sm mx-10">
                  ชุดที่บันทึกแล้ว: {recordedCount}/{totalRecords} (
                  {progress.toFixed(2)}%)
                </span>
              </div> */}
              <div className="items-center w-full p-2 text-center md:text-start opacity-0 animate-fadeInLeft">
                {/* Progress Bar */}
                <div className="relative bg-gray-300 h-3 mb-1 border-2 border-white shadow rounded-full md:mx-10">
                  {/* Progress Fill */}
                  <div
                    className={`absolute h-full transition-all duration-1000 ease-in-out rounded-full ${progress === 100
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                    style={{ width: `${progress}%` }}
                  ></div>

                  {/* Current Set Number */}
                  <div
                    style={{
                      left: `calc(${progress}% - 13px)`,
                      boxShadow: "0px 3px 7px rgba(126, 84, 56, 0.3)", // ปรับตำแหน่งฟองให้อยู่ตรงกลาง
                    }}
                    className={`absolute -top-7 text-sm ${progress === 100
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-orange-400"
                      } border border-white px-2 py-0.5 rounded-full shadow-md flex items-center justify-center`}
                  >
                    {progress === 100 ? "Complete" : completedSets}
                    {/* หยดน้ำแหลม */}
                    <div
                      className={`absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent ${progress === 100 ? "hidden" : "border-t-orange-50"
                        } top-5 shadow-sm`}
                    ></div>
                  </div>
                </div>
                {/* Progress Text */}
                <span className="text-gray-400 text-sm md:mx-10 flex items-center">
                  {totalSets > 0 ? (
                    <>
                      ชุดที่บันทึกครบแล้ว: {completedSets}/{totalSets} (
                      {progress.toFixed(2)}%)
                      {
                        progress === 100 && (
                          <span className="ml-2 text-green-500">
                            {/* Icon ใช้ Tailwind HeroIcons */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )
                      }
                    </>
                  ) : (
                    "ไม่มีข้อมูลชุด"
                  )}
                </span >
              </div >
            </div >
          </div >
        </div >
      </main >
      {isLoginModalOpen && (
        <LoginModal
          register={toggleRegisterModal}
          login={toggleModal}
          forgot={popForgot}
        />
      )}
      {
        isRegisterModalOpen && (
          <RegisterModal
            login={toggleModal}
            isOpen={toggleRegisterModal}
            aqree={toggleAqreementModal}
            put={setEmail}
            Invite={setInvite}
          />
        )
      }
      {
        isAgreementModalOpen && (
          <AgreementModal
            email={user?.email || user?._id || email}
            onAgree={handleAgreeCallback} // Callback เมื่อผู้ใช้กด "ยอมรับ"
            onCancel={() => setIsAgreementModalOpen(false)} // Callback เมื่อผู้ใช้กด "ยกเลิก"
            Invite={invite}
          />
        )
      }


      {
        isForgotOpen &&
        <ForgetPassword
          forgot={popForgot}
          otp={popOtp}
          put={setEmail}
        />
      }

      {
        isOtpOpen && <OTP
          otp={popOtp}
          reset={popReset}
          email={email}
        />
      }

      {
        isResetOpen &&
        <ResetPass
          reset={popReset}
          email={email}
        />
      }





    </div >
  );
};

export default Home;
