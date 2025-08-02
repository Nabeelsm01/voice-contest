import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import config from "../../../../config";

import popImage from "../../../assets/pop.png";

function Board() {
  const [rankList, setRankList] = useState([]);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${config.apiBaseUrl}/user/invites_rank`);
        const data = await response.json();
        setRankList(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

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
    width: 90%; /* ขนาดดีฟอลต์ */
    max-width: 500px; /* ขนาดสูงสุด */
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
    <div className=" bg-gray-100 min-h-screen py-1">
      {/* Back Button */}
      <div className="flex justify-center items-center lg:ml-12  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md">
        <Link to="/">
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
      <main className="container mx-auto">
        <div className="card bg-white w-[90%] h-[45rem] mb-5 p-5 shadow-lg rounded-[40px] px-5 mx-auto overflow-hidden">
          <div className="flex sm:flex-row justify-between items-center">
            {/* Title */}
            <h1 className="md:text-2xl text-xl font-prompt font-semibold text-orange-600 animate-fadeInLeft  ">
              อันดับการเชิญ
            </h1>
            <div className="flex flex-col justify-between items-center gap-1 animate-fadeInRight">
              <div className="group ml-9 rounded-[30px] border-2 border-transparent p-1 transition-all duration-300 hover:border-red-500">
                {/* ไปยังหน้าประกาศรางวัล */}
                <Link
                  to="/leaderboard/trophy"
                  className="text-red-500 flex items-center justify-between"
                >
                  <h2 className="text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ประกาศรางวัล
                  </h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="block text-gray-500 w-7 h-7 md:w-8 md:h-8 p-1 border border-red-200 rounded-full shadow-sm shadow-red-400 ml-10"
                    style={{ color: "red" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                    />
                  </svg>
                </Link>
              </div>
              <div className="group rounded-[30px] border-2 border-transparent p-1 transition-all duration-300 hover:border-red-500 ">
                {/* ปอปอัปรายละเอียดกติกา */}
                <Link
                  onClick={TheModal}
                  className="text-red-500 flex items-center justify-between "
                >
                  <h2 className="text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    รายละเอียดกฏกติกา
                  </h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="block text-gray-500 w-7 h-7 md:w-8 md:h-8 border border-red-200 rounded-full shadow-sm shadow-red-400 ml-10"
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
              <div className="text-red-500 text-[0.25rem] font-prompt font-semibold mt-2 mr-5 "><h1>*ผู้ชนะอันดับ1 จะได้รับรางวัล iphone 16 -128 gb</h1></div>
            </div>
          </div>

          {!rankList.length ? (
            <div className="flex flex-col items-center justify-center h-full animate-fadeInLeft">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-20 h-20 text-gray-400 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
              <p className="text-gray-700 text-lg font-semibold">
                ยังไม่มีการจัดอันดับ
              </p>
              <p className="text-gray-500">
                กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง
              </p>
            </div>
          ) : (
            <>
              {/* card แสดงคะเเนนกาาเชิญที่เยอะที่สุด (มีreponsive)*/}
              <div className="flex flex-col-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto sm:max-w-2xl sm:px-2 my-2 text-gray-700 animate-fadeInRight">
                {rankList.slice(0, 2).map((user, index) => (
                  <div
                    key={index}
                    className={`shadow-lg rounded-3xl p-4 flex-col text-center items-center hidden sm:block transform hover:scale-105 focus:scale-105 transition-transform duration-200 ${
                      index === 0
                        ? "bg-gradient-to-t from-[#FFD700] via-[#FFC300] to-[#FFA500] border border-white shadow-yellow-300 "
                        : "bg-white border"
                    }`}
                  >
                    <figure>
                      {index === 0 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="md:w-20 md:h-20 lg:w-40 lg:h-20 bg-yellow-500 rounded-xl text-yellow-100"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                          />
                        </svg>
                      )}
                      {index === 1 && (
                        <i class="fa-solid fa-arrow-trend-up text-7xl md:w-20 md:h-20 lg:w-40 lg:h-20 bg-gray-200 rounded-xl transform scale-x-[-1] text-gray-400"></i>
                      )}
                    </figure>
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-prompt font-bold text-gray-700">อันดับ {index + 1}</h2>
                      <p className="text font-prompt font-semibold text-gray-600">{user.name} {user.invite_count}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ตารางแสดงคะเเนนกาาเชิญ */}
              <div className="flex flex-col w-full md:w-[90%] lg:w-[80%] sm:mx-24 md:mx-10 lg:mx-28 mx-auto my-4 sm:my-2 sm:p-4 overflow-y-auto text-gray-700 space-y-1 animate-fadeInLeft">
                {rankList.map((user, index) => (
                  <div
                    key={index}
                    className={`text-center shadow-md rounded-2xl p-3 flex justify-between items-center ${
                      index === 0
                        ? "bg-gradient-to-r from-[#FFD700] via-[#FFC300] to-[#FFA500] p-4"
                        : "bg-white border"
                    }`}
                  >
                    <span className="sm:w-full w-1/2 text-left text-sm lg:text-lg font-prompt font-semibold text-gray-600 ">
                      {index + 1}. {user.name}
                    </span>
                    <span className="sm:w-full w-1/6 text-center text-sm lg:text-lg font-prompt font-semibold text-gray-600 ">
                      จำนวนการเชิญ
                    </span>
                    <span className="sm:w-full w-1/3 text-right text-sm lg:text-lg font-prompt font-semibold text-gray-600 ">
                      {user.invite_count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Board;
