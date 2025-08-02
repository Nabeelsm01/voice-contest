import React, { useEffect, useState, useRef } from "react";
import iphone from "../assets/iphone.png";
import Swal from "sweetalert2";
import "../style/close.css";
import config from "../../config";
const Invite = ({ Invite }) => {
  const [user, setUser] = useState("");
  const [inviteCount, setInviteCount] = useState(0); // State to store count_above_50

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/user/me/`, {
          method: "GET",
          credentials: "include", // Cookie ถูกส่งไปยัง server
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUser();
  }, []);

  const fetchInviteCount = async () => {
    if (!user.invited_users) return; // Check if invited_users is available

    // แปลง array ที่มีหลายชั้นให้เป็น array ชั้นเดียว
    const validEmails = user.invited_users.flat().filter(email => typeof email === 'string');

    console.log("Valid emails:", validEmails);
    try {
      const response = await fetch(`${config.apiBaseUrl}/user/fetch_invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: validEmails }), // Payload ที่ถูกต้อง
      });
      if (response.ok) {
        const data = await response.json();
        setInviteCount(data.count_above_50);
      } else {
        console.error("Failed to fetch invite count");
      }
    } catch (error) {
      console.error("Error fetching invite count:", error);
    }
  };
  if (user.email) {
    fetchInviteCount();
  }

  console.log("User", user.invited_users);


  const Modalinvite = () => {
    Swal.fire({
      title: "<h2 class='md:text-xl text-sm font-bold'>เคล็ดลับรางวัล</h2>",
      html: `
          <div class="rounded-lg p-2">
            <p class="font-bold md:text-[18px] text-[12px] text-center">
              เชิญเพื่อนของคุณมาร่วมกิจกรรมกับทางเราให้ได้มากที่สุด แล้วไอโฟน 16 จะเป็นของคุณ!
            </p>
            <div class="mt-6 text-center">
              <p class="sm:text-sm text-[10px] mb-4">แชร์ลิงก์เชิญเพื่อน:</p>
              <div class="flex flex-wrap gap-4 justify-center">
                <button id="copy-link-btn"
                  class="px-4 py-2 h-10 bg-white text-orange-500 font-bold rounded-lg border border-orange-500 hover:bg-orange-500 hover:text-white transition-all flex flex-wrap justify-center items-center gap-2"
                >
                  <img src="https://img.icons8.com/material-outlined/24/000000/copy.png" alt="Copy Icon" class="w-5 h-5">
                  <p class="md:text-sm text-[8px]">คัดลอกลิงก์</p> 
                </button>
              </div>
            </div>
          </div>
        `,
      color: "white",
      width: "50%",
      background: "#3e4b96",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        closeButton: "custom-close-button",
      },
      didOpen: () => {
        const copyButton = document.getElementById("copy-link-btn");
        if (copyButton) {
          copyButton.addEventListener("click", copyLink(user));
        }
      },
    });
  };

  const copyLink = (user) => {
    if (!user?.email) {
      Swal.fire({
        text: "ไม่พบอีเมลผู้ใช้",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const link = `${config.fontEndUrl}?invite=${encodeURIComponent(user.email)}`; // ใช้ encodeURIComponent() ป้องกันอักขระพิเศษ
    navigator.clipboard.writeText(link)
      .then(() => {
        Swal.fire({
          text: "ลิงก์ถูกคัดลอกแล้ว!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        console.log("Link copied:", link);
      })
      .catch(() => {
        Swal.fire({
          text: "เกิดข้อผิดพลาดในการคัดลอกลิงก์",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      });
  };

  return (
    <div
      onClick={Invite}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-auto shadow-lg rounded-[50px] px-8 py-8 mx-auto bg-cover bg-center"
      >
        <div className="flex justify-between">
          <div className="mb-6 ">
            {/* Heading section */}
            <h1 className="text-xl md:text-[40px] lg:text-[40px] font-bold text-gray-500">
              เชิญเพื่อนเเล้วลุ้นรับ
            </h1>
            <h1 className="text-xl md:text-[40px] lg:text-[40px] font-bold text-orange-400 lg:mt-6 md:mt-5 ">
              ไอโฟน 16
            </h1>
            <p className="lg:mt-3 lg:mb-2 md:mt-3 md:mb-2 text-sm">
              เชิญเลย รับรางวัล แล้วเชิญซ้ำ!
            </p>
          </div>
          <div>
            <img
              src={iphone}
              alt="Invite Friends"
              className="w-40 l-40 lg:w-60 md:w-48 lg:-translate-x-3 lg:-translate-y-4 object-contain m-4 animate-pulse"
            />
          </div>
        </div>

        {/* Grid section */}
        {/* <div className="cursor-pointer flex flex-col items-center ">
              <div className="flex flex-col items-center bg-gray-300 lg:rounded-[40px] md:rounded-[40px] 
              rounded-[20px] shadow-md p-6 lg:h-52 lg:w-52 md:h-40 md:w-32 w-20 h-32  transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="text-gray-500 w-[40px] h-[40px] md:w-[90px] md:h-[10rem] lg:w-[90px] lg:h-[10rem]" 
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <p>4</p>
                <p>คน</p>
              </div>
              
            </div> */}
        <p class="md:text-lg font-bold text-[10px] mb-2 text-gray-700 text-center">เชิญทั้งหมด: {inviteCount} คน</p>
        {/* <div className="flex">
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 justify-between md:gap-4 gap-6 items-center lg:w-5/6 ">
            {[1, 2, 3, 4].map((person) => (
              <div className="cursor-pointer flex flex-col items-center ">
                <div
                  key={person}
                  className={`flex flex-col items-center bg-gray-300 lg:rounded-[40px] md:rounded-[40px] 
                    rounded-[20px] shadow-md p-6 lg:h-52 lg:w-48 md:h-40 md:w-32 w-16 h-32 transform hover:scale-105 
                    focus:scale-105 transition-transform duration-200 ${person === 1 ? "bg-orange-400 text-white" : ""
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={`${person === 1 ? "text-white" : "text-gray-500"
                      } w-[40px] h-[40px] md:w-[90px] md:h-[90px] lg:w-[90px] lg:h-[90px]`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  <p>{person}</p>
                  <p>คน</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <img
              src={iphone}
              alt="Invite Friends"
              className="lg:w-80 object-contain m-4 hidden lg:block lg:-translate-x-2 lg:-translate-y-48"
            />
          </div>
        </div> */}
        <p class="sm:text-sm text-[10px] text-center pt-2">แชร์ลิงก์เชิญเพื่อน:</p>
        <div className="flex justify-center items-center w-full p-2 h-full m-2 ">

          <button
            className="card flex justify-center items-center h-10 w-32 md:w-80  md:h-14 lg:mx-60 bg-orange-400 text-white text-lg font-bold 
            rounded-full shadow-md hover:bg-orange-500 border-2 hover:border-red-400 "
            onClick={Modalinvite}
          >
            <p class="md:text-lg text-[12px]">คัดลอกลิงก์</p>
          </button>
        </div>
        <p className="font-bold text-center md:mt-4 mt-2 text-gray-600">
          รหัสเชิญ: {user.email}
        </p>
      </div>
    </div>
  );
};

export default Invite;
