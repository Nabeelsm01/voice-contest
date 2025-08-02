import React from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import popImage from "../../../assets/pop.png";

function Trophy() {
  //แสดงปอปอัป
  const TheModal = () => {
    Swal.fire({
      title: `<h2 class="text-left">รายละเอียดกฎกติกา</h2>`, // หัวข้อชิดขวา
      html: `
        <div class="text-left">
       <div class="absolute  md:left-0 md:transform md:-translate-y-40 left-0 transform -translate-y-36 w-full flex justify-center items-center text-center">
        <button 
          class="bg-[#e1c61f] text-black rounded-full border-2 border-white hover:border-white md:h-12 md:w-32 h-10 w-24 md:text-sm text-[12px] text-center font-bold"
          onclick="window.location.href='/condition';"
        >
          รายละเอียด
        </button>
      </div>
          <p style="font-weight: bold; font-size: 18px;">1. รางวัล iPhone 16 - 128GB</p>
          <p>- ผู้แนะนำที่มีผู้มาบันทึกมากที่สุด</p>
          <p style="font-weight: bold; font-size: 18px;">2. รางวัล iPhone 16 - 128GB</p>
          <p>- ผู้ได้รับเลือกจาก CALLVOICE COMMUNICATIONS<br> 
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
  const style = document.createElement("style");
  style.textContent = `
  .custom-swal-popup {
    padding: 5;
    margin: 0;
    width: 90%; 
    max-width: 500px; 
    border-radius: 10px; 
    overflow: hidden; 
  }
  .custom-swal-popup img {
    width: auto;
    height: auto;
    display: block;
    margin: 0;
  }
`;
  document.head.appendChild(style);

  return (
    // มี responsive เกือบทั้งหมด
    <div className="bg-gray-100 min-h-screen py-1">
      {/* ปุ่มย้อนกลับ */}
      <div className="flex justify-center items-center  lg:ml-12  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md">
        <Link to="/leaderboard">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#ff745d"
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-3">
        {/* Announcement Card */}
        <div className="card bg-white lg:h-full md:w-full md:h-full  w-11/12 h-full  mb-5 p-5 shadow-xl rounded-[50px] px-5 mx-auto ">
          <div className="flex flex-row items-center justify-between  sm:w-1000  sm:h-full min-w-screen-xl mb-2 sm:px-8 sm:mx-5">
            {/* Title */}
            <h1 className="text-sm md:text-xl lg:text-2xl mx-2 font-bold text-orange-600">
              ประกาศรางวัล
            </h1>
            {/* Link to Rules */}
            <div className="group rounded-[30px] border-2 border-transparent p-1 flex items-center justify-between transition-all duration-300 hover:border-red-500">
              {/* ปอปอัปรายละเอียดกติกา */}
              <Link
                onClick={TheModal}
                className="text-red-500 flex items-center justify-between"
              >
                <h2 className="w-auto text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  รายละกฎเอียดกฏกติกา
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="block text-gray-500 w-7 h-7 md:w-8 md:h-8"
                  style={{ color: "red" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <hr />
          <br />

          {/* Reward Sections */}
          <div className="flex flex-col md:flex-row items-center gap-4 px-4 text-gray-700">
            {/* Top Referrer Reward */}
            <div className="card bg-red-100 w-full md:w-1/2 rounded-[20px] shadow-xl p-4 ">
              <h2 className="text-[12px] sm:text-xl md:text-lg font-semibold md:text-left">
                รางวัลสำหรับผู้ที่แนะนำมากที่สุด
              </h2>
              <div className="space-y-4 mt-4">
                <ol className="list-decimal pl-6 text-base text-gray-700">
                  <p className="text-[10px] sm:text-sm md:text-left">รอผลประกาศ</p>
                </ol>
              </div>
            </div>

            {/* Company Selection Reward */}
            <div className="bg-red-100 sm:w-5/6 w-full rounded-[20px] shadow-xl p-4">
              <h2 className="text-[12px] sm:text-xl md:text-lg font-semibold md:text-left ">
                รางวัลสำหรับผู้ได้รับเลือกจากบริษัท CALL VOICE COMMUNICATIONS
              </h2>
              <div className="space-y-4 mt-4">
                <ol className="list-decimal pl-6 text-base text-gray-700">
                  <p className="text-[10px] sm:text-sm md:text-left">รอผลประกาศ</p>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Trophy;
