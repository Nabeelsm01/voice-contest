import React, { useEffect, useState } from "react";
import { FaRedoAlt, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import config from "../../../config";

const VoiceRecordHistory = () => {
  const [records, setRecords] = useState([]); // เก็บข้อมูลไฟล์เสียง
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [filterSetId, setFilterSetId] = useState(""); // เก็บค่ากรองชุด setFilterSetId
  const [filterScriptNumber, setFilterScriptNumber] = useState(""); // เก็บค่ากรองเลขสคริป 
  const [searchScript, setSearchScript] = useState(""); // เก็บค่าค้นหาสคริปต์
  const [users, setUsers] = useState([]); // เก็บข้อมูลผู้ใช้ทั้งหมด
  const [recordsWithUserNames, setRecordsWithUserNames] = useState([]); // เก็บข้อมูลพร้อมชื่อผู้ใช้
  const [filterUsername, setFilterUsername] = useState(""); 
  const [filterStatus, setFilterStatus] = useState("");

  // ดึงข้อมูลไฟล์เสียง
  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
        `${config.apiBaseUrl}/record/get_records_all`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        });
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }
        const data = await response.json();
        setRecords(data); // ตั้งค่าข้อมูลใน state
        // console.log("จำนวนการอัดของ:", data.filter(item => item.status_record === "completed").length);
        // นับจำนวนอัดสำเร็จของแต่ละ user_id
        const completedCounts = data.reduce((acc, item) => {
          if (item.status_record === "completed") {
            acc[item.user_id] = (acc[item.user_id] || 0) + 1;
          }
          return acc;
        }, {});

        console.log("จำนวนการอัดของแต่ละคน:", completedCounts);
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error.message);
      } finally {
        setLoading(false); // เปลี่ยนสถานะการโหลด
      }
    };

    fetchAudioFiles();
  }, []); // รันเมื่อ user เปลี่ยนค่า

  const handleDelete = async (setId, scriptNumber, userId) => {
    const confirm = await Swal.fire({
      title: `คุณต้องการลบชุด ${setId} และสคริปต์ ${scriptNumber} หรือไม่?`,
      text: "ลบแล้วไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/record/delete_record_all?user_id=${userId}&set_id=${setId}&script_number=${scriptNumber}`,
          {
            method: "DELETE",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          }
        );
   

        if (response.ok) {
          const result = await response.json();
          Swal.fire("ลบสำเร็จ!", result.message, "success");
          setRecords((prev) =>
            prev.filter(
              (record) =>
                record.set_id !== setId || record.script_number !== scriptNumber
            )
          );
        } else {
          const errorData = await response.json();
          Swal.fire("ลบไม่สำเร็จ", errorData.detail, "error");
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openApproveModal = (setId, scriptNumber) => {
      setSelectedRecord({ setId, scriptNumber });
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setSelectedRecord(null);
      setIsModalOpen(false);
    };

    const updateStatus = async (setId, scriptNumber, userId) => {
      const { value: status } = await Swal.fire({
        title: "<span class='text-gray-600 font-prompt'> เลือกสถานะของสคริปต์ </span>",
        input: "radio",
        inputOptions: {
          completed: "<span class='text-sm text-green-600 font-prompt font-semibold whitespace-nowrap border border-green-200 p-2 rounded-2xl shadow-lg cursor-pointer hover:bg-green-50'>อนุมัติ (Completed)</span>",
          rejected: "<span class='text-sm text-red-600 font-prompt font-semibold whitespace-nowrap border border-red-200 p-2 rounded-2xl shadow-lg cursor-pointer hover:bg-red-50'>ปฏิเสธ (Rejected)</span>",
        },
        inputValidator: (value) => {
          if (!value) {
            return "กรุณาเลือกสถานะก่อน!";
          }
        },
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#4CAF50", // สีเขียว
        cancelButtonColor: "#d33",
        customClass: {
          input: "text-lg", // เพิ่มระยะห่างให้ radio
          popup: "rounded-2xl w-[35%] shadow-lg ", // ปรับกล่อง modal
          confirmButton: "px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-200",
          cancelButton: "px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-200",
        },
      });
    
      if (!status) return;
    
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/record/update_status?user_id=${userId}&set_id=${setId}&script_number=${scriptNumber}&status=${status}`,
          { method: "PUT", 
            credentials: "include" // แนบ Cookie ไปกับคำขอ
          }
        );
    
        if (response.ok) {
          const result = await response.json();
    
          await Swal.fire({
            title: "สำเร็จ!",
            text: `สถานะถูกอัปเดตเป็น "${status === "completed" ? "Completed" : "Rejected"}"`,
            icon: "success",
            confirmButtonText: "ตกลง",
          });
    
          setRecords((prev) =>
            prev.map((record) =>
              record.user_id === userId && record.set_id === setId && record.script_number === scriptNumber
                ? { ...record, status_record: status }
                : record
            )
          );
          
        } else {
          const errorData = await response.json();
          Swal.fire({
            title: "ผิดพลาด!",
            text: errorData.detail,
            icon: "error",
            confirmButtonText: "ตกลง",
          });
        }
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถอัปเดตสถานะได้",
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      }
    };
    

    // ดึงข้อมูลผู้ใช้
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/user/all_users/`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
          if (!response.ok) {
            throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
          }
          const data = await response.json();
          setUsers(data); // เก็บข้อมูลผู้ใช้ทั้งหมด
          console.log("ข้อมูลการอัดเสียง",data);
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
        }
      };
    
      fetchUsers();
    }, []);
  
    // รวมข้อมูลชื่อผู้ใช้เข้ากับ records
    useEffect(() => {
      if (records.length > 0 && users.length > 0) {
        const enrichedRecords = records.map((record) => {
          const user = users.find((user) => user._id === record.user_id); // หาผู้ใช้จาก user_id
          return {
            ...record,
            user_name: user ? `${user.firstname} ${user.lastname}` : "ไม่ทราบชื่อ", // รวมชื่อและนามสกุล
          };
        });
        setRecordsWithUserNames(enrichedRecords); // ตั้งค่าข้อมูลใหม่
      }
    }, [records, users]);

     // ฟังก์ชันกรองข้อมูล
    // ฟังก์ชันกรองข้อมูล
    // const filteredRecords = recordsWithUserNames
    //   .filter((record) =>
    //     filterSetId ? record.set_id.toString() === filterSetId : true &&
    //     filterScriptNumber ? record.script_number.toString() === filterScriptNumber : true 
    //   )
    //   .filter((record) =>
    //     searchScript
    //       ? record.script_number.toString().includes(searchScript) ||
    //         record.textinput_id.toString().includes(searchScript) ||
    //         record.user_name.toLowerCase().includes(searchScript.toLowerCase()) || // ค้นหาชื่อผู้ใช้
    //         record.set_id.toString().includes(searchScript)
    //       : true
    //   )
    //   .sort((a, b) => a.script_number - b.script_number); // จัดเรียงลำดับสคริปต์
    // ฟังก์ชันกรองข้อมูล
    // ฟังก์ชันกรองข้อมูล
  // ส่วนของการกรองและเรียงลำดับ

  const filteredRecords = recordsWithUserNames
    .filter((record) => {
      const setIdMatch = filterSetId ? record.set_id.toString() === filterSetId : true;
      const scriptNumberMatch = filterScriptNumber ? 
        record.script_number.toString() === filterScriptNumber : true;
      const usernameMatch = filterUsername ? 
        record.user_name === filterUsername : true;  
      const statusMatch = filterStatus ? 
        record.status_record === filterStatus : true; 
      const searchMatch = searchScript
        ? record.script_number.toString().includes(searchScript) ||
          record.textinput_id.toLowerCase().includes(searchScript.toLowerCase()) ||
          record.user_name.toLowerCase().includes(searchScript.toLowerCase()) ||
          record.set_id.toString().includes(searchScript)
        : true;
      
      return setIdMatch && scriptNumberMatch && usernameMatch && statusMatch && searchMatch;
    })
    .sort((a, b) => {
      // กรองตาม username
      if (filterUsername || filterStatus) {
        // เรียงตาม set_id ก่อน
        const setIdCompare = a.set_id - b.set_id;
        if (setIdCompare !== 0) {
          return setIdCompare;
        }
        // ถ้า set_id เท่ากัน เรียงตาม script_number
        return a.script_number - b.script_number;
      }
      
      // กรองตาม set_id
      if (filterSetId) {
        return a.script_number - b.script_number;
      }
      
      // กรองตาม script_number
      if (filterScriptNumber) {
        return a.set_id - b.set_id;
      }

    // Parse dates in format "DD-MM-YYYY HH:MM:SS"
    const parseDateString = (dateStr) => {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hours, minutes, seconds] = timePart.split(':');
      
      // Note: Month is 0-based in JavaScript Date
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const dateA = parseDateString(a.created_at);
    const dateB = parseDateString(b.created_at);

    return dateB - dateA; // Sort newest to oldest
  });


  return (
    <div className="bg-gray-100 px-4 py-4 h-screen">
      <div className="bg-white rounded-[50px] shadow-lg w-full m-1 max-w-[87rem] p-10   ">
        <div className="flex justify-between items-center mb-4 ">
          <h2 className="text-2xl font-prompt font-semibold text-black ">ประวัติบันทึกเสียง</h2>
          <div className="flex space-x-3">
          {/* <select
            className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 "
            value={filterSetId}
            onChange={(e) => setFilterSetId(e.target.value)}
          >
            <option value="">ชุดทั้งหมด</option>
            {[...new Set(records.map((r) => r.set_id))] // หาค่าที่ไม่ซ้ำจาก set_id
              .sort((a, b) => a - b) // เรียงลำดับจากน้อยไปมาก
              .map((setId) => (
                <option key={setId} value={setId}>
                  ชุดที่ {setId}
                </option>
              ))}
          </select>
          <select
            className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 "
            value={filterScriptNumber}
            onChange={(e) => setFilterScriptNumber(e.target.value)}
          >
            <option value="">สคริปทั้งหมด</option>
            {[...new Set(records.map((r) => r.script_number))] // หาค่าที่ไม่ซ้ำจาก set_id
              .sort((a, b) => a - b) // เรียงลำดับจากน้อยไปมาก
              .map((script_number) => (
                <option key={script_number} value={script_number}>
                  สคริปที่ {script_number}
                </option>
              ))}
          </select> */}
          <select
            className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 bg-white text-gray-600"
            value={filterSetId}
            onChange={(e) => setFilterSetId(e.target.value)}
          >
            <option value="">ชุดทั้งหมด</option>
            {[...new Set(records.map((r) => r.set_id))]
              .sort((a, b) => a - b) // เรียงตัวเลขจากน้อยไปมาก
              .map((setId) => (
                <option key={setId} value={setId}>
                  ชุดที่ {setId}
                </option>
              ))}
          </select>

          <select
            className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 bg-white text-gray-600"
            value={filterScriptNumber}
            onChange={(e) => setFilterScriptNumber(e.target.value)}
          >
            <option value="">สคริปทั้งหมด</option>
            {[...new Set(records.map((r) => r.script_number))]
              .sort((a, b) => a - b) // เรียงตัวเลขจากน้อยไปมาก
              .map((script_number) => (
                <option key={script_number} value={script_number}>
                  สคริปที่ {script_number}
                </option>
              ))}
          </select>

            {/* เพิ่ม select สำหรับกรองชื่อผู้ใช้ */}
            <select
              className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 bg-white text-gray-600"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
            >
              <option value="">ผู้ใช้ทั้งหมด</option>
              {[...new Set(recordsWithUserNames.map((r) => r.user_name))]
                .sort()
                .map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
            </select>

            <select
            className="border border-gray-300 rounded-2xl w-[7vw] px-3 py-1 bg-white text-gray-600"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">สถานะ</option>
            {[...new Set(records.map((r) => r.status_record))]
              .sort((a, b) => a - b) // เรียงตัวเลขจากน้อยไปมาก
              .map((status_record) => (
                <option key={status_record} value={status_record}>
                  {status_record}
                </option>
              ))}
          </select>

            <input
              type="text"
              placeholder="ค้นหา..."
              className="border border-gray-300 rounded-2xl w-[15vw] px-3 py-1 bg-white text-gray-600"
              value={searchScript}
              onChange={(e) => setSearchScript(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div>กำลังโหลดข้อมูล...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="">
            <table className="table-fixed w-full  ">
              <thead>
                <tr className="text-left text-gray-500 font-medium text-[13px]">
                  <th className="w-1/12 text-center">เลขชุด</th>
                  <th className="w-1/12 text-center">เลขสคริป</th>
                  <th className="w-3/12 pl-2">สคริป</th>
                  <th className="w-2.3/12 text-center">ไฟล์เสียง</th>
                  <th className="w-2/12 text-center">เวลา</th>
                  <th className="w-1.5/12 text-left">ชื่อผู้ใช้</th>
                  <th className="w-1/12">สถานะ</th>
                  <th className="w-1/12">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50 text-[14.5px]" : "bg-white text-[14.5px]"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-2 truncate text-center bg-white text-gray-600">ชุด {record.set_id}</td>
                    <td className="py-3 px-2 truncate text-center bg-white text-gray-600">
                      {record.script_number}
                    </td>
                    <td className="py-3 px-2 truncate bg-white text-gray-600">{record.textinput_id}</td>
                    <td className="py-3 px-2 bg-white text-gray-600">
                      <audio
                        controls
                        className="w-[10vw] h-[3vw] shadow-md border border-blue-200 rounded-full text-center bg-white text-gray-600"
                      >
                        <source
                          src={`${config.apiBaseUrl}/record/play/${record.file_path}`}
                          type="audio/wav"
                        />
                        Your browser does not support the audio element.
                      </audio>
                    </td>
                    <td className="py-3 text-center bg-white text-gray-600">{record.created_at}</td>
                    <td className="py-3 px-1 truncate text-left bg-white text-gray-600">{record.user_name}</td> {/* แสดงชื่อผู้ใช้ */}
                    <td className={`py-3 px-1  font-medium 
                      ${record.status_record === "completed" ? "text-green-500" : ""} 
                      ${record.status_record === "pending" ? "text-yellow-500" : ""} 
                      ${record.status_record === "rejected" ? "text-red-500" : ""}
                    `}>
                      {record.status_record}
                    </td>
                    <td className="pt-4 px-2 flex items-center space-x-1 justify-center ">
                    <button
                        className="text-blue-500 hover:text-gray-600 p-1 rounded-full border border-blue-200 shadow-lg bg-white"
                        onClick={() =>
                          updateStatus(record.set_id, record.script_number, record.user_id)
                        }
                      >
                       <span className="px-1 font-prompt">อนุมัติ</span>
                     

                      </button>
                    <button
                        className="text-blue-500 hover:text-gray-600 p-1 rounded-full border border-blue-200 shadow-lg bg-white"
                        // onClick={() =>
                        //   handleDelete(record.set_id, record.script_number)
                        // }
                      >
                       <i className="fa-solid fa-download p-1"></i>
                      </button>
                      <button
                        className="text-red-500 hover:text-gray-600 p-1 rounded-full border border-red-200 shadow-lg bg-white "
                        onClick={() =>
                          handleDelete(record.set_id, record.script_number, record.user_id)
                        }
                      >
                        {/* <FaTrashAlt className="p-1 size-6"/> */}
                        <i className="fa-solid fa-trash-can p-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>ไม่พบไฟล์เสียง</div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecordHistory;
