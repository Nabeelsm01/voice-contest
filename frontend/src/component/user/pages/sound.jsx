import React, { useState, useEffect, useRef, createContext, useContext, } from "react";
import Meyda from "meyda";
import { useAudioContext } from "./audiocontext";
import imagepermission from "../../../assets/imagepermission.png";

const AudioSettings = () => {
  const { 
    devices,
    selectedInput,
    selectedOutput,
    speakerVolume,
    handleInputChange,
    handleOutputChange,
    handleSpeakerVolumeChange,
    audioStream,
    setAudioStream,
    loadDevices
  } = useAudioContext();


  const [permissionStatus, setPermissionStatus] = useState("not_requested");
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // const [speakerVolume, setSpeakerVolume] = useState(
  //   () => Number(localStorage.getItem("speakerVolume")) || 80
  // );
  // const [devices, setDevices] = useState({ input: [], output: [] });
  // const [selectedInput, setSelectedInput] = useState(""); // สำหรับเลือกไมโครโฟน
  // const [selectedOutput, setSelectedOutput] = useState(""); // สำหรับเลือกลำโพง
  const [audioOutputStatus, setAudioOutputStatus] = useState('');

  const [volume, setVolume] = useState(0);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  // const audioStream = useRef(null);
  const recordingInterval = useRef(null);
  const meydaAnalyzerRef = useRef(null);

  // เพิ่ม refs
  const audioStreamRef = useRef(null);


  const requestAudioPermission = async () => {
    try {
        // console.log("Requesting microphone access...");
        // const savedInput = localStorage.getItem("selectedMicrophone");
        // const constraints = {
        //     audio: {
        //       deviceId: selectedInput ? { exact: selectedInput } : undefined,
        //       echoCancellation: true,
        //       noiseSuppression: true,
        //       autoGainControl: true,
        //     },
        // };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // console.log("Permission granted!");
        audioStream.current = stream;
        setPermissionStatus("granted");
        // เพิ่มบรรทัดนี้
        await loadDevices();
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    } catch (error) {
        setPermissionStatus("not_granted");
        console.error("Permission denied or error:", error);
    }
};
  useEffect(() => {
    // ตรวจสอบสถานะสิทธิ์เมื่อโหลดหน้า
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            setPermissionStatus("granted");
            loadDevices();
        })
        .catch(() => {
            setPermissionStatus("not_granted");
        });
  }, []);

  const resetAndRequestPermission = () => {
    // รีเซ็ตสถานะ และขอสิทธิ์ใหม่
    setPermissionStatus("not_requested");
    requestAudioPermission();
  };

  
//   const loadDevices = async () => {
//     try {
//         const deviceList = await navigator.mediaDevices.enumerateDevices();
//         const inputDevices = deviceList.filter((d) => d.kind === "audioinput");
//         const outputDevices = deviceList.filter((d) => d.kind === "audiooutput");

//         setDevices({ input: inputDevices, output: outputDevices });

//         const savedInput = localStorage.getItem("selectedMicrophone");
//         if (savedInput && inputDevices.some((d) => d.deviceId === savedInput)) {
//             setSelectedInput(savedInput);
//         } else if (inputDevices.length > 0) {
//             setSelectedInput(inputDevices[0].deviceId);
//         }

//         const savedOutput = localStorage.getItem("selectedSpeaker");
//         if (savedOutput && outputDevices.some((d) => d.deviceId === savedOutput)) {
//             setSelectedOutput(savedOutput);
//         } else if (outputDevices.length > 0) {
//             setSelectedOutput(outputDevices[0].deviceId);
//         }
//     } catch (error) {
//         console.error("Error loading devices:", error);
//     }
// };

// useEffect(() => {
//   const savedInput = localStorage.getItem("selectedMicrophone");
//   const savedOutput = localStorage.getItem("selectedSpeaker");

//   if (savedInput) setSelectedInput(savedInput);
//   if (savedOutput) setSelectedOutput(savedOutput);

