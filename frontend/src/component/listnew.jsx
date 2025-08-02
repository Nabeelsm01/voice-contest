import React from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const Listnew = () => {
    const Thealert = () => {
        Swal.fire({
          title: "<h2 class='text-xl text-start font-bold text-red-400'>รายละเอียดชุดข้อความ</h2>",
          html: `
            <ul class="card bg-gray-300 text-left list-disc p-4 list-inside">
              <li>ชุดข้อความจะมีทั้งหมด <b>50 ชุด</b> แต่ละชุดข้อความจะมี <b>50 สคริป</b> ให้ผู้ใช้ได้ทำการอัด</li>
              <li>เมื่อผู้ใช้ได้ทำการอัดเสียงสำเร็จ จำนวนของการอัดจะเพิ่มขึ้นตามที่ผู้ใช้ได้ทำการอัด</li>
              <li>เมื่อผู้ใช้อัดเสียงครบ <b>50 สคริป</b> ไอคอนจะทำการเปลี่ยนเป็นเครื่องหมายถูกต้อง</li>
            </ul>
          `,
          showCloseButton: true,
          showConfirmButton: false,
        });
      };
      
    
  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto py-8 px-auto min-h-screen ">
        <div className=" bg-white w-[90%] h-full shadow-lg rounded-[50px] px-16 py-10  mx-auto ">
          <div className="flex sm:flex-row justify-between items-center mb-5 ">
            <h1 className="text-center text-sm md:text-[20px] lg:text-[30px] font-bold text-orange-600 animate__bounceIn">
              ชุดข้อความทั้งหมด
            </h1>
            <div className="card  bg-gray-100 rounded-[30px] shadow-md  p-2 flex flex-row justify-center items-center gap-2  ">
              <Link  
              className="flex items-center">
                <svg onClick={Thealert} 
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="block text-gray-500 w-6 h-6 md:w-8 md:h-8 sm:w-8 sm:h-8"
                  style={{ color: "red" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                {/* <h2 className="ml-1 sm:ml-4 text-red-500 md:text-md text-sm font-bold hidden sm:block">
                  ดูรายละเอียดกฏกติกา
                </h2> */}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  md:gap-0 gap-4 text-center ">
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-md p-6 lg:h-4/6 lg:w-6/12 md:w-9/10 md:h-4/6 w-3/5 transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem] "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
            </Link>
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-lg p-2 lg:h-4/6 md:w-9/10 md:h-4/6  lg:w-8/12  w-3/5 m-2 transform hover:scale-105 focus:scale-105 transition-transform duration-200 border-2 border-white">
                <p className="text-center text-xl text-gray-500 ">ชุดที่ 1</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem]" /* reponsive */
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
                <div className="card bg-green-400 justify-center items-center text-lg text-white w-16 m-1 ">
                  30/50
                </div>
              </div>
            </Link>
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-lg p-6 sm:h-4/6 sm:w-9/12 w-3/5 transform hover:scale-105 focus:scale-105 transition-transform duration-200  border-2 border-white">
                <p className="text-center text-xl text-gray-500 "> ชุดที่ 1</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                  />
                </svg>
                <div className="card bg-green-400 justify-center items-center text-lg text-white w-16 m-1 ">
                  30/50
                </div>
              </div>
            </Link>
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-md p-6 sm:h-4/6 sm:w-9/12 w-3/5 transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem] "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
            </Link>
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-md p-6 sm:h-4/6 sm:w-9/12 w-3/5 transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem] "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
            </Link>
            <Link
              to="/use"
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="flex flex-col justify-center items-center bg-gray-100 rounded-[40px] shadow-md p-6 sm:h-4/6 sm:w-9/12  w-3/5 transform hover:scale-105 focus:scale-105 transition-transform duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="gray"
                  className="sm:text-gray-500 w-[60px] h-[60px] sm:w-[90px] sm:h-[10rem] "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Listnew;
