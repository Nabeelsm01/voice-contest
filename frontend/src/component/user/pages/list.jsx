import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../../../../config";

// const ITEMS_PER_SET = 50; // จำนวนประโยคต่อชุด

const InteractiveTable = () => {
  const [sets, setSets] = useState([]);
  const [records, setRecords] = useState([]); // เก็บข้อมูล record จาก /check_record
  const [scriptCounts, setScriptCounts] = useState({}); // เก็บจำนวนสคริปต์จริงในแต่ละชุด
  const [navbarContent, setNavbarContent] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [sortedSets, setSortedSets] = useState([]); // เพิ่ม state ใหม่สำหรับเก็บชุดข้อมูลที่เรียงแล้ว

  // ดึงข้อมูลผู้ใช้
  const [user, setUser] = useState(null);
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

  const [randomResult, setRandomResult] = useState(null); // เก็บค่า random_result 
  
  useEffect(() => {
    const fetchAndGenerateRandomResult = async () => {
      if (!user || !user._id) return; // ตรวจสอบก่อน
      try {
        // Step 1: GET เพื่อดึงค่า random_result
        const getResponse = await fetch(
          `${config.apiBaseUrl}/user/random_result/${user._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          }
        );
    
        if (!getResponse.ok) {
          // ถ้า GET ล้มเหลว (เช่น ผู้ใช้ใหม่ไม่มีข้อมูล)
          console.warn("Random result not found, attempting to generate...");
        } else {
          const data = await getResponse.json();
          // console.log("ข้อมูลสุ่ม", data);
    
          // ตรวจสอบว่า random_result มีอยู่หรือไม่
          if (data && (data.random_result !== undefined && data.random_result !== null)) {
            setRandomResult(data.random_result);
            return; // ออกจากฟังก์ชัน
          } else {
            console.warn("Random result not found, attempting to generate...");
            // ทำการ POST เพื่อสุ่มใหม่
          }
          
          
        }
    
        // Step 2: POST เพื่อสุ่มและบันทึก (สำหรับผู้ใช้ใหม่หรือไม่มีผลลัพธ์)
        const postResponse = await fetch(
          `${config.apiBaseUrl}/user/random_result/${user._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          }
        );
    
        if (!postResponse.ok) {
          throw new Error("Error posting random result");
        }
    
        const postData = await postResponse.json();
        console.log("ข้อมูลสุ่มสำหรับผู้ใช้ใหม่", postData);
        setRandomResult(postData.random_result); // บันทึกค่าที่สุ่มได้
      } catch (err) {
        console.error("Error fetching/creating random result:", err);
        setError("ไม่สามารถโหลดหรือสุ่มข้อมูลได้");
      } finally {
        // setLoading(false); // เปลี่ยนสถานะการโหลด
      }
    };
    
  
    fetchAndGenerateRandomResult();
  }, [user]);
  

  // ดึงข้อมูลชุดข้อความจาก API
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/list/read_set`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        });
        if (!response.ok) {
          throw new Error("Failed to fetch sets");
        }
        const data = await response.json();
        setSets(data);

       // จัดเรียงข้อมูลตาม randomResult
        if (randomResult !== null && data.length > 0) {
          const startIndex = (randomResult - 1 + data.length) % data.length; // เผื่อค่าเกินช่วง
          const sortedData = data.sort((a, b) => a.set_number - b.set_number); // เรียงตาม setNumber
          const reorderedData = [
            ...sortedData.slice(startIndex),
            ...sortedData.slice(0, startIndex),
          ];
          setSortedSets(reorderedData); // อัปเดต state
        } else {
          setSortedSets(data); // กรณี randomResult ไม่ได้กำหนด
        }
      } catch (error) {
        console.error("Error fetching sets:", error);
      }
    };

    fetchSets();
  }, [randomResult]);

  // ดึงข้อมูลสคริปต์ทั้งหมดเพื่อคำนวณจำนวนสคริปต์ในแต่ละชุด
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/script/read_scripts`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        });
        if (!response.ok) {
          throw new Error("Failed to fetch scripts");
        }
        const data = await response.json();
        const counts = data.data.reduce((acc, script) => {
          acc[script.set_number] = (acc[script.set_number] || 0) + 1;
          return acc;
        }, {});
        setScriptCounts(counts);
      } catch (error) {
        console.error("Error fetching scripts:", error);
      }
    };

    fetchScripts();
  }, []);

  // ดึงข้อมูลการบันทึกเสียงจาก API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/record/check_record?user_id=${user._id}`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!response.ok) {
          throw new Error("Failed to fetch records");
        }
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    if (user) {
      fetchRecords();
    }
  }, [user]);

  // คำนวณจำนวน recorded_count ต่อ set_number
  const calculateRecordedCount = (setId) => {
    const filteredRecords = records.filter(
      (record) => record.set_id === setId && record.status_record === "completed"
    );
    return filteredRecords.length;
  };

  // ฟังก์ชันคำนวณสถานะ
  const getStatusIcon = (recordedCount, totalScripts) => {
    const count = recordedCount ?? 0;
    const maxCount = totalScripts || 0;
    const textColor =
      count < maxCount
        ? "text-xs sm:text-xs md:text-base lg:text-sm text-gray-400 bg-gray-200 rounded-full px-2 sm:px-3 py-1"
        : "text-xs sm:text-xs md:text-base lg:text-sm text-[#40a05e] bg-[#b1fec9] rounded-full px-2 sm:px-3 py-1";

    const statusIcon =
      count < maxCount ? (
        <div className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-gray-300 rounded-full inline-block"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#7CF5A2]"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clipRule="evenodd"
          />
        </svg>
      );

    return (
      <div className="flex items-center space-x-1 sm:space-x-1 md:space-x-1 lg:space-x-1">
        <span className={`font-bold ${textColor}`}>
          {count}/{maxCount}
        </span>
        {statusIcon}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen py-1 ">
       {/* Back Button */}
            <div className="flex justify-center items-center lg:ml-12  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md  ">
              <Link to="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#ff745d"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 "
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
        <div className="card bg-white w-[100%] h-full lg:w-[90%] lg:h-full md:w-[90%] md:h-full mb-5 p-5 shadow-lg rounded-[40px] mx-auto overflow-hidden">
          <div className="mb-0 lg:mb-2 p-0 lg:p-2 px-1 lg:px-10 flex flex-row justify-between">
            <h1 className="font-prompt font-semibold lg:text-xl md:text-xl text-sm  text-orange-600 py-[5px] opacity-0 animate-fadeInLeft">
              เลือกชุดข้อความที่คุณต้องการบันทึก
            </h1>
            
            {/* <div>
              <p>ผลลัพธ์สุ่ม: {randomResult}</p>
            </div> */}
            
        
            {/* Toggle View Button */}
            <div className="flex justify-center items-center mb-4 opacity-0 animate-fadeInRight">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="bg-white text-red-500 py-1 lg:py-2 px-1 lg:px-3 text-sm lg:text-lg rounded-2xl shadow-md border border-red-100"
              >
                {isGridView ? (
                    <>
                    <div className="flex flex-row space-x-1 justify-center items-center">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 lg:size-5">
                        <path fillRule="evenodd" d="M2.25 4.5A.75.75 0 0 1 3 3.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm0 4.5A.75.75 0 0 1 3 8.25h9.75a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 2.25 9Zm15-.75A.75.75 0 0 1 18 9v10.19l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 1 1 1.06-1.06l2.47 2.47V9a.75.75 0 0 1 .75-.75Zm-15 5.25a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs md:text-sm lg:text-sm">View as List</span>
                    </div>
                    </>
                  ) : (
                    <>
                    <div className="flex flex-row space-x-1 justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 lg:size-5">
                        <path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />
                      </svg>
                      <span className="text-xs md:text-sm lg:text-sm">View as Grid</span>
                     </div>
                    </>
                  )}
              </button>
            </div>
          </div>
          {!isGridView && (
          <div className ="bg-gray-50 text-xs md:text-sm lg:text-sm text-gray-500 text-center rounded-lg w-full flex flex-row justify-between px-[6%] py-2 opacity-0 animate-fadeInRight">
            <div className="px-0 lg:px-10"> ลำดับ </div>
            <div className="px-0 lg:px-10"> หมายเลขชุด </div>
            <div className="px-0 lg:px-10"> คำอธิบาย </div>
            <div className="px-0 lg:px-20"> สถานะ </div>
            <div className="px-0 lg:px-20"> เลือก </div>
          </div>
          )}
          <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "overflow-x-auto shadow-lg rounded-2xl m-1 opacity-0 animate-fadeInLeft"}>
            {sortedSets.map((set, index) => {
              const recordedCount = calculateRecordedCount(set.set_number);
              const totalScripts = scriptCounts[set.set_number] || 0;
              const statusIcon = getStatusIcon(recordedCount, totalScripts);
              const sequenceNumber = index + 1; // เลขลำดับเริ่มจาก 1
              
              return isGridView ? (
                <div key={set.set_number} className="flex flex-row justify-between bg-white p-4 rounded-3xl shadow-lg border-2 border-sky-100 hover:bg-blue-50 opacity-0 animate-fadeInLeft">
                  <div className="space-y-2 ">
                    <h2 className="text-xl text-red-500 font-prompt font-semibold ">ลำดับ {sequenceNumber}</h2>
                    <h2 className="text-md text-gray-500 font-prompt font-normal">ชุดที่ {set.set_number}</h2>
                    <p className="text-gray-500 ">จำนวน {totalScripts} สคริปต์</p>
                  </div>
                  <div className="space-y-8 ">
                    <div className=" flex-1 flex justify-center items-center">{statusIcon}</div>
                      <div className=""> {/*ปุ่ม */}
                        <Link
                          to={`/user/listone/${set.set_number}`}
                          className="bg-gradient-to-r from-[#EB4335] to-[#FF7C30] text-white py-1 px-5 lg:px-7 mx-1 rounded-full shadow-md "
                        >
                          เลือก
                        </Link>
                      </div>
                  </div>
                </div>
              ) : (
                <div key={set.set_number} className="flex flex-row items-center gap-x-2 space-x-10 border-b py-3 px-5 text-xs sm:text-sm lg:text-base hover:bg-sky-50 border opacity-0 animate-fadeInLeft">
                  <div className="flex-1 flex flex-row text-center justify-between ">
                    <span className="flex-1 font-prompt font-semibold text-gray-500 ">{sequenceNumber}</span>
                    <span className="flex-1 font-prompt font-normal text-gray-500 ">ชุดที่ {set.set_number}</span>
                    <div className="flex-1 text-gray-500 ">จำนวน {totalScripts} สคริปต์</div>
                  </div>
                  
                  <div className="flex-1 flex flex-row text-center justify-between ">
                      {/* ไอคอนสถานะ */}
                      <div className="flex-1 flex justify-center items-center ">
                        {statusIcon}
                      </div>

                      {/* ปุ่มเลือก */}
                      <div className="flex-1 flex justify-center items-center ">
                        <Link
                          to={`/user/listone/${set.set_number}`}
                          className="bg-gradient-to-r from-[#EB4335] to-[#FF7C30] text-white py-1 px-2 lg:px-5 mx-1 rounded-full shadow-md "
                        >
                          เลือก
                        </Link>
                      </div>
                    </div>
                </div>
                
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InteractiveTable;