//   loadDevices(); // โหลดอุปกรณ์ใหม่
// }, []);


  // useEffect(() => {
  //   if (permissionStatus === "granted") loadDevices();
  // }, [permissionStatus]);
  useEffect(() => {
    if (permissionStatus === "granted") loadDevices();
  }, [permissionStatus]);
  
  const toggleRecording = async () => {
    if (isRecording) {
      stopTestRecording();
    } else {
      startTestRecording();
    }
  };

  
  const startTestRecording = async () => {
    try {
      // ตรวจสอบสถานะของ stream
      if (!audioStream || !audioStream.active) {
        const constraints = {
          audio: {
            deviceId: selectedInput ? { exact: selectedInput } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setAudioStream(newStream);
        audioStreamRef.current = newStream;
      } else {
        audioStreamRef.current = audioStream;
      }
  
      // เคลียร์ค่าเก่า
      setRecordedAudio(null);
      audioChunks.current = [];
  
      // ตั้งค่า MediaRecorder
      const mediaRecorder = new MediaRecorder(audioStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;
  
      // จัดการข้อมูลเสียง
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        const audioURL = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioURL);
      };
  
      // ตั้งค่า Meyda Analyzer
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStreamRef.current);
      
      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext,
        source,
        bufferSize: 1024,
        featureExtractors: ["rms"],
        callback: (features) => {
          const rms = features.rms || 0;
          // const normalizedVolume = Math.min(rms * 500, 100);
          const normalizedVolume = Math.min(Math.pow(rms, 0.6) * 120, 100);
          setVolume(normalizedVolume);
        },
      });
  
      // เริ่มการวิเคราะห์เสียง
      analyzer.start();
      meydaAnalyzerRef.current = analyzer;
  
      // เริ่มการอัดเสียง
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
  
      // เริ่มจับเวลา
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
  
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };
  
  const stopTestRecording = () => {
    // หยุด MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  
    // หยุด Meyda Analyzer
    if (meydaAnalyzerRef.current) {
      meydaAnalyzerRef.current.stop();
    }
  
    // หยุดจับเวลา
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  
    setIsRecording(false);
  };

  // const handleSpeakerVolumeChange = (e) => {
  //   const newVolume = e.target.value;
  //   setSpeakerVolume(newVolume);
  //   localStorage.setItem("speakerVolume", newVolume);
  //   if (audioRef.current) audioRef.current.volume = newVolume / 100;
  // };

  // แก้ไขการเรียกใช้ handleSpeakerVolumeChange
// const handleSpeakerVolumeChangeLocal = (event) => {
//   handleSpeakerVolumeChange(event.target.value);
// };
  // แก้ไขการ handle volume
  const handleSpeakerVolumeChangeLocal = (event) => {
    const newVolume = event.target.value;
    handleSpeakerVolumeChange(newVolume);
    
    // อัพเดท volume ของ audio element ปัจจุบัน
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // เพิ่ม useEffect เพื่อตั้งค่า initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = speakerVolume / 100;
    }
  }, [speakerVolume]);


// แก้ไขการเรียกใช้ handleInputChange
const handleInputChangeLocal = (event) => {
  handleInputChange(event.target.value);
};

// แก้ไขการเรียกใช้ handleOutputChange
const handleOutputChangeLocal = (event) => {
  handleOutputChange(event.target.value);
};
// useEffect(() => {
//   if (selectedOutput) {
//       console.log("🔄 อัปเดตลำโพงใน sound:", selectedOutput);
//       handleOutputChange(selectedOutput);
//   }
// }, [selectedOutput]);
useEffect(() => {
  const applySelectedOutput = async () => {
      if (!selectedOutput) return;

      const audioElements = document.getElementsByTagName("audio");
      for (let audio of audioElements) {
          if (typeof audio.setSinkId === "function") {
              try {
                  await audio.setSinkId(selectedOutput);
                  console.log(`🔊 เปลี่ยนลำโพงเป็น: ${selectedOutput}`);
              } catch (err) {
                  console.error("⚠️ Error setting sink ID:", err);
              }
          }
      }
  };

  applySelectedOutput();
}, [selectedOutput]); // อัปเดตเมื่อค่า selectedOutput เปลี่ยน



//   const handleInputChange = async (event) => {
//     const newInput = event.target.value;
//     try {
//         const constraints = {
//             audio: { deviceId: { exact: newInput } },
//         };
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         audioStream.current = stream;

//         setSelectedInput(newInput);
//         localStorage.setItem("selectedMicrophone", newInput); // เก็บค่าลง LocalStorage
//     } catch (error) {
//         console.error("Error switching microphone:", error);
//     }
// };


// const handleOutputChange = async (event) => {
//   const newOutput = event.target.value;
//   setSelectedOutput(newOutput);
//   localStorage.setItem("selectedSpeaker", newOutput);

//   // หา audio element ทั้งจาก ref และ id
//   const audioElement = audioRef.current || document.getElementById("audioElement");
  
