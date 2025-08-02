import React from "react";
import { Link } from "react-router-dom";

const Rules = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
        {/* Back Button */}
        <div className="flex justify-start pt-4 sm:ml-0 lg:ml-12 mx-2">
        <Link to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="gray"
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
      <main className="container mx-auto sm:py-5 px-auto min-h-screen">
        {/* Card for Rules */}
        <div className="flex flex-col justify-center align-center bg-white w-[90%]  h-full  mb-5 p-5 shadow-2xl rounded-[50px] px-5 mx-auto">
          <div className="flex flex-row w-full h-full min-w-screen-xl mb-2 p-2 px-10">
            <h1 className="text-2xl font-bold text-orange-600">
              กฏกติการางวัล
            </h1>
          </div>

          {/* Rule Details */}
          <div className="card bg-red-100 w-5/6 h-full  min-w-screen-xl mb-5 p-5 shadow-xl rounded-[50px] px-5 mx-auto">
            <h2 className="text-xl font-semibold">รายละเอียดกฏกติกา</h2>
            <div className="space-y-4 mt-4">
              <ol className="list-decimal pl-6 text-base text-gray-700">
                <li>
                  <strong>รางวัล iPhone 16 - 128G</strong>
                  <ul className="list-inside">
                    <li>- ผู้แนะนำที่มีผู้มาบันทึกมากที่สุด</li>
                  </ul>
                </li>
                <br />
                <li>
                  <strong>รางวัล iPhone 16 - 128G</strong>
                  <ul className="list-inside">
                    <li>
                      - ผู้ได้รับเลือกจากบริษัท CALL VOICE COMMUNICATIONS
                      และปฏิเสธข้อโต้แย้งใดๆ
                      การตัดสินของกรรมการถือเป็นที่สิ้นสุด
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rules;