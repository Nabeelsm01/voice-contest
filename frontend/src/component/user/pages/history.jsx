import React, { useEffect, useState, useRef  } from "react";
import { FaRedoAlt, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import config from "../../../../config";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const VoiceRecordHistory = () => {
  const [records, setRecords] = useState([]); // เก็บข้อมูลไฟล์เสียง
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [user, setUser] = useState(null); // เก็บข้อมูลผู้ใช้
  const [filterSetId, setFilterSetId] = useState(""); // เก็บค่ากรองชุด
  const [filterScriptNumber, setFilterScriptNumber] = useState(""); // เก็บค่ากรองเลขสคริป 
  const [searchScript, setSearchScript] = useState(""); // เก็บค่าค้นหาสคริปต์
  const { set_number } = useParams(); // ดึง set_number จาก URL params
  const [filterStatus, setFilterStatus] = useState("");

  const [isPopupOpen, setIsPopupOpen] = useState(false); // ปอปอัพ
  const [selectedRecord, setSelectedRecord] = useState(null); // เก็บข้อมูลไฟล์เสียง
  const navigate = useNavigate(); // ใช้สำหรับ Redirect ไปหน้าอื่น

  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null); // สำหรับ Web Audio API
  const analyserNodeRef = useRef(null); // ใช้สำหรับการวิเคราะห์
  const sourceNodeRef = useRef(null); // ใช้เชื่อมต่อไฟล์เสียงใน Web Audio API
  const [audioStates, setAudioStates] = useState({}); // สถานะของการเล่นเสียงแต่ละไฟล์
  const [isSafariIos, setIsSafariIos] = useState(false); // สำหรับเช็ค Safari iOS
  const [currentPlaying, setCurrentPlaying] = useState(null); // เก็บข้อมูลไฟล์ที่กำลังเล่นอยู่

  // เปิดปอปอัพ
  const openPopup = (record) => {
    setSelectedRecord(record);
    setIsPopupOpen(true);
  };
  // ปิดปอปอัพ
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedRecord(null);
  };

  // ดึงข้อมูลผู้ใช้
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

  // ดึงข้อมูลไฟล์เสียง
  useEffect(() => {
    const fetchAudioFiles = async () => {
      if (!user) return; // รอจนกว่าจะได้ user._id
      setLoading(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/record/get_records?user_id=${user._id}`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }
        const data = await response.json();
        setRecords(data); // ตั้งค่าข้อมูลใน state
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error.message);
      } finally {
        setLoading(false); // เปลี่ยนสถานะการโหลด
      }
    };

    fetchAudioFiles();
  }, [user]); // รันเมื่อ user เปลี่ยนค่า

// ตรวจสอบว่าเป็น Safari บน iOS หรือไม่
useEffect(() => {
  const isSafariIos = /iP(ad|hone|od).*Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);
  setIsSafariIos(isSafariIos);
}, []);

// ฟังก์ชันเล่นเสียง (Web Audio API สำหรับ Safari iOS)
const playAudioWebAudioAPI = (filePath) => {
  setIsPlaying(true);
  setCurrentPlaying(filePath); // ตั้งค่าหมายเลขไฟล์ที่กำลังเล่น

  if (audioContextRef.current) {
    audioContextRef.current.close(); // ปิด context ก่อนถ้ามีการเล่นเสียงอยู่
  }

  // สร้าง audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContextRef.current = audioContext;

  fetch(`${config.apiBaseUrl}/record/play/${filePath}`, {
        method: "GET",
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      })
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      audioContext.decodeAudioData(buffer, (decodedData) => {
        // สร้าง source node จาก decoded audio data
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = decodedData;

        // เชื่อมต่อ source node กับ destination (output)
        sourceNode.connect(audioContext.destination);
        sourceNode.start();

        sourceNodeRef.current = sourceNode;

        sourceNode.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          setCurrentPlaying(null); // รีเซ็ตข้อมูลไฟล์ที่กำลังเล่นเมื่อสิ้นสุด
        };

        // กำหนดความยาวของเสียง
        setDuration(decodedData.duration);

        // คอยอัปเดตเวลาการเล่น
        const interval = setInterval(() => {
          setCurrentTime(audioContext.currentTime);
          if (audioContext.currentTime >= decodedData.duration) {
            clearInterval(interval);
          }
        }, 100);
      });
    });
};

// ฟังก์ชันเล่นเสียง (ใช้ <audio> สำหรับ Chrome Android)
const playAudioTag = (filePath) => {
  setIsPlaying(true);
  setCurrentPlaying(filePath); // ตั้งค่าหมายเลขไฟล์ที่กำลังเล่น

  audioRef.current.src = `${config.apiBaseUrl}/record/play/${filePath}`, {
        method: "GET",
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      };
  audioRef.current.play().then(() => {
    setDuration(audioRef.current.duration);
  }).catch((error) => {
    console.error("Error playing audio:", error);
    setIsPlaying(false);
  });

  audioRef.current.onended = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentPlaying(null); // รีเซ็ตข้อมูลไฟล์ที่กำลังเล่นเมื่อสิ้นสุด
  };

  const interval = setInterval(() => {
    setCurrentTime(audioRef.current.currentTime);
    if (audioRef.current.currentTime >= audioRef.current.duration) {
      clearInterval(interval);
    }
  }, 100);
};

  // ฟังก์ชันเล่นเสียง (เลือกวิธีที่เหมาะสมตามเบราว์เซอร์)
  const playAudio = (filePath) => {
    if (isSafariIos) {
      playAudioWebAudioAPI(filePath); // ใช้ Web Audio API สำหรับ Safari บน iOS
    } else {
      playAudioTag(filePath); // ใช้ <audio> สำหรับเบราว์เซอร์อื่น ๆ
    }
  };

  // ฟังก์ชันหยุดเสียง
  const stopAudio = () => {
    if (isSafariIos && audioContextRef.current) {
      audioContextRef.current.close(); // ปิด audioContext
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentPlaying(null); // รีเซ็ตข้อมูลไฟล์ที่กำลังเล่นเมื่อหยุด
  };

// แปลงเวลาเป็น mm:ss
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

  if (loading) {
    return <div>Loading...</div>;
  }
  // // ฟังก์ชันกรองข้อมูล
  // const filteredRecords = records
  //   .filter((record) =>
  //     filterSetId ? record.set_id.toString() === filterSetId : true
  //   )
  //   .filter((record) =>
  //     searchScript
  //       ? record.script_number.toString().includes(searchScript) ||
  //         record.textinput_id.toString().includes(searchScript) ||
  //         record.set_id.toString().includes(searchScript)
  //       : true
  //   )
  //   .sort((a, b) => a.script_number - b.script_number); // จัดเรียงลำดับสคริปต์
  const filteredRecords = records
  .filter((record) => {
    const setIdMatch = filterSetId ? record.set_id.toString() === filterSetId : true;
    const scriptNumberMatch = filterScriptNumber ? 
      record.script_number.toString() === filterScriptNumber : true;
    const statusMatch = filterStatus ? 
      record.status_record === filterStatus : true;   
    const searchMatch = searchScript
      ? record.script_number.toString().includes(searchScript) ||
        record.textinput_id.toString().includes(searchScript) ||
        record.set_id.toString().includes(searchScript)
      : true;
    
    return setIdMatch && scriptNumberMatch && statusMatch &&  searchMatch;
  })

  .sort((a, b) => {
    // กรองตาม username
    if (filterStatus) {
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

  const handleDelete = async (setId, scriptNumber) => {
    const confirm = await Swal.fire({
      title: `คุณต้องการลบชุด ${setId} และสคริปต์ ${scriptNumber} หรือไม่?`,
      text: "ลบแล้วไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      customClass:{
        popup:"rounded-2xl",
      },
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/record/delete_record?user_id=${user._id}&set_id=${setId}&script_number=${scriptNumber}`,
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

  return (
    <div className="flex-1 bg-gray-100 min-h-screen p-2 sm:p-0 md:p-2  lg:px-6 py-1 ">
      <div className="flex justify-center items-center  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md">
        <Link to={set_number ? `/user/record/${set_number}` : `/`}>
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
      <div className="card bg-white rounded-[50px] shadow-lg w-full md:w-[100%] max-auto md:p-10 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-prompt font-semibold lg:text-xl md:text-xl text-sm font-bold text-orange-600 opacity-0 animate-fadeInLeft">
            ประวัติบันทึกเสียง
          </h2>
          <div className="flex space-x-3 opacity-0 animate-fadeInRight">
            {/* <select
              className="border border-gray-300 rounded-md md:px-3 py-1"
              value={filterSetId}
              onChange={(e) => setFilterSetId(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {[...new Set(records.map((r) => r.set_id))] // หาค่าที่ไม่ซ้ำจาก set_id
                .sort((a, b) => a - b) // เรียงลำดับจากน้อยไปมาก
                .map((setId) => (
                  <option key={setId} value={setId}>
                    ชุดที่ {setId}
                  </option>
                ))}
            </select> */}
            <select
              className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 bg-white text-gray-500"
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
              className="border border-gray-300 rounded-2xl w-[10vw] px-3 py-1 bg-white text-gray-500"
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

            
            <select
            className="border border-gray-300 rounded-2xl w-[7vw] px-3 py-1 bg-white text-gray-500"
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
              placeholder="ค้นหาสคริปต์"
              className="border border-gray-300 rounded-2xl md:px-3 p-1 md:py-1 md:w-full w-28 bg-white text-gray-500 "
              value={searchScript}
              onChange={(e) => setSearchScript(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div>กำลังโหลดข้อมูล...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-auto ">
            <table className="lg:table-fixed table-layout:fixed  w-full ">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50 lg:font-medium opacity-0 animate-fadeInRight">
                  <th className="lg:w-1/12 md:w-1/12 w-2/12 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem] text-center">
                    เลขชุด
                  </th>
                  <th className="lg:w-1/12 md:w-1/12 w-4/12 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem] text-center">
                    เลขสคริป
                  </th>
                  <th className="lg:w-3/12 md:w-40 w-3/12 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem] lg:pl-2">
                    สคริป
                  </th>
                  <th className="lg:w-2.3/12 md:w-40 w-2/12 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem] lg:pl-5">
                    ไฟล์เสียง
                  </th>
                  <th className="lg:w-2/12 w-2 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem] lg:text-center">
                    เวลา
                  </th>
                  <th className="lg:w-1/12 w-2 lg:text-base md:text-[12px] lg:text-[0.8rem] text-[11px]">
                    สถานะ
                  </th>
                  <th className="lg:w-1/12 lg:text-base md:text-[12px] text-[11px] lg:text-[0.8rem]  text-center">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="opacity-0 animate-fadeInLeft">
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="lg:py-3 lg:px-2 lg:truncate lg:text-center text-center lg:text-base md:text-[12px] text-[12px] text-gray-600 whitespace-nowrap">
                     (<span className="text-gray-400">ชุด</span>  {record.set_id})
                    </td>
                    <td className="lg:py-3 lg:px-2 lg:truncate lg:text-center text-center lg:text-base md:text-[12px] text-[12px] text-gray-600">
                      {record.script_number}
                    </td>
                    <td className="lg:py-3 lg:px-2 lg:text-base md:text-[12px] text-[12px] text-gray-600">
                      {record.textinput_id}
                    </td>
                    <td className="lg:py-3 lg:px-2 lg:truncate lg:text-base md:text-[12px] text-[12px]">
                      {/* ไอคอนสำหรับเปิดป๊อปอัพ (แสดงเฉพาะหน้าจอขนาดเล็ก) */}
                      <button
                        className="text-red-500 hover:text-gray-600 p-2 rounded-full border border-blue-200 shadow-lg md:hidden bg-gray-100 "
                        onClick={() => openPopup(record)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                          />
                        </svg>
                      </button>
                      {/* เครื่องเล่นเสียงปกติ (แสดงเฉพาะหน้าจอขนาดใหญ่) */}
                      {/* <audio
                        controls
                        className="w-full h-[2vw] shadow-md border border-red-100 rounded-full hidden md:block"
                      >
                        <source
                          src={`${config.apiBaseUrl}/record/play/${record.file_path}`}
                          type="audio/wav"
                        />
                        Your browser does not support the audio element.
                      </audio> */}
                      <div>     
                        <button
                          onClick={() => playAudio(record.file_path)}
                          disabled={isPlaying && currentPlaying !== record.file_path} // ปิดปุ่ม Play เมื่อเสียงอื่นกำลังเล่น
                          className="bg-blue-500 text-white p-2 rounded-full transition delay-300 duration-300 ease-in-out hover:bg-blue-800 shadow-lg shadow-blue-300 "
                        >
                         {isPlaying && currentPlaying === record.file_path ? (
                            <div className="px-1"> Playing...</div>
                          ) : (
                            <div className="px-1"> Play</div>
                          )}
                        </button>
                        {isPlaying && currentPlaying === record.file_path && (
                          <button
                            onClick={stopAudio}
                           className="bg-red-500 text-white p-2 rounded-full transition duration-300 ease-in-out hover:bg-red-800 shadow-lg shadow-red-300 "
                          >
                            Stop
                          </button>
                        )}
                        {isPlaying && currentPlaying === record.file_path && (
                          <p className="text-blue-800">Time: {formatTime(currentTime)} / {formatTime(duration)}</p>
                        )}
                      
                      </div>
                      <audio ref={audioRef} ></audio>
                   
                    </td>
                    <td className="lg:py-3 lg:px-2 w-2 lg:text-center lg:text-base md:text-[12px] text-[12px] text-gray-600 animate-fade-right animate-ease-in ">
                      {record.updated_at || record.created_at}
                    </td>
                    <td className={`py-3 px-1  font-medium text-[12px] md:text-[16px]
                      ${record.status_record === "completed" ? "text-green-500" : ""} 
                      ${record.status_record === "pending" ? "text-yellow-500" : ""} 
                      ${record.status_record === "rejected" ? "text-red-500" : ""}
                    `}>
                      {record.status_record}
                    </td>
                    <td className="p-1 lg:py-3 lg:px-2 items-center text-center lg:space-x-1 md:justify-center justify-between lg:text-base md:text-[14px] whitespace-nowrap">
                      <Link
                        to={`/user/record/${record.set_id}?script_number=${record.script_number}`}
                      >
                        <button className="text-blue-500 hover:text-gray-600 p-2 rounded-full border border-blue-200 shadow-lg bg-white">
                          <FaRedoAlt />
                        </button>
                      </Link>
                      <button
                        className="text-red-500 hover:text-gray-600 p-2 rounded-full border border-red-200 shadow-lg bg-white"
                        onClick={() =>
                          handleDelete(record.set_id, record.script_number)
                        }
                      >
                        <FaTrashAlt />
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