//   if (audioElement) {
//     try {
//       if (typeof audioElement.setSinkId === 'function') {
//         await audioElement.setSinkId(newOutput);
//         console.log(`เปลี่ยนลำโพงเป็น: ${newOutput}`);
//       } else {
//         console.warn("setSinkId ไม่สามารถใช้งานได้บนเบราว์เซอร์นี้");
//       }
//     } catch (err) {
//       console.error("เกิดข้อผิดพลาดในการตั้งค่าลำโพง:", err);
//     }
//   } else {
//     console.warn("ไม่พบ audio element");
//   }
// };
// useEffect(() => {
//   const updateAudioOutput = async () => {
//     const audioElement = audioRef.current || document.getElementById("audioElement");
//     if (audioElement && selectedOutput) {
//       try {
//         await audioElement.setSinkId(selectedOutput);
//         console.log("อัพเดทลำโพงสำเร็จ");
//       } catch (err) {
//         console.error("ไม่สามารถเปลี่ยนลำโพงได้:", err);
//       }
//     }
//   };

//   updateAudioOutput();
// }, [selectedOutput]);

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <main className="container mx-auto px-4 sm:px-8">
        <div className="card bg-white w-full p-10 shadow-lg rounded-2xl">

          <h1 className="text-red-500 text-[1.2rem] font-prompt font-semibold m-2 animate-fadeInLeft">ตั้งค่าเสียง</h1>
        {permissionStatus === "not_granted" && (
            <div className="bg-yellow-50 border-l-4 text-gray-700 border-yellow-400 p-4 mb-4 animate-fadeInLeft">
              <p className="text-yellow-700">
                คุณปฏิเสธการเข้าถึงไมโครโฟน กรุณากดขอสิทธิ์อีกครั้ง
              </p>
              <ul className="pl-2">
                <li>1. คลิกที่ไอคอนล็อก (🔒) ข้าง URL ของเว็บไซต์</li>
                <li>2. เลือก "Allow" หรือ "อนุญาต" สำหรับไมโครโฟน</li>
                <li>3. รีเฟรชหน้าเว็บไซต์เพื่อให้การตั้งค่าใหม่มีผล</li>
              </ul>
                <div className="max-w-[500px] w-full h-auto ">
                  <img src={imagepermission} alt="รูปเข้าถึงไมโครโฟน" />
                </div>
             <div>
            
             </div>
            </div>
            
          )}

          <div className="mt-4">
            {permissionStatus !== "granted" ? (
              <div className="animate-fadeInLeft">
               <h1 className="text-[16px] bg-blue-50 p-2 w-[60%] rounded-xl text-gray-400 mb-2">" โปรดอนุญาตให้เว็บเข้าถึงไมโครโฟนของคุณก่อน เพื่อให้คุณสามารถใช้งานฟีเจอร์การบันทึกเสียงได้ "</h1>
              <button
                onClick={resetAndRequestPermission}
                className="bg-red-500 border border-white shadow-md hover:bg-red-700 text-white font-bold py-2 px-4 rounded-2xl "
                ><div className="flex flex-row items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                  </svg>
                  ขอสิทธิ์การเข้าถึงไมโครโฟน
                </div>
              </button>
              </div>
            ) : (
            <div className="md:p-5 md:space-y-5"> {/*อนุญาตการเข้าถึงไมโครโฟน*/}
              <div className="animate-fadeInRight">
                    <div className="flex flex-row items-center gap-1 text-green-500 bg-green-100 border border-green-400 p-1 pl-2 md:text-sm text-[12px] font-prompt font-semibold rounded-full lg:w-[29%] md:w-[67%] w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                        </svg>
                    <p className="">
                      คุณได้รับอนุญาตการเข้าถึงไมโครโฟนเรียบร้อยแล้ว
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  </div>
             </div>

             <div className="flex-col animate-fadeInLeft"> {/*เลือกอุปกรณ์ไมโครโฟน*/}
                  <div className="md:text-[16px] text-sm md:mt-0 mt-2 text-gray-700">
                     <label>เลือกอุปกรณ์ไมโครโฟน:</label>
                  </div>
                  <div className="p-2">
                    <select value={selectedInput} onChange={handleInputChangeLocal} className="w-[70%] border border-gray-500 rounded-xl p-2 bg-blue-50 text-gray-700">
                      {devices.input.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "ไมโครโฟนไม่มีชื่อ"}
                        </option>
                      ))}
                    </select>
                  </div>
             </div>

             <div className="flex-col animate-fadeInLeft"> {/*เลือกอุปกรณ์ลำโพง*/}
                <div className="md:text-[16px] text-sm text-gray-700">
                  <label>เลือกอุปกรณ์ลำโพง:</label>
                </div>
                <div className="p-2">
                  <select
                    // id="selectedSpeaker"
                    value={selectedOutput}
                    onChange={handleOutputChangeLocal}
                    className="w-[70%] border border-gray-500 rounded-xl p-2 bg-blue-50 text-gray-700"
                  >
                    {devices.output.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || "ลำโพงไม่มีชื่อ"}
                      </option>
                    ))}
                  </select>
                  {devices.output.some(d => d.label?.toLowerCase().includes('headphone') || d.label?.toLowerCase().includes('หูฟัง')) && (
                    <div className="mt-2 text-blue-600 text-sm bg-blue-50 p-2 w-[30%] rounded-full border border-blue-200">
                      <div className="flex items-center gap-2 text-gray-700">
                      <i class="fa-solid fa-headset"></i>
                        ขณะนี้กำลังเชื่อมต่อกับหูฟัง อาจจะเปลี่ยนลำโพงไม่ได้
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="animate-fadeInLeft"> {/* ระดับเสียงลำโพง */}
                <div className="flex flex-col md:w-[70%]">
                  <label className="mb-2 text-gray-700 md:text-sm text-[14px] font-medium">
                    ระดับเสียงลำโพง: {speakerVolume}%
                  </label>
                  <div className="md:p-5 p-2 bg-white rounded-3xl shadow border border-gray-100 hover:bg-blue-50">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={speakerVolume}
                      onChange={handleSpeakerVolumeChangeLocal}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${speakerVolume}%, #e5e7eb ${speakerVolume}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                </div>
                <style>
                  {`
                    /* ปรับแต่งตัวปุ่มเลื่อน */
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      background-color: #3b82f6; /* สีฟ้าของปุ่ม */
                      border-radius: 70%; /* ทำให้เป็นวงกลม */
                      border: 2px solid #fff; /* ขอบสีขาว */
                      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), /* เงาด้านใน */
                                  0 2px 4px rgba(0, 0, 0, 0.2); /* เงาด้านนอก */

                      cursor: pointer;
                    }
                    input[type="range"]::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      background-color: #3b82f6;
                      border-radius: 70%;
                      border: 2px solid gray;
                      box-shadow: inset 0 5px 5px rgba(0, 0, 0, 0.3), /* เงาด้านใน */
                                  0 4px 5px rgba(0, 0, 0, 0.4); /* เงาด้านนอก */
                      cursor: pointer;
                    }
                    input[type="range"]:focus::-webkit-slider-thumb {
                      box-shadow: 0 0 8px rgba(89, 153, 255, 0.8); /* เงาเมื่อโฟกัส */
                    }
                    input[type="range"]:focus::-moz-range-thumb {
                      box-shadow: 0 0 8px rgba(107, 163, 255, 0.8);
                    }
                  `}
                </style>
              </div>


              <div className="p-2 md:mt-0 mt-2 animate-fadeInLeft"> {/* button อัดเสียง ฟังเสียงที่ทดสอบ*/}
                    <button
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 py-2 px-4 rounded-full ${
                        isRecording ? "bg-red-500" : "bg-blue-500"
                      } text-white`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                      </svg>
                      {isRecording ? " หยุดการทดสอบ" : "เริ่มทดสอบเสียง"}
                    </button>
                    {isRecording && <p>กำลังอัดเสียง... {recordingTime} วินาที</p>}
                    {recordedAudio && (
                      <div className="mt-5 space-y-2 text-gray-700">
                        <h1 className="text-sm">ฟังเสียงที่ทดสอบ</h1>
                        <audio ref={audioRef} id="audioElement" controls src={recordedAudio}  className="md:w-[70%] w-[100%] bg-white"/>
                      </div>
                    )}
              </div>

              <div className="animate-fadeInLeft"> {/* วัดระดับเสียง*/}
                  <h1 className="text-sm mt-2 text-gray-700">วัดระดับเสียง</h1>
                  <div className="flex flex-col sm:flex-row items-center">
                  {/* หลอดเสียง */}
                  <div className="items-center flex flex-row w-[85%] mt-2 ml-2">
                    <div className="w-full sm:w-[70%] h-4 bg-gray-200 rounded-lg relative overflow-hidden">
                        <div
                            className="absolute h-full transition-all ease-out "
                            style={{
                                width: `${volume}%`, // ขยายตามระดับเสียง
                                background: volume > 90 ? "red" : volume > 60 ? "yellow" : "green",
                            }}
                        ></div>
                    </div>
                    {/* ข้อความระดับเสียง */}
                    <p className="text-[10px] md:text-[12px] lg:text-[13px] pl-5 text-gray-700">
                      ระดับเสียง: {volume.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default AudioSettings;