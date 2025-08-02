import React, { useState, useEffect } from "react";
import "../style/popup.css";
import config from "../../config";
import Swal from "sweetalert2";

const AgreementModal = ({ onAgree, onCancel, email , Invite}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreement, setAgreement] = useState("");
  const [loading, setLoading] = useState(false);
  console.log("email", email);
  console.log("Invite", Invite);
  useEffect(() => {
    setIsModalOpen(true);

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleModalClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleAgree = async () => {
    if (agreement === "agree") {
      setLoading(true);
      try {
        // ส่งคำขอไปยัง API
        const response = await fetch(`${config.apiBaseUrl}/user/agreement/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, agreement: true }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("API Response:", result);

          Swal.fire({
            icon: "success",
            title: "สำเร็จ!",
            text: "ยอมรับข้อตกลงเรียบร้อย",
            showConfirmButton: false,
            allowOutsideClick: false, // ป้องกันการคลิกพื้นที่ว่าง
            allowEscapeKey: false, // ป้องกันการกด Escape
            timer: 1000, // แสดง popup 1 วินาที
            timerProgressBar: true,
          }).then(() => {
            if (onAgree) {
              onAgree(); // Callback จาก parent component
              localStorage.removeItem("invite"); // ลบ invite ออกจาก localStorage
            }
            localStorage.removeItem("invite"); // ลบ invite ออกจาก localStorage
          });
        } else {
          const error = await response.json();
          alert(
            `เกิดข้อผิดพลาด: ${error.detail || "ไม่สามารถอัปเดตข้อมูลได้"}`
          );
        }
      } catch (error) {
        console.error("Error calling API:", error);
        setIsModalOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "กรุณายอมรับข้อตกลง",
        showConfirmButton: false,
        allowOutsideClick: true, // ปิดการคลิกพื้นที่ว่าง
        allowEscapeKey: false, // ปิดการกด Escape
        timer: 1500, // ตั้งเวลา popup หายไปอัตโนมัติ (ms)
        timerProgressBar: true, // แสดงแถบความคืบหน้า
      });
    }
  };

  const handleModalClose = () => {
    if (onCancel) {
      onCancel();
      localStorage.removeItem("invite"); // ลบ invite ออกจาก localStorage

    }
    setIsModalOpen(false); // ปิด Modal หลัง SweetAlert2
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6 ">
      <div
        className="card bg-white rounded-2xl shadow-xl w-96 max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Invitation Header */}
        {Invite && Invite !== "-" && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            คุณได้รับเชิญจาก: <strong>{Invite ? Invite : "  - "}</strong>
          </span>
          <div className="flex items-center justify-between ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          </div>
        </div>
        )}

        {/* ข้อกำหนดเเละเงื่อนไข */}
        <div className=" card bg-red-100 rounded-2xl p-5 m-8 mx-3 shadow-md max-h-72 overflow-y-auto">
          <h5 className="text-xl text-red-500 text-center font-bold mb-3">
         Record
          </h5>
          <div className="text-gray-700 text-sm space-y-2">
            {/* ข้อตกลงการใช้งาน */}
            <section>
              <h6 className="font-semibold mb-2">
                1. ข้อตกลงการใช้งาน (Terms of Use)
              </h6>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  การยอมรับข้อตกลง ผู้ใช้ต้องยอมรับเงื่อนไขก่อนใช้งานเว็บไซต์
                </li>
                <li>
                  การเก็บข้อมูลเสียง เราบันทึกเสียงของผู้ใช้เพื่อปรับปรุงบริการ
                </li>
                <li>ข้อห้ามการใช้งาน ห้ามกระทำผิดกฎหมายหรือทำลายระบบ</li>
                <li>
                  การเปลี่ยนแปลงข้อตกลง อาจมีการเปลี่ยนแปลงโดยไม่แจ้งล่วงหน้า
                </li>
              </ul>
            </section>

            {/* นโยบายความเป็นส่วนตัว */}
            <section>
              <h6 className="font-semibold mt-3 mb-2">
                2. นโยบายความเป็นส่วนตัว (Privacy Policy)
              </h6>
              <li className="list-none">
                การเก็บข้อมูล เราเก็บข้อมูลส่วนบุคคล เช่น ชื่อ อีเมล
                และเบอร์โทรอย่างปลอดภัย
              </li>
              <li className="list-none mt-2">
                นโยบายเกี่ยวกับการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคล
              </li>
              <ul className="list-disc pl-5 space-y-1">
                <li className="font-semibold mt-2 list-none">
                  2.1 แหล่งที่มาของข้อมูลส่วนบุคคล
                </li>
                <li className="ml-2 list-none">
                บริษัทอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านจากแหล่งต่าง ๆ ดังต่อไปนี้:
                </li>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    จากท่านโดยตรง เช่น ข้อมูลที่ให้ไว้ขณะลงทะเบียนสมัครสมาชิก
                  </li>
                  <li>
                    เพื่อให้มั่นใจว่าข้อมูลของท่านเป็นปัจจุบัน
                    และพัฒนาการให้บริการ
                  </li>
                </ul>

                <li className="font-semibold mt-2 list-none">
                  2.2 ประเภทของข้อมูลส่วนบุคคล
                </li>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    ข้อมูลระบุตัวตน เช่น ชื่อ-นามสกุล, เพศ, หมายเลขโทรศัพท์,
                    อีเมล
                  </li>
                  <li>
                    ข้อมูลเสียง ภาพ หรือข้อมูลอิเล็กทรอนิกส์อื่น ๆ
                    ที่สามารถระบุตัวตนได้
                  </li>
                </ul>

                <li className="font-semibold mt-2 list-none">
                  2.3 วัตถุประสงค์ในการเก็บข้อมูล
                </li>
                  <li className="ml-2 list-none">
                    บริษัทจะใช้ข้อมูลเพื่อให้บริการที่ตรงกับความต้องการของท่าน รวมถึงพัฒนาระบบต่าง ๆ
                  </li>
                <li className="font-semibold mt-2 list-none">
                  2.4 การเปิดเผยข้อมูลส่วนบุคคล
                </li>
                <li className="ml-2 list-none">
                บริษัทให้ความสำคัญกับความเป็นส่วนตัวของท่านและจะไม่นำข้อมูลส่วนบุคคลไปเปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอมล่วงหน้าจากท่าน
                </li>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                  บุคลากรที่เกี่ยวข้องภายในบริษัท ซึ่งจะได้รับมอบหมายให้ปฏิบัติงานที่เกี่ยวข้องกับการให้บริการ
                  </li>
                  <li>
                  บริษัทจะดำเนินมาตรการที่เหมาะสมเพื่อให้บุคคลเหล่านั้นรักษาความลับของข้อมูลส่วนบุคคลของท่าน
                  </li>
                </ul>

                <li className="font-semibold mt-2 list-none">
                  2.5 การใช้คุกกี้ (Cookies)
                </li>
                  <li className="ml-2 list-none">
                    คุกกี้ถูกใช้เพื่ออำนวยความสะดวกและปรับปรุงประสบการณ์ใช้งานเว็บไซต์ให้ตรงกับความต้องการของท่าน
                  </li>
                <li className="font-semibold mt-2 list-none">
                  2.6 สิทธิของท่านเกี่ยวกับข้อมูลส่วนบุคคล
                </li>
                <ul className="list-disc ml-6 space-y-1">
                  <li>การแก้ไขหรือปรับปรุงข้อมูลส่วนบุคคล</li>
                  <li>การลบข้อมูลส่วนบุคคลภายใต้เงื่อนไขที่กฎหมายกำหนด</li>
                </ul>
              </ul>

              <p className="leading-relaxed mt-4">
                หากท่านมีข้อสงสัยเพิ่มเติมเกี่ยวกับนโยบายการเก็บข้อมูล
                ท่านสามารถติดต่อบริษัทผ่านช่องทางที่กำหนดในเว็บไซต์
              </p>
            </section>
          </div>
        </div>

        {/* Radio Button Agreement */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="agreement"
              value="agree"
              checked={agreement === "agree"}
              onChange={() => setAgreement("agree")}
            />
            <span className="ml-2 text-gray-700">
              ฉันได้อ่านและยอมรับข้อตกลงการใช้งาน
            </span>
          </label>
        </div>

        {/* ปุ่มการดำเนินการ*/}
        <div className="flex justify-between space-x-4">
          <button
            onClick={handleModalClose}
            className="flex-1 bg-red-400 text-white py-2 rounded-full hover:bg-red-500 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAgree}
            className="flex-1 bg-green-400 text-white py-2 rounded-full hover:bg-green-500 transition"
          >
            ยอมรับ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;
