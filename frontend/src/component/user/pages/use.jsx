import React from "react";
import { Link } from "react-router-dom";
import useImage from "../../../assets/use.png"; // นำเข้ารูปภาพ
import popImage from "../../../assets/pop.png";
import Swal from "sweetalert2";

const Use = () => {
  const TheModal = () => {
    //แสดงปอปอัป
    Swal.fire({
      title: `<h2 class="text-left">รายละเอียดกฎกติกา</h2>`, // หัวข้อชิดขวา
      html: `
        <div class="text-left">
       <div class="absolute  md:left-0 md:transform md:-translate-y-40 left-0 transform -translate-y-36 w-full flex justify-center items-center text-center">
        <button 
          class="bg-[#e1c61f] hover:bg-red-100 text-black rounded-full border-2 border-white hover:border-white md:h-12 md:w-32 h-10 w-24 md:text-sm text-[12px] text-center font-bold"
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
      <main className="container mx-auto ">
        <div className="card bg-white w-[90%] h-full lg:w-[90%] lg:h-[90%]  md:w-[90%] md:h-full p-2 shadow-lg rounded-[40px] mx-auto overflow-hidden">
          <div className="flex sm:flex-row justify-between items-center mx-2 p-5">
            <h1 className="font-prompt font-semibold lg:text-xl md:text-xl text-sm font-bold text-orange-600 animate-fadeInLeft ">
              วิธีการใช้งาน
            </h1>
            <div className="group rounded-[30px] border-2 border-transparent p-1 flex items-center justify-between transition-all duration-300 hover:border-red-500 animate-fadeInRight ">
              {/* ปอปอัปรายละเอียดกติกา */}
              <Link
                onClick={TheModal}
                className="text-red-500 flex items-center justify-between "
              >
                <h2 className="w-auto text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2">
                  รายละกฎเอียดกฏกติกา
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="block text-gray-500 w-7 h-7 md:w-8 md:h-8 border border-red-200 rounded-full shadow-sm shadow-red-400"
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

          {/* ใส่รูปภาพ */}
          <div className="flex justify-center items-center animate-fadeInLeft">
            <img
              src={useImage}
              alt="ขั้นตอนการใช้งาน"
              className="w-10/12 lg:w-[60%] "
            />
          </div>

          {/* การ์ดย่อยสำหรับขั้นตอนการใช้งาน */}
          <div className="card bg-gradient-to-b from-red-50 to-orange-50 border border-white sm:w-10/12 w-11/12 border-2 shadow-xl min-w-screen-xl m-2 p-5 rounded-[20px] px-5 mx-auto max-h-[300px] md:max-h-[300px] lg:max-h-[300px] h-full overflow-y-auto animate-fadeInRight">
            <h2 className="sm:text-xl font-semibold text-red-500 font-prompt">ขั้นตอนการใช้งาน</h2>
            <div className="space-y-4 mt-4">
              {/* รายการขั้นตอน */}
              <ol className="list-decimal pl-6  text-gray-500 font-prompt text-sm lg:text-md space-y-2">
                <li>
                  <strong>ปุ่มอัดเสียง</strong>
                  <ul className="list-inside ">
                    <li>
                      - กดปุ่มไอคอนไมโครโฟน กดครั้งแรก เพื่อเริ่มอัดเสียง
                      กดอีกครั้ง เพื่อหยุดอัดเสียงพร้อมบันทึกเสียง
                    </li>
                    <li>
                      - อัดเสียงพูดตามสคริปต์ที่กำหนดไว้
                      โดยคุณสามารถเห็นเวลาที่อัดอยู่ด้านล่าง
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มฟังเสียง</strong>
                  <ul className="list-inside">
                    <li>
                      - กดปุ่มฟังเสียง (ปุ่มไอคอน ▶︎)
                      เพื่อฟังเสียงที่คุณได้อัดไว้
                    </li>
                    <li>
                      - การบันทึกเสียงจะหยุดชั่วคราว
                      แต่ข้อมูลก่อนหน้าจะยังคงถูกเก็บไว้
                    </li>
                    <li>- ใช้ปุ่มนี้เพื่อตรวจสอบความถูกต้องของการอัดเสียง</li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มเริ่มอัดใหม่</strong>
                  <ul className="list-inside">
                    <li>- หากต้องการที่จะทำการเริ่มการอัดเสียงใหม่</li>
                    <li>- สามารถกดปุ่มนี้เพื่อเริ่มอัดเสียงใหม่</li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มประวัติบันทึกเสียง</strong>
                  <ul className="list-inside">
                    <li>
                      - ปุ่นประวัติบันทึกเสียง
                      กดปุ่มนี้เพื่อดูประวัติเสียงของผู้ใช้ที่เคยบันทึกไว้แล้ว
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มตัวอย่างเสียง</strong>
                  <ul className="list-inside">
                    <li>
                      - ปุ่มตัวย่างเสียง กดปุ่มนี้เพื่อฟังเสียงตัวอย่างที่ควรอัด
                    </li>
                    <li>
                      - เมื่อผู้ใช้กดเข้าไปแล้ว
                      จะเด็งป๊อบอัพขึ้นมาเพื่อฟังเสียงตัวอย่าง
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มดูสคริปทั้งหมด</strong>
                  <ul className="list-inside">
                    <li>- ปุ่มดูสคริปทั้งหมด กดปุ่มนี้เพื่อดูสคริปทั้งหมด</li>
                    <li>
                      - เมื่อผู้ใช้กดเข้าไปแล้ว จะมีให้เลือกอัดสคริปทั้งหมด 50
                      สคริป
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>ปุ่มเลื่อนสคริป</strong>
                  <ul className="list-inside">
                    <li>
                      - ปุ่มเลื่อนสคริป (ปุ่มไอคอน ▲▼︎)
                      กดปุ่มนี้เพื่อเลื่อนสคริปถัดไป
                    </li>
                    <li>- เมื่อผู้ใช้กดปุ่ม มีการเปลี่ยนสคริปถัดไป</li>
                  </ul>
                </li>
                <li>
                  <strong>แจ้งเตือน</strong>
                  <ul className="list-inside">
                    <li>- เป็นสถานะเตือนบอกถึงเมื่อผู้ใช้ได้ทำการอัดแล้ว</li>
                    <li>
                      - เมื่อผู้ใช้อัดเสร็จเรียบร้อยแล้ว
                      จะขึ้นแจ้งเตือนลักษณะถูกต้อง
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>สคริปที่ต้องอัด</strong>
                  <ul className="list-inside">
                    <li>
                      - เป็นการบอกให้ผู้ใช้รับรู้ว่าต้องอัดเสียงเป็นประโยคไหน
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>ลำดับสคริป</strong>
                  <ul className="list-inside">
                    <li>- เป็นการบอกให้ผู้ใช้รับรู้ว่าลำดับสคริปที่เท่าไร</li>
                  </ul>
                </li>
                <li>
                  <strong>จำนวนที่อัด</strong>
                  <ul className="list-inside">
                    <li>
                      - เป็นการบอกให้ผู้ใช้รู้ว่าสถานะที่ผู้ใช้อัดไปแล้ว
                      จำนวนกี่สคริป
                    </li>
                    <li>
                      - สมมุติว่าผู้ใช้ได้ 5 คริป ตัวเลขที่ขึ้นให้เห็นคือ 5/50
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>หลอดวัดระดับเสียง</strong>
                  <ul className="list-inside">
                    <li>
                      - จะมีให้เห็นว่าเสียงที่เราอัดเข้าไป มีความดังระดับไหน
                    </li>
                    <li>
                      - ผู้ใช้ควรอัดเสียงที่พอเหมาะ ปานกลาง
                      ซึ่งจะอยู่ในช่วงสีเหลือง
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
            {/* ข้อความเพิ่มเติม */}
            {/* <p className="mt-4 text-gray-600 text-center">
              หากต้องการรายละเอียดเพิ่มเติมเกี่ยวกับระบบ
              สามารถติดต่อฝ่ายสนับสนุนหรือศึกษาคู่มือเพิ่มเติมผ่านเว็บไซต์ของเรา!
            </p> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Use;
