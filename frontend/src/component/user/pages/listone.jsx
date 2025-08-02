import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import config from "../../../../config";
const InteractiveTable = () => {
  const [scripts, setScripts] = useState([]); // เก็บข้อมูลสคริปต์
  const [recordStatuses, setRecordStatuses] = useState({}); // เก็บสถานะการอัดเสียง
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const { set_number } = useParams(); // ดึง set_number จาก URL params

  // ดึงข้อมูลผู้ใช้
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลสคริปต์
        const responseScripts = await fetch(
          `${config.apiBaseUrl}/list/read_scripts?set_number=${set_number}&skip=0&limit=50`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!responseScripts.ok) {
          throw new Error("Failed to fetch scripts");
        }
        const scriptsData = await responseScripts.json();
        setScripts(scriptsData.data || []);

        // ดึงสถานะการอัดเสียงทั้งหมดจาก Backend
        const responseStatuses = await fetch(
          `${config.apiBaseUrl}/record/check_record?user_id=${user._id}`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!responseStatuses.ok) {
          throw new Error("Failed to fetch record statuses");
        }
        const statusesData = await responseStatuses.json();

        // กรองข้อมูลโดยเช็ค set_id ให้ตรงกับ set_number
        const filteredStatuses = statusesData.filter(
          (record) => record.set_id === set_number
        );

        // สร้าง Map สำหรับเชื่อมโยง script_number กับ status_record
        const statusMap = filteredStatuses.reduce((acc, record) => {
          acc[record.script_number] = record.status_record;
          return acc;
        }, {});
        setRecordStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (set_number && user) {
      fetchData(); // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อ set_number และ user มีค่า
    }
  }, [set_number, user]); // ดึงข้อมูลใหม่เมื่อ set_number หรือ user เปลี่ยนแปลง

  const handleLinkClick = () => {
    localStorage.removeItem(`selected_set_${set_number}`); // ล้างค่าที่เก็บไว้เมื่อเลือกสคริปต์ใหม่
  };

  if (loading) {
    return <div>Loading...</div>; // แสดงข้อความกำลังโหลด
  }

  return (
    <div className="bg-gray-100 min-h-screen py-1">
      {/* Back Button */}
      <div className="flex justify-center items-center lg:ml-12  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md ">
        <Link to="/user/list">
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
      <main className="container mx-auto">
        <div className=" card bg-white w-[100%] h-full lg:w-[90%] lg:h-full md:w-[90%] md:h-full mb-5 p-5 shadow-lg rounded-[40px] mx-auto overflow-hidden ">
        <div className="mb-1 lg:mb-2 p-0 lg:p-2 px-1 lg:px-10 flex flex-row justify-between items-center">
            <h1 className="font-prompt font-semibold lg:text-xl md:text-xl text-sm font-bold text-orange-600 opacity-0 animate-fadeInLeft">
              ข้อความทั้งหมด สำหรับชุดที่ ({set_number})
            </h1>
            <Link
              to={`/user/record/${set_number}`}
              className="card p-2 lg:p-3  bg-white rounded-[30px] shadow-md  flex justify-center items-center border border-red-100 transition duration-300 ease-in-out hover:bg-red-100 hover:scale-95 opacity-0 animate-fadeInRight"
            >
              <h2 className="text-red-400 text-xs lg:text-[16px] font-prompt font-semibold">เลือกทั้งหมด</h2>
            </Link>
          </div>
          <div className="overflow-x-auto shadow-lg rounded-2xl m-1">
            <table className="w-full h-full table-auto border-collapse overflow-x-auto rounded-xl shadow-lg opacity-0 animate-fadeInLeft">
              <thead>
                <tr className="bg-gray-100 text-center text-gray-400 opacity-0 animate-fadeInRight">
                  <th className="lg:py-3 lg:px-4 py-2 px-2 text-xs md:text-sm lg:text-base w-1/6 md:w-1/6 text-gray-400">
                    ลำดับ
                  </th>
                  <th className="py-3 px-4 lg:py-3 lg:px-4 md:py-3 md:px-4 text-xs sm:text-sm lg:text-base w-3/6 text-left">
                    สคริปข้อความ
                  </th>
                  <th className="lg:py-3 lg:px-4 md:py-3 md:px-4 py-2 text-xs sm:text-sm lg:text-base w-1/6 md:w-1/6 text-gray-400">
                    สถานะ
                  </th>
                  <th className="py-3 px-4 lg:py-3 lg:px-4 md:py-3 md:px-4 text-xs sm:text-sm lg:text-base  w-1/6">
                    เลือก
                  </th>
                </tr>
              </thead>
              <tbody>
                {scripts.map((script) => (
                  <tr className="border-b text-center" key={script._id}>
                    <td className="py-3 px-4 text-xs sm:text-sm lg:text-base  text-gray-700">
                      {script.script_number}
                    </td>
                    <td className="py-3 text-xs md:text-sm lg:text-base text-left  text-gray-700">
                      {script.textinput}
                    </td>
                    <td className="px-[1rem] md:px-[5rem] text-center">
                      {recordStatuses[script.script_number] === "completed" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6  md:w-8 md:h-8 text-green-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : recordStatuses[script.script_number] === "pending" ? (
                        // ⏳ ไอคอน Pending (สีเหลือง)
                        <div className="ml-[2px] w-[27px] h-[27px] flex items-center justify-center aboslute-position bg-yellow-400 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-yellow-700 "
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v2.1a3 3 0 0 1-1.172 2.36L12.9 10.5l4.128 3.79A3 3 0 0 1 18 16.65v2.1a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75v-2.1a3 3 0 0 1 1.172-2.36L11.1 10.5 6.972 6.61A3 3 0 0 1 6 4.35v-2.1Zm1.5.75v1.35a1.5 1.5 0 0 0 .586 1.18L12 9l3.914-3.47a1.5 1.5 0 0 0 .586-1.18V3h-9Zm9 18v-1.35a1.5 1.5 0 0 0-.586-1.18L12 15l-3.914 3.47a1.5 1.5 0 0 0-.586 1.18V21h9Z"
                              clipRule="evenodd"
                            />
                          </svg>
                      </div>
                      
                      ) : recordStatuses[script.script_number] === "rejected" ? (
                        // ❌ ไอคอน Rejected (สีแดง)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 md:w-8 md:h-8 text-red-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2.25a9.75 9.75 0 1 0 9.75 9.75A9.76 9.76 0 0 0 12 2.25ZM8.47 8.47a.75.75 0 0 1 1.06 0L12 10.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L13.06 12l2.47 2.47a.75.75 0 0 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 0-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                
                      ) : (
                        // 🔘 ไอคอน Default (ยังไม่มีสถานะ)
                        <div className="w-5 h-5 md:w-6 md:h-6 mx-[2px] bg-gray-300 rounded-full"></div>
                      )}
                    
                    </td>
                    <td className="px-[1rem] md:px-[3rem] py-3 opacity-0 animate-fadeInLeft">
                      <Link
                        to={`/user/record/${set_number}?script_number=${script.script_number}`}
                        className="p-1 h-8 w-18 bg-gradient-to-r from-[#EB4335] to-[#FF7C30] rounded-full flex justify-center items-center text-white font-medium shadow-lg transition duration-500 hover:from-red-700 hover:to-orange-700"
                        onClick={handleLinkClick}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="white"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                          />
                        </svg>
                        <h2 className="text-white mx-1">เลือก</h2>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InteractiveTable;