import React, { useState, useEffect, useRef } from "react";
import Meyda from "meyda";
import "../../../style/record_voice.css";
import "../../../index.css";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import config from "../../../../config";
import { useAudioContext } from "./audiocontext";
import imagepermission from "../../../assets/imagepermission.png";

const VoiceRecorder = () => {
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
    loadDevices,
  } = useAudioContext();

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const [volume, setVolume] = useState(0); // ระดับเสียง
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const meydaAnalyzerRef = useRef(null);
  const audioContextRef = useRef(null);
  const [recordings, setRecordings] = useState([]);

  // const { selectedInput, selectedOutput } = useAudioContext();
  // const constraints = {
  //   audio: {
  //     deviceId: selectedInput ? { exact: selectedInput } : undefined,
  //     // ...
  //   }
  // };
  // useEffect(() => {
  //   if (audioRef.current && selectedOutput) {
  //     try {
  //       audioRef.current.setSinkId(selectedOutput);
  //     } catch (err) {
  //       console.error("Error setting audio output:", err);
  //     }
  //   }
  // }, [selectedOutput]);

  // ดึงข้อมูลผู้ใช้
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // ใช้สำหรับ Redirect ไปหน้าอื่น
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
          navigate("/"); // Redirect ไปหน้า Home เมื่อ Fetch ล้มเหลว
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/"); // Redirect ไปหน้า Home เมื่อ Fetch ล้มเหลว
      }
    };

    fetchUser();
  }, [navigate]);

  // ดึงข้อมูลชุด set_numberและscript
  const [scripts, setScripts] = useState([]); // เก็บข้อมูลที่ดึงมา
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const { set_number } = useParams(); // ดึง set_number จาก URL params

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchScripts = async () => {
      try {
        // กำหนด URL โดยใช้พารามิเตอร์ที่ระบุ
        const response = await fetch(
          `${config.apiBaseUrl}/record/read_scripts?set_number=${set_number}&skip=0&limit=50`, {
            method: "GET",
            credentials: "include", // แนบ Cookie ไปกับคำขอ
          });
        if (!response.ok) {
          throw new Error("Failed to fetch scripts");
        }
        const data = await response.json(); // แปลงข้อมูลเป็น JSON
        setScripts(data.data); // เก็บข้อมูลใน state (เฉพาะ data)
        setLoading(false); // เปลี่ยนสถานะการโหลดข้อมูล
      } catch (error) {
        console.error("Error fetching scripts:", error);
        setLoading(false); // เปลี่ยนสถานะหากเกิดข้อผิดพลาด
      }
    };

    fetchScripts(); // เรียกฟังก์ชันดึงข้อมูลเมื่อคอมโพเนนต์โหลด
  }, [set_number]); // ไม่มี dependancy ทำให้ทำงานแค่ครั้งเดียวเมื่อคอมโพเนนต์โหลด

  // ส่งสคริปมาจากหน้า Listone เลือกสคริป
  const location = useLocation(); // ดึงข้อมูลทั้งหมดใน URL
  const queryParams = new URLSearchParams(location.search); // ดึงพารามิเตอร์จาก URL
  const script_number = parseInt(queryParams.get("script_number")); // ดึง script_number จาก query params

  // เพิ่มฟังก์ชันเพื่อหา script ที่ถูกต้อง
  const findCorrectScript = (scripts, targetNumber) => {
    // เรียงลำดับสคริปตาม script_number
    const sortedScripts = [...scripts].sort(
      (a, b) => a.script_number - b.script_number
    );

    // หาสคริปที่มี script_number ตรงกับที่ต้องการ
    const exactMatch = sortedScripts.find(
      (script) => script.script_number === targetNumber
    );
    if (exactMatch) {
      return {
        script: exactMatch,
        index: sortedScripts.indexOf(exactMatch),
      };
    }

    // ถ้าไม่เจอ ให้หาสคริปที่มี script_number ใกล้เคียงที่สุด
    const closestScript = sortedScripts.reduce((prev, curr) => {
      return Math.abs(curr.script_number - targetNumber) <
        Math.abs(prev.script_number - targetNumber)
        ? curr
        : prev;
    });

    return {
      script: closestScript,
      index: sortedScripts.indexOf(closestScript),
    };
  };
  // หาสคริปต์ที่ตรงกับ script_number ที่ได้
  // const currentScript = scripts.find(script => script.script_number === script_number);
  // // ปุ่มถัดไปและย้อนกลับ
  // const currentIndex = scripts.findIndex(script => script.script_number === currentScript?.script_number);

  // เลือกสคริปและเลื่อนถัดไปกลับมา
  const [currentScript, setCurrentScript] = useState(null); // เก็บสคริปต์ที่กำลังเลือก
  const [currentIndex, setCurrentIndex] = useState(0); // เก็บ index ของสคริปต์ที่เลือก (ใช้สำหรับการเลื่อน)
  // สร้างคีย์สำหรับเก็บข้อมูลใน localStorage แยกตาม set_number
  const getStorageKey = (set_number) => `lastScript_${set_number}`;
  // เรียงลำดับสคริปต์ตาม script_number จาก Backend
  // แก้ไข useEffect ใหม่
  useEffect(() => {
    const storageKey = getStorageKey(set_number);
    const savedState = localStorage.getItem(storageKey); // ดึงข้อมูลที่บันทึกไว้ใน localStorage

    // ล้างข้อมูลเก่าใน localStorage หากชุด (set_number) เปลี่ยน
    if (
      savedState &&
      savedState.scriptNumber !== currentScript?.script_number
    ) {
      localStorage.removeItem(storageKey); // ลบข้อมูลเก่าที่ไม่ตรงกับสถานะปัจจุบัน
      console.log("Old data cleared from localStorage.");
    }

    if (scripts && scripts.length > 0) {
      if (savedState) {
        // ใช้ค่าใน localStorage หากมี
        const { scriptNumber } = JSON.parse(savedState);
        console.log("Loaded from localStorage:", JSON.parse(savedState));
        const { script, index } = findCorrectScript(scripts, scriptNumber);
        setCurrentScript(script);
        setCurrentIndex(index);
      } else if (script_number) {
        // หากไม่มี localStorage แต่มี params
        const { script, index } = findCorrectScript(scripts, script_number);
        setCurrentScript(script);
        setCurrentIndex(index);

        // บันทึกสถานะเริ่มต้นจาก params ลง localStorage
        const stateToSave = {
          scriptNumber: script.script_number,
          index: index,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        console.log("Saved initial state to localStorage:", stateToSave);
      } else {
        // ไม่มีทั้ง localStorage และ params ใช้ค่าเริ่มต้น
        setCurrentScript(scripts[0]);
        setCurrentIndex(0);
        console.log("Set to first script as fallback:", scripts[0]);
      }
    }
  }, [scripts, script_number, set_number]); // อัพเดตเมื่อ set_number หรือ script_number เปลี่ยน

  // ปรับปรุงการแสดงผลตำแหน่งปัจจุบัน
  const getCurrentPosition = () => {
    if (!currentScript || !scripts.length) return "0 / 0";
    return `${currentScript.script_number} / ${
      scripts[scripts.length - 1].script_number
    }`;
  };

  // ฟังก์ชันเปลี่ยนสคริปต์
  const changeScript = (direction) => {
    const sortedScripts = [...scripts].sort(
      (a, b) => a.script_number - b.script_number
    );
    const currentScriptIndex = sortedScripts.findIndex(
      (script) => script.script_number === currentScript?.script_number
    );

    const newIndex = currentScriptIndex + direction;
    if (newIndex >= 0 && newIndex < sortedScripts.length) {
      const newScript = sortedScripts[newIndex];
      setCurrentScript(newScript);
      setCurrentIndex(newIndex);

      // บันทึกค่าล่าสุดลง localStorage
      const storageKey = getStorageKey(set_number);
      const stateToSave = {
        scriptNumber: newScript.script_number,
        index: newIndex,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));

      console.log("Saved to localStorage:", {
        key: storageKey,
        state: stateToSave,
      });
      // รีเซ็ตสถานะเสียง
      resetAudioData();
    }
  };

  // ฟังก์ชันรีเซ็ตข้อมูลเสียง
  const resetAudioData = () => {
    setAudioUrl(null); // รีเซ็ต URL ของไฟล์เสียง
    setAudioFile(null); // ซ่อนไฟล์เสียงปัจจุบัน
    setTimer(0); // รีเซ็ตตัวจับเวลาการอัดเสียง
    setVolume(0); // รีเซ็ตระดับเสียง
    setIsPlaying(false); // รีเซ็ตสถานะปุ่มเล่น
    audioChunks.current = []; // เคลียร์ข้อมูลเสียงที่บันทึกไว้
  };

  //เช็กข้อมูลว่าข้อมูลไหนอัดหรือยัง
  //http://localhost:8000/record/check_record?user_id=675fb5733f2893a93fe7b30d&set_id=2&script_number=2
  //`http://127.0.0.1:8000/record/check_record?user_id=${user._id}&set_id=${set_number}&script_number=${currentScript.script_number}`
  const [isAlertVisible, setIsAlertVisible] = useState(false); // ใช้ state ควบคุมการแสดงผลของ Modal
  const [recordData, setRecordData] = useState(null);
  const fetchCheckRecords = async () => {
    if (!user) {
      console.error("ข้อมูลผู้ใช้ยังไม่พร้อม");
      return;
    }
  
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/record/check_record?user_id=${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setRecordData(data); // อัปเดตข้อมูล recordData
      } else {
        const error = await response.json();
        console.error("Error:", error.detail);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };
  
  // ดึงข้อมูล `recordData` เมื่อ `user` เปลี่ยน
  useEffect(() => {
    if (user) {
      fetchCheckRecords();
    }
  }, [user]);
  

  // เพิ่ม useEffect นี้ที่นี่
  // useEffect(() => {
  //   if (recordData) {
  //     // เรียกฟังก์ชันนี้เพื่อรีเฟรชข้อมูลหลังจาก recordData เปลี่ยนแปลง
  //     fetchCheckRecords();  // แก้ไขตรงนี้
  //   }
  // }, [recordData]);  // ทำงานใหม่ทุกครั้งที่ recordData เปลี่ยนแปลง

  const getRecordingStatus = (scriptNumber) => {
    if (!recordData || !user) {
      // return false; // กรณีที่ยังไม่มีข้อมูลหรือ user
      return "not_found"; // กรณีที่ไม่มีข้อมูล
    }

    // กรองข้อมูลเฉพาะ set_number และ user._id ปัจจุบัน
    const filteredRecords = recordData.filter(
      (record) => record.set_id === set_number && record.user_id === user._id // กรอง id_user
    );

    // ค้นหาข้อมูลที่ script_number ตรงกัน
    const record = filteredRecords.find(
      (record) => record.script_number === scriptNumber
    );

    // return record ? record.status_record === "completed" : false;
    return record ? record.status_record : "not_found";
  };
  const countCompletedRecords = (status) => {
    if (!recordData || !user) return 0;

    return recordData.filter(
      (record) =>
        record.set_id === set_number &&
        record.user_id === user._id &&
        record.status_record === status
    ).length;
  };

  // ใช้งานแบบนี้
  const completedCount = countCompletedRecords("completed");
  const pendingCount = countCompletedRecords("pending");
  const rejectedCount = countCompletedRecords("rejected");

  // เพิ่ม state เพื่อตรวจสอบว่าผู้ใช้ได้ยืนยันการอัดใหม่หรือยัง
  const [isRecordingForUpdate, setIsRecordingForUpdate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  
  const handleRecordProcess = async (setId, scriptNumber) => {
    // ป้องกันการทำงานซ้ำ
    if (isProcessing) {
      console.log("กำลังประมวลผลอยู่ กรุณารอสักครู่");
      return;
    }
  
    console.log("ค่าที่ส่งเข้า handleRecordProcess:", { setId, scriptNumber });
    
    try {
      setIsProcessing(true);
  
      // ตรวจสอบข้อมูลพื้นฐาน
      if (!user || recordData === null) {
        console.log("recordData หรือ user เป็น null");
        handleRecordClick();
        return;
      }
  
      // ดึงข้อมูลล่าสุดก่อนตรวจสอบ
      try {
        await Promise.all([fetchAudioFiles(), fetchCheckRecords()]);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
        return;
      }
  
      // กรองข้อมูลของผู้ใช้ปัจจุบัน
      const userRecords = recordData.filter(
        (record) => 
          record.user_id === user._id &&
          record.set_id === setId &&
          record.script_number === scriptNumber
      );
  
      console.log("userRecords ที่ตรงกับเงื่อนไข:", userRecords);
  
      // ตรวจสอบข้อมูลซ้ำ
      const isDuplicate = userRecords.length > 0;
      console.log("isDuplicate:", isDuplicate);
  
      if (isDuplicate && !isAlertVisible) {
        console.log("เจอข้อมูลซ้ำ, แสดง Swal");
        setIsAlertVisible(true);
        
        try {
          const result = await Swal.fire({
            title: "ยืนยันการบันทึกเสียงใหม่",
            text: "มีการบันทึกเสียงสำหรับสคริปต์นี้แล้ว คุณต้องการแทนที่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
            allowOutsideClick: false, // ป้องกันการคลิกด้านนอก
            customClass: {
              popup: "rounded-2xl",
            },
          });
  
          if (result.isConfirmed) {
            console.log("กดปุ่มยืนยัน -> อัปเดตไฟล์เสียง");
            await handleUpdate_RecordClick(true);
            
            // รีเฟรชข้อมูลหลังอัปเดต
            await Promise.all([fetchAudioFiles(), fetchCheckRecords()]);
          } else {
            console.log("ยกเลิกการอัดเสียงใหม่");
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการแสดง Swal:", error);
          toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
          setIsAlertVisible(false);
        }
      } else {
        console.log("ไม่มีข้อมูลซ้ำ, เริ่มอัดเสียงใหม่");
        await handleRecordClick();
      }
  
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการประมวลผล:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };
  
  let stopTimeout;

  // ระบบอัดเสียง
  const handleRecordClick = async () => {
    if (isRecording) {
      // หยุดการบันทึก
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        clearInterval(timerRef.current);
        setIsRecording(false);
        if (meydaAnalyzerRef.current) {
          meydaAnalyzerRef.current.stop();
        }
      }
    } else {
      // เริ่มการบันทึก
      try {
      
        // ตรวจสอบสถานะการอนุญาตการใช้งานไมโครโฟน
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });

        if (permissionStatus.state === "denied") {
          // alert("กรุณาอนุญาตการเข้าถึงไมโครโฟนเพื่อใช้งานการบันทึกเสียง");
          Swal.fire({
            title: "<h1 class='text-red-500 text-2xl text-left font-prompt font-semibold'>คุณปฏิเสธการเข้าถึงไมโครโฟน กรุณากดขอสิทธิ์อีกครั้ง!</h1>",
            text: "",
            html: `
            <div>
             <ul class="pl-2 text-left items-start font-prompt text-sm">
              <li>1. คลิกที่ไอคอนล็อก (🔒) ข้าง URL ของเว็บไซต์</li>
              <li>2. เลือก "Allow" หรือ "อนุญาต" สำหรับไมโครโฟน</li>
              <li>3. รีเฟรชหน้าเว็บไซต์เพื่อให้การตั้งค่าใหม่มีผล</li>
             </ul>
              <div class="max-w-[400px] w-full h-auto ">
                <img src=${imagepermission} alt="รูปเข้าถึงไมโครโฟน" />
              </div>
            </div>`,
            icon: "warning",
            confirmButtonText: "เข้าใจแล้ว",
            confirmButtonColor: "#3085d6",
            customClass: {
              popup: "rounded-2xl",
              confirmButton: "rounded-lg"
            },
          });
          return;
        }

        let stream = audioStream;

        if (!stream || !stream.active) {
          const constraints = {
            audio: {
              deviceId: selectedInput ? { exact: selectedInput } : undefined,
              echoCancellation: true,    // ปิดเพื่อคุณภาพเสียงที่เป็นธรรมชาติ
              noiseSuppression: true,    // ปิดเพื่อคุณภาพเสียงที่เป็นธรรมชาติ
              autoGainControl: true,     // ปิดเพื่อความเสถียรของระดับเสียง
              sampleRate: 44100,          // ความถี่สุ่มตัวอย่างแบบ CD Quality
              channelCount: 1,            // mono = 1, stereo = 2
            },
          };
          

          stream = await navigator.mediaDevices.getUserMedia(constraints);
          setAudioStream(stream); // อัปเดต Context
        }

        // สร้าง AudioContext
        const audioContext = new AudioContext({
          sampleRate: 44100
        });

        // โหลด AudioWorklet (ต้องอยู่ในโฟลเดอร์ public)
        await audioContext.audioWorklet.addModule('/processor.js');

        // สร้าง source node จาก stream
        const input = audioContext.createMediaStreamSource(stream);

        // สร้าง Node ต่างๆ สำหรับปรับแต่งเสียง
        // ======== SIGNAL CHAIN เรียงตามลำดับการประมวลผล ========
        
        // ใช้โค้ดที่เรียบง่ายขึ้นตรงนี้ - ลดการใช้ filters ต่างๆ
        // ======== SIGNAL CHAIN แบบเรียบง่าย ========

        // ใช้เพียง Gain node เพื่อปรับระดับเสียงเท่านั้น
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // ปรับได้ตามต้องการ

        // Recorder Node - ตัวสุดท้ายในเชน
        const recorder = new AudioWorkletNode(audioContext, 'audio-recorder-processor', {
          processorOptions: {
            bufferSize: 4096  // เพิ่มจาก 2048 เป็น 4096
          }
        });

        // เชื่อมต่อเชนใหม่ให้เรียบง่ายขึ้น
        input.connect(gainNode);
        gainNode.connect(recorder);
        
        // อาร์เรย์สำหรับเก็บข้อมูลเสียง
        let audioData = [];

        // รับข้อมูลเสียงจาก AudioWorklet
        recorder.port.onmessage = (event) => {
          if (event.data.audioData) {
            audioData.push(new Float32Array(event.data.audioData));
          }
        };
       
        
        // ตั้งเวลาหยุดอัตโนมัติภายใน 90 วินาที
        const stopTimeout = setTimeout(() => {
          mediaRecorderRef.current.stop();
          clearInterval(timerRef.current);
          setIsRecording(false);
          console.log("หยุดบันทึกอัตโนมัติหลัง 90 วินาที");
        }, 90000);

        setIsRecording(true);
     

        // สร้างฟังก์ชัน stop
        const stopRecording = async () => {
          if (stopTimeout) {
            clearTimeout(stopTimeout);
          }
          
          recorder.disconnect();
          gainNode.disconnect();
          input.disconnect();
        
          // ✅ ปิด AudioContext
          if (audioContext.state !== 'closed') {
            await audioContext.close();
            console.log("AudioContext ปิดเรียบร้อย");
          }
       // รวมข้อมูลเสียงทั้งหมด
       const length = audioData.reduce((total, buffer) => total + buffer.length, 0);
        const mergedBuffer = new Float32Array(length);
        let offset = 0;
       
        for (const buffer of audioData) {
          mergedBuffer.set(buffer, offset);
          offset += buffer.length;
        }

      // สร้าง AudioBuffer
      const finalBuffer = audioContext.createBuffer(1, mergedBuffer.length, 44100);
      finalBuffer.getChannelData(0).set(mergedBuffer);


        // แปลงเป็น WAV
        const wavBlob = audioBufferToWav(finalBuffer, {
          sampleRate: 44100,
          float: false,
        });

          // ส่วนที่เหลือของโค้ดยังคงเหมือนเดิม
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            
            // ส่งข้อมูลไปยัง Backend
            const recordData = {
              user_id: user._id,
              set_id: set_number,
              script_number: currentScript.script_number || 0, // เพิ่ม script_number
              textinput_id: currentScript.textinput || "ไม่มีข้อความ", // ใช้ข้อมูลจาก currentScript
              record_file: base64data, // ส่ง Base64 ของไฟล์เสียง
              status_record: "pending",
            };

            try {
              // เพิ่มข้อมูลเมื่อไม่ได้ซ้ำกันที่เคยอัดไว้แล้ว
              const response = await fetch(
                `${config.apiBaseUrl}/record/add_record`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(recordData),
                  credentials: "include", // แนบ Cookie ไปกับคำขอ
                }
              );

              if (response.ok) {
                const data = await response.json();
                console.log("Record added:", data);
                // แสดงการแจ้งเตือนว่าเสร็จสิ้น
                toast.success("บันทึกเสียงเสร็จเรียบร้อยแล้ว!");
                // ตั้งเวลาให้รีเฟรชข้อมูลหลังจาก `toast` แสดงผลเสร็จ
                setTimeout(() => {
                  // window.location.reload(); // รีเฟรชหน้าเว็บ
                 // เรียก fetchAudioFiles() เพื่อดึงข้อมูลใหม่ ไม่ต้องรีเฟรชหน้า
                 fetchAudioFiles();
                 fetchCheckRecords();
                }, 1000); // เวลา (1.5 วินาที) ตรงกับ `autoClose` ของ ToastContainer
              } else {
                console.error("Error adding record");
                const errorData = await response.json();
                console.error("Error adding record:", errorData);
              }
            } catch (error) {
              console.error("Request failed", error);
              // toast.error("การเชื่อมต่อผิดพลาด!");
            }
              };

              reader.readAsDataURL(wavBlob); // ใช้ wavBlob ที่สร้างขึ้น
      };

      // กำหนด handler สำหรับการหยุดบันทึก
      mediaRecorderRef.current = {
        stop: () => {
          stopRecording();
          stream.getTracks().forEach(track => track.stop());
          // audioContext.close();
        }
      };

      // เริ่มตัวจับเวลา
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      // ตั้งค่า Meyda Analyzer
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: 2048,
        featureExtractors: ["rms"],
        callback: (features) => {
          const rms = features.rms || 0;
          const normalizedVolume = Math.min(Math.pow(rms, 0.6) * 120, 100);
          setVolume(normalizedVolume);
        },
      });

        analyzer.start();
        meydaAnalyzerRef.current = analyzer;
        audioContextRef.current = audioContext;
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  // อัพเดทข้อมูลถ้ามีแล้วว
  const handleUpdate_RecordClick = async () => {
    //handleUpdate_RecordClick ตัวแปร อัพเดทเสียง
    if (isRecording) {
      // หยุดการบันทึก
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        clearInterval(timerRef.current);
        setIsRecording(false);
        if (meydaAnalyzerRef.current) {
          meydaAnalyzerRef.current.stop();
        }
      }
    } else {
      // เริ่มการบันทึก
      try {
        // ตรวจสอบสถานะการอนุญาตการใช้งานไมโครโฟน
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });

        if (permissionStatus.state === "denied") {
          // alert("กรุณาอนุญาตการเข้าถึงไมโครโฟนเพื่อใช้งานการบันทึกเสียง");
          Swal.fire({
            title: "<h1 class='text-red-500 text-2xl text-left font-prompt font-semibold'>คุณปฏิเสธการเข้าถึงไมโครโฟน กรุณากดขอสิทธิ์อีกครั้ง!</h1>",
            text: "",
            html: `
            <div>
             <ul class="pl-2 text-left items-start font-prompt text-sm">
              <li>1. คลิกที่ไอคอนล็อก (🔒) ข้าง URL ของเว็บไซต์</li>
              <li>2. เลือก "Allow" หรือ "อนุญาต" สำหรับไมโครโฟน</li>
              <li>3. รีเฟรชหน้าเว็บไซต์เพื่อให้การตั้งค่าใหม่มีผล</li>
             </ul>
              <div class="max-w-[400px] w-full h-auto ">
                <img src=${imagepermission} alt="รูปเข้าถึงไมโครโฟน" />
              </div>
            </div>`,
            icon: "warning",
            confirmButtonText: "เข้าใจแล้ว",
            confirmButtonColor: "#3085d6",
            customClass: {
              popup: "rounded-2xl",
              confirmButton: "rounded-lg"
            },
          });
          return;
        }
       
        let stream = audioStream;

        if (!stream || !stream.active) {
          const constraints = {
            audio: {
              deviceId: selectedInput ? { exact: selectedInput } : undefined,
              echoCancellation: true,    // ปิดเพื่อคุณภาพเสียงที่เป็นธรรมชาติ
              noiseSuppression: true,    // ปิดเพื่อคุณภาพเสียงที่เป็นธรรมชาติ
              autoGainControl: true,     // ปิดเพื่อความเสถียรของระดับเสียง
              sampleRate: 44100,          // ความถี่สุ่มตัวอย่างแบบ CD Quality
              channelCount: 1,            // mono = 1, stereo = 2
            },
          };

          stream = await navigator.mediaDevices.getUserMedia(constraints);
          setAudioStream(stream); // อัปเดต Context
        }

        // สร้าง AudioContext
        const audioContext = new AudioContext({
          sampleRate: 44100
        });

        // โหลด AudioWorklet (ต้องอยู่ในโฟลเดอร์ public)
        await audioContext.audioWorklet.addModule('/processor.js');

        // สร้าง source node จาก stream
        const input = audioContext.createMediaStreamSource(stream);

        // สร้าง Node ต่างๆ สำหรับปรับแต่งเสียง
        // ======== SIGNAL CHAIN เรียงตามลำดับการประมวลผล ========
        
        // ใช้โค้ดที่เรียบง่ายขึ้นตรงนี้ - ลดการใช้ filters ต่างๆ
        // ======== SIGNAL CHAIN แบบเรียบง่าย ========

        // ใช้เพียง Gain node เพื่อปรับระดับเสียงเท่านั้น
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // ปรับได้ตามต้องการ

        // Recorder Node - ตัวสุดท้ายในเชน
        const recorder = new AudioWorkletNode(audioContext, 'audio-recorder-processor', {
          processorOptions: {
            bufferSize: 4096  // เพิ่มจาก 2048 เป็น 4096
          }
        });

        // เชื่อมต่อเชนใหม่ให้เรียบง่ายขึ้น
        input.connect(gainNode);
        gainNode.connect(recorder);
        
        // อาร์เรย์สำหรับเก็บข้อมูลเสียง
        let audioData = [];

        // รับข้อมูลเสียงจาก AudioWorklet
        recorder.port.onmessage = (event) => {
          if (event.data.audioData) {
            audioData.push(new Float32Array(event.data.audioData));
          }
        };
       
        
        // ตั้งเวลาหยุดอัตโนมัติภายใน 90 วินาที
        const stopTimeout = setTimeout(() => {
          mediaRecorderRef.current.stop();
          clearInterval(timerRef.current);
          setIsRecording(false);
          console.log("หยุดบันทึกอัตโนมัติหลัง 90 วินาที");
        }, 90000);

        setIsRecording(true);
     

        // สร้างฟังก์ชัน stop
        const stopRecording = async () => {
          if (stopTimeout) {
            clearTimeout(stopTimeout);
          }
          
          recorder.disconnect();
          gainNode.disconnect();
          input.disconnect();
        
          // ✅ ปิด AudioContext
          if (audioContext.state !== 'closed') {
            await audioContext.close();
            console.log("AudioContext ปิดเรียบร้อย");
          }
       // รวมข้อมูลเสียงทั้งหมด
       const length = audioData.reduce((total, buffer) => total + buffer.length, 0);
        const mergedBuffer = new Float32Array(length);
        let offset = 0;
       
        for (const buffer of audioData) {
          mergedBuffer.set(buffer, offset);
          offset += buffer.length;
        }

      // สร้าง AudioBuffer
      const finalBuffer = audioContext.createBuffer(1, mergedBuffer.length, 44100);
      finalBuffer.getChannelData(0).set(mergedBuffer);


        // แปลงเป็น WAV
        const wavBlob = audioBufferToWav(finalBuffer, {
          sampleRate: 44100,
          float: false,
        });

          // ส่วนที่เหลือของโค้ดยังคงเหมือนเดิม
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            
            // ส่งข้อมูลไปยัง Backend
            const recordData = {
              user_id: user._id,
              set_id: set_number,
              script_number: currentScript.script_number || 0, // เพิ่ม script_number
              textinput_id: currentScript.textinput || "ไม่มีข้อความ", // ใช้ข้อมูลจาก currentScript
              record_file: base64data, // ส่ง Base64 ของไฟล์เสียง
              status_record: "pending",
            };

            try {
              // เพิ่มข้อมูลเมื่อไม่ได้ซ้ำกันที่เคยอัดไว้แล้ว
              // ส่งคำขอไปยัง Backend
              const response = await fetch(
                `${config.apiBaseUrl}/record/update_record`,
                {
                  // เปลี่ยน URL
                  method: "PUT", // เปลี่ยนเป็น PUT
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(recordData),
                  credentials: "include", // แนบ Cookie ไปกับคำขอ
                }
              );

              if (response.ok) {
                const data = await response.json();
                console.log("Record updated:", data);
                toast.success("อัปเดตข้อมูลสำเร็จ!");
                // ดึงข้อมูลใหม่หลังจากอัปเดตสำเร็จ
                // รีเซ็ตไฟล์เสียงก่อนโหลดใหม่
                setAudioFile(null); 
                fetchAudioFiles(); // โหลดข้อมูลเสียงใหม่
                fetchCheckRecords();
                
              } else {
                const errorData = await response.json();
                console.error("Error updating record:", errorData);

                if (response.status === 404) {
                  toast.warning("ไม่พบข้อมูลสำหรับอัปเดต!");
                } else {
                  toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล!");
                }
              }
            } catch (error) {
              console.error("Request failed", error);
              toast.error("การเชื่อมต่อผิดพลาด!");
            }
          };

            reader.readAsDataURL(wavBlob); // ใช้ wavBlob ที่สร้างขึ้น
          };

          // กำหนด handler สำหรับการหยุดบันทึก
          mediaRecorderRef.current = {
            stop: () => {
              stopRecording();
              stream.getTracks().forEach(track => track.stop());
              // audioContext.close();
            }
          };

        // เริ่มตัวจับเวลา
        setTimer(0);
        timerRef.current = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);

        // ตั้งค่า Meyda Analyzer
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = Meyda.createMeydaAnalyzer({
          audioContext: audioContext,
          source: source,
          bufferSize: 1024,
          featureExtractors: ["rms"],
          callback: (features) => {
            const rms = features.rms || 0;
            const normalizedVolume = Math.min(Math.pow(rms, 0.6) * 120, 100);
            setVolume(normalizedVolume);
          },
        });

        analyzer.start();
        meydaAnalyzerRef.current = analyzer;
        audioContextRef.current = audioContext;
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  function audioBufferToWav(buffer, opt) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = opt && opt.float ? 3 : 1;
    const bitDepth = format === 3 ? 32 : 16;
    const bytesPerSample = bitDepth / 8;
    const length = buffer.length * numChannels * bytesPerSample + 44;

    const arrayBuffer = new ArrayBuffer(length);
    const dataView = new DataView(arrayBuffer);
    const channels = [];

    for (let i = 0; i < numChannels; i++) {
        channels[i] = buffer.getChannelData(i);
    }

    writeWavHeader(dataView, sampleRate, numChannels, bitDepth);

    let offset = 44;
    // ส่วนของการแปลงข้อมูลเสียงเป็น WAV
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        // เพิ่ม gain แบบนุ่มนวลและใช้ soft clipping ป้องกันเสียงแตก
        let sample = channels[channel][i] * 1.2; // เพิ่ม gain
        
        // ใช้ soft clipping แบบนุ่มนวล
        sample = Math.tanh(sample); 
        
        if (format === 3) {
          dataView.setFloat32(offset, sample, true);
        } else {
          // ปรับปรุงวิธีการแปลงเป็น int16 
          const s = sample < 0 
            ? Math.max(-0.99, sample) * 0x8000 
            : Math.min(0.99, sample) * 0x7FFF;
          dataView.setInt16(offset, s, true);
        }
        offset += bytesPerSample;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

function writeWavHeader(dataView, sampleRate, numChannels, bitDepth) {
    const byteRate = sampleRate * numChannels * (bitDepth / 8);
    const blockAlign = numChannels * (bitDepth / 8);

    // RIFF identifier
    writeString(dataView, 0, 'RIFF');
    // file length
    dataView.setUint32(4, 36 + dataView.byteLength, true);
    // RIFF type
    writeString(dataView, 8, 'WAVE');
    // format chunk identifier
    writeString(dataView, 12, 'fmt ');
    // format chunk length
    dataView.setUint32(16, 16, true);
    // sample format (raw)
    dataView.setUint16(20, bitDepth === 8 ? 1 : (bitDepth === 16 ? 1 : 3), true);
    // channel count
    dataView.setUint16(22, numChannels, true);
    // sample rate
    dataView.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    dataView.setUint32(28, byteRate, true);
    // block align (channel count * bytes per sample)
    dataView.setUint16(32, blockAlign, true);
    // bits per sample
    dataView.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(dataView, 36, 'data');
    // data chunk length
    dataView.setUint32(40, dataView.byteLength - 44, true);
}

function writeString(dataView, offset, string) {
    for (let i = 0; i < string.length; i++) {
        dataView.setUint8(offset + i, string.charCodeAt(i));
    }
}
async function encodeWAV(audioChunks, sampleRate) {
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const audioBuffer = new AudioContext().createBuffer(1, totalLength, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  let offset = 0;

  for (const chunk of audioChunks) {
      const buffer = await chunk.arrayBuffer();
      const audioData = new Float32Array(buffer);
      channelData.set(audioData, offset);
      offset += audioData.length;
  }

  return audioBufferToWav(audioBuffer); // ใช้ฟังก์ชันนี้เพื่อแปลง
}



  // ควบคุม volume
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = speakerVolume / 100;
    }
  }, [speakerVolume]);

  const handleReset = async (setId, scriptNumber) => {
    // ตรวจสอบข้อมูลของผู้ใช้ปัจจุบัน
    const userRecords = recordData.filter(
      (record) => record.user_id === user._id
    );
    // ตรวจสอบว่ามีข้อมูลที่ตรงกับ `set_id` และ `script_number`
    const isDuplicate = userRecords.some(
      (record) =>
        record.set_id === setId && record.script_number === scriptNumber
    );
    // ถ้าไม่มีข้อมูล
    if (!isDuplicate) {
      Swal.fire({
        title: "ไม่มีข้อมูล",
        text: "ไม่มีข้อมูลเสียงสคริปต์นี้",
        icon: "info",
        customClass: {
          popup: "rounded-2xl",
        },
        confirmButtonText: "ตกลง", 
        confirmButtonColor: "#3085d6",
      });
      return; // ออกจากฟังก์ชัน
    }
    // ถ้ามีข้อมูลให้ทำงานลบตามปกติ
    Swal.fire({
      title: "คุณต้องการลบข้อมูลเสียงนี้หรือไม่?",
      text: "ข้อมูลที่ลบจะไม่สามารถกู้คืนได้!",
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "ยืนยัน",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/record/delete_record?user_id=${user._id}&set_id=${setId}&script_number=${scriptNumber}`,
            {
              method: "DELETE",
              credentials: "include", // แนบ Cookie ไปกับคำขอ
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "ลบสำเร็จ!",
              text: "ข้อมูลเสียงของคุณถูกลบแล้ว",
              icon: "success",
              customClass: {
                popup: "rounded-2xl",
              },
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#3085d6",
            }).then((result) => {
              if (result.isConfirmed) {
                // รีเฟรชหน้าเมื่อกดปุ่มยืนยัน
                // window.location.reload();
                fetchAudioFiles();
                fetchCheckRecords();
              }
            });
          } else {
            const errorData = await response.json();
            Swal.fire({
              title: "เกิดข้อผิดพลาด",
              text: `ไม่สามารถลบข้อมูล: ${errorData.detail}`,
              icon: "error",
              customClass: {
                popup: "rounded-2xl",
              },
            });
          }
        } catch (error) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
            icon: "error",
            customClass: {
              popup: "rounded-2xl",
            },
          });
        }
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    return () => {
      if (meydaAnalyzerRef.current) meydaAnalyzerRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // ดึงข้อมูลไฟล์เสียง
  const [record_audio, setRecords] = useState([]); // เก็บข้อมูลไฟล์เสียง
  const fetchAudioFiles = async () => {
    if (!user) return; // รอจนกว่าจะได้ user._id
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/record/get_records?user_id=${user._id}`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        }
      );
      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลได้");
      }
      const data = await response.json();
      setRecords(data); // อัปเดต state
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // เรียกใช้ useEffect เพื่อดึงข้อมูลครั้งแรก
  useEffect(() => {
    fetchAudioFiles();
  }, [user]);
  
  // เมื่อ recordData เปลี่ยน ให้โหลดข้อมูลเสียงใหม่
  useEffect(() => {
    fetchAudioFiles();
  }, [recordData]); 


  const [audioFile, setAudioFile] = useState(null); // State สำหรับเก็บไฟล์เสียงปัจจุบัน
  useEffect(() => {
    if (!currentScript || !record_audio.length) return;

    // เปรียบเทียบทั้ง script_number และ set_id
    const matchingAudio = record_audio.find(
      (record) =>
        record.script_number === currentScript.script_number &&
        record.set_id === set_number // เปรียบเทียบ set_id ด้วย
    );

    if (matchingAudio) {
      console.log("Matched audio file:", matchingAudio.file_path);
      setAudioFile(matchingAudio.file_path); // อัปเดตไฟล์เสียง
    } else {
      setAudioFile(null); // หากไม่มีไฟล์ที่ตรงกัน
    }
  }, [currentScript, record_audio]);

  // ตรวจสอบว่าเป็น Safari หรือไม่
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioBufferRef = useRef(null);
  const sourceRef = useRef(null);

  // ✅ Safari iOS → โหลด Web Audio API
  useEffect(() => {
    if (isSafari && audioFile) {
      const fetchAudio = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/record/play/${audioFile}`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        }
      );
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          audioContextRef.current = audioContext;
          audioBufferRef.current = audioBuffer;
        } catch (error) {
          console.error("โหลดเสียงล้มเหลว:", error);
        }
      };

      fetchAudio();
    }
  }, [audioFile]);

   // ✅ เล่น/หยุดเสียงทั้ง Safari (Web Audio API) และ Chrome (HTML Audio)
   const handlePlayClick = () => {
    if (isSafari) {
      // 🎵 Safari → ใช้ Web Audio API
      if (!audioContextRef.current || !audioBufferRef.current) return;

      if (isPlaying) {
        sourceRef.current.stop();
        setIsPlaying(false);
      } else {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
      }
    } else {
      // 🎵 Chrome → ใช้ <audio>
      if (audioPlayerRef.current) {
        if (isPlaying) {
          audioPlayerRef.current.pause();
        } else {
          audioPlayerRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };
    
  // ตัวอย่างเสียง
  const AudioSample = () => {
    Swal.fire({
      title: "<span class='text-red-500 font-prompt'>เสียงตัวอย่าง!</span>",
      customClass: {
        title: "text-red-500 font-bold text-2xl", // ใช้ Tailwind CSS
      },
      text: "คุณต้องการเปิดตัวอย่างเสียงหรือไม่?",
      html: `
        <div class="flex flex-col space-y-2 items-center justify-center ">

          <div class="border border-red-100 w-full p-3 rounded-[20px] shadow-lg">
            <h1 class="text-[16px] w-full text-left pl-2 py-2"><strong class="text-red-500 font-prompt">เสียงตัวอย่างจากผู้หญิง </strong>" สถานีรถไฟฟ้าไหนใกล้ขนส่งที่สุด "</h1>
            <audio controls ref={audioPlayerRef} id="audioElement" class="w-full shadow-lg border border-red-200 rounded-full" id="audioPlayer">
            <source src="/ทั่วไป0015.mp3" type="audio/mp3" />
              เบราว์เซอร์ของคุณไม่รองรับการเล่นไฟล์เสียง
            </audio>
          </div>

          <div class="border border-red-100 w-full p-3 rounded-[20px] shadow-lg">
            <h1 class="text-[16px] w-full text-left pl-2 py-2"><strong class="text-red-500 font-prompt">เสียงตัวอย่างจากเด็ก </strong>" หนูจองตัวไปหัวหินแล้ว แต่มันขึ้นว่าหมายเลขการจองตั๋วผิดพลาดทำยังไงได้บ้างคะ "</h1>
            <audio controls ref={audioPlayerRef} id="audioElement" class="w-full shadow-lg border border-red-200 rounded-full" id="audioPlayer">
              <source src="/_78315529.mp3" type="audio/mp3" />
              เบราว์เซอร์ของคุณไม่รองรับการเล่นไฟล์เสียง
            </audio>
          </div>

          <div class="border border-red-100 w-full p-3 rounded-[20px] shadow-lg">
            <h1 class="text-[16px] w-full text-left pl-2 py-2"><strong class="text-red-500 font-prompt">เสียงตัวอย่างจากผู้ชาย </strong>" อยากรู้ว่าบนรถไฟมีห้องให้ละมาดไหม "</h1>
            <audio controls ref={audioPlayerRef} id="audioElement" class="w-full shadow-lg border border-red-200 rounded-full" id="audioPlayer">
              <source src="/เสียงตัวอย่างผู้ชาย.mp3" type="audio/mp3" />
              เบราว์เซอร์ของคุณไม่รองรับการเล่นไฟล์เสียง
            </audio>
          </div>
        </div> 
      `,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ปิด",
      customClass: {
        popup: "rounded-2xl",
      },
      didOpen: () => {
        const audioPlayer = document.getElementById("audioPlayer");
        if (audioPlayer) {
          audioPlayer.load(); // โหลดไฟล์เสียงใหม่
          audioPlayer.oncanplay = () => {
            console.log("ไฟล์เสียงพร้อมเล่น");
          };
        }
      },
    });
  };

  // เรียกใช้ฟังก์ชันเมื่อกดปุ่ม
  const AudioSampleUI = () => {
    AudioSample();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-1 sm:p-0 md:p-1 lg:p-1 xl:p-2">
      {/* <div>
        {" "}
        <LoginModal />{" "}
      </div> */}
      {/* Back Button */}
      <div className="">
        <div className="flex justify-center items-center lg:ml-5  rounded-full bg-white sm:w-10  w-10 lg:w-14 md:w-12 shadow-md ">
          <Link to={`/user/listone/${set_number}`}>
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
      </div>
      <header id="navbar"></header>
      {/* Navbar content */}
      <main className="container mx-auto w-full md:w-[97%] lg:w-[93%] h-auto font-prompt">
        <div className="card bg-white w-full md:w-[100%] lg:w-[95%] p-6 md:p-10 shadow-lg rounded-[30px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-x-2 lg:space-y-0 py-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#EB4335] to-[#FF7C30] bg-clip-text">
              Record
            </h1>
            {/* ส่วนที่มีพื้นหลัง + ปุ่มในแถวเดียวกัน */}
            <div className="flex flex-col md:flex-row lg:flex-row justify-end items-right space-x-4 w-full  space-y-1 lg:space-y-0">
              <div className="flex-grow  h-auto rounded-[50px] bg-[#F1F5F9] shadow-inner px-2 py-3 overflow-hidden ">
                {/* max-w-[50vw] w-[20%] */}
                <div className="inline-text flex items-center space-x-5 justify-between px-4">
                  {/* <h1 className="text-[16px] text-gray-400  whitespace-nowrap ">
              {currentScript ? scripts.findIndex(script => script.script_number === currentScript.script_number) + 1 : 0} / {scripts.length}
              </h1> */}
                  <h1 className="text-sm sm:text-base text-gray-400 whitespace-nowrap ">
                    {getCurrentPosition()}
                  </h1>
                  {/* แสดงสถานะว่าอยู่ที่สคริปไหน */}
                  {/* <div className="text-center mt-2">
            {currentIndex + 1} / {scripts.length}
          </div> */}
                  {/* แสดงข้อมูลสคริป */}
                  {currentScript && (
                    <div
                      key={currentScript._id}
                      className="w-full max-w-[650px] p-0 m-0 text-gray-700"
                    >
                      <p
                        className="font-sans text-left text-sm sm:text-base lg:text-lg w-full overflow-hidden text-ellipsis leading-6 m-0 p-0"
                        style={{ wordBreak: "break-word", hyphens: "auto" }}
                      >
                        {currentScript.textinput || "ไม่มีข้อความ"}
                      </p>
                    </div>
                  )}{" "}
                  {/* สิ้นสุดการแสดงข้อมูลสคริป */}
                  {/* <div className="border border-red-500"> */}
                  {currentScript ? (
                    (() => {
                      const status = getRecordingStatus(
                        currentScript.script_number
                      );

                      if (status === "completed") {
                        return (
                          <div className="status-done bg-green-400 rounded-[50px] p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        );
                      } else if (status === "pending") {
                        return (
                          <div className="status-pending bg-yellow-300 rounded-[50px] px-1">
                            <i class="fa-regular fa-hourglass-half text-yellow-700 text-sm text-center py-[7px] w-5"></i>
                          </div>
                        );
                      } else if (status === "rejected") {
                        return (
                          <div className="status-rejected bg-red-400 rounded-[50px] p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M6 18L18 6"
                              />
                            </svg>
                          </div>
                        );
                      } else {
                        return (
                          <div className="status-unknown bg-gray-200 rounded-[50px] p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            ></svg>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <p>กำลังโหลดข้อมูล...</p>
                  )}
                </div>
              </div>

              {/* ปุ่มควบคุม */}
              <div className="flex justify-end   sm:mr-[auto] items-center space-x-1 lg:space-x-2">
                <button
                  onClick={() => changeScript(-1)} // ย้อนกลับ
                  disabled={isRecording || currentIndex === 0}
                  className="flex items-center justify-center  w-8 h-10 md:w-8 md:h-10 lg:w-12 lg:h-12 bg-white border-2 border-[#FF7C30] rounded-full shadow-lg text-[#FF7C30] hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-1 focus:ring-[#EB4335]"
                >
                  <p className="text-[3rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </p>
                </button>

                <button
                  onClick={() => changeScript(1)} // ถัดไป
                  disabled={isRecording || currentIndex === scripts.length - 1}
                  className="flex items-center justify-center w-8 h-10 md:w-8 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#EB4335] to-[#FF7C30] rounded-full shadow-lg text-white hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-1 focus:ring-[#EB4335]"
                >
                  <p className="text-[3rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </p>
                </button>
              </div>
            </div>

            {isRecording ? (
              // ลิงก์ปิดใช้งานระหว่างบันทึกเสียง
              <div className="w-full md:w-full sm:w-full lg:w-[18%] flex justify-end ">
                <Link className="w-[auto]">
                  <button
                    className="flex items-center justify-center min-h-[10px] w-full px-1 mx-0 text-red-500 rounded-full shadow-lg border-2 border-[#eb6f35] font-prompt hover:bg-gradient-to-r from-[#EB4335] to-[#FF7C30] hover:text-white cursor-pointer transition duration-500 lg:whitespace-normal whitespace-nowrap 
                  px-2 py-1 text-xs min-h-[8px] md:px-3 md:py-2 md:text-sm lg:px-2 lg:py-3 lg:ml-2 lg:text-lg bg-white"
                  >
                    <span className="text-sm md:text-sm lg:text-lg font-bold ">
                      ดูสคริปทั้งหมด
                    </span>
                  </button>
                </Link>
              </div>
            ) : (
              // ลิงก์ปกติเมื่อไม่ได้บันทึกเสียง
              <div className="w-full md:w-full sm:w-full lg:w-[18%] flex justify-end">
                <Link to={`/user/listone/${set_number}`} className="w-[auto]">
                  <button
                    className="flex items-center justify-center min-h-[10px] w-full px-1 mx-0 text-red-500 rounded-full shadow-lg border-2 border-[#eb6f35] font-prompt hover:bg-gradient-to-r from-[#EB4335] to-[#FF7C30] hover:text-white cursor-pointer transition duration-500 lg:whitespace-normal whitespace-nowrap 
                  px-2 py-1 text-xs min-h-[8px] md:px-3 md:py-2 md:text-sm lg:px-2 lg:py-3 lg:ml-2 lg:text-lg bg-white"
                  >
                    <span className="text-sm md:text-sm lg:text-lg font-prompt font-semibold ">
                      ดูสคริปทั้งหมด
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>
          <div className="text-[12px] md:text-[0.9rem] lg:text-[0.9rem] text-gray-400 px-0 sm:px-2 md:px-4 lg:px-[9rem] py-2  flex flex-row">
            {" "}
            (ชุดที่ {set_number} จำนวน {scripts.length} ประโยค {completedCount}/
            {scripts.length}) {/* แสดงการแจ้งเตือน */}{" "}
            <ToastContainer
              position="top-right"
              autoClose={1000}
              style={{ top: "200", right: "70px" }}
            />
             <div className="mx-2">
              {currentScript ? (
                      (() => {
                        const status = getRecordingStatus(
                          currentScript.script_number
                        );

                        if (status === "completed") {
                          return (
                            <div className="status-done bg-green-400 rounded-[50px] px-1 text-white">
                             <span>ผ่าน</span>
                            </div>
                          );
                        } else if (status === "pending") {
                          return (
                            <div className="status-pending bg-yellow-200 rounded-[50px] px-1 text-yellow-700">
                              <span>รออนุมัติ</span>
                            </div>
                          );
                        } else if (status === "rejected") {
                          return (
                            <div className="status-rejected bg-red-400 rounded-[50px] px-1 text-white">
                             <span>ไม่ผ่าน</span>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                            </div>
                          );
                        }
                      })()
                    ) : (
                      <p>กำลังโหลดข้อมูล...</p>
                    )}
             </div>
          </div>
         
          

          <div className="text-gray-500 text-sm justify-center items-center ml-auto lg:w-[20%] w-[25%] absolute right-3 lg:right-8 lg:top-[8rem] md:top-[15rem] top-[17rem] md:z-50">
            <div className="flex-col justify-end items-end  w-full">
              {" "}
              {/*เลือกอุปกรณ์ไมโครโฟน*/}
              <div >
                <label className="text-gray-700 sm:text-sm text-[10px] whitespace-nowrap ">เลือกอุปกรณ์ไมโครโฟน:</label>
              </div>
              <div className="p-1 ">
                <select
                  value={selectedInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="p-1 w-[20%] sm:text-sm text-[10px] border border-red-200 shadow rounded-xl  w-full text-gray-700 bg-white"
                >
                  {devices.input.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `ไมโครโฟน ${devices.input.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-col justify-end items-end w-full">
              {" "}
              {/*เลือกอุปกรณ์ลำโพง*/}
              <div className="">
                <label className="text-gray-700 sm:text-sm text-[10px]">เลือกอุปกรณ์ลำโพง:</label>
              </div>
              <div className="p-1">
                <select
                  value={selectedOutput}
                  onChange={(e) => handleOutputChange(e.target.value)}
                  className="p-1 w-[20%] sm:text-sm text-[10px] border border-red-200 shadow rounded-xl w-full text-gray-700 bg-white"
                >
                  {devices.output.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `ลำโพง ${devices.output.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
                {devices.output.some(
                  (d) =>
                    d.label?.toLowerCase().includes("headphone") ||
                    d.label?.toLowerCase().includes("หูฟัง")
                ) && (
                  <div className="mt-1 lg:mt-2 text-blue-500  bg-blue-50 p-1 rounded-xl lg:rounded-full border border-blue-200 max-w-[160px] sm:max-w-40 lg:max-w-full overflow-hidden text-ellipsis truncate">
                    <div className="flex items-center gap-1 lg:gap-2 text-[10px] lg:text-[11.5px] ">
                      <i class="fa-solid fa-headset"></i>
                      กำลังเชื่อมต่อหูฟัง อาจจะเปลี่ยนลำโพงไม่ได้
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row md:flex-col sm:flex-col basis-[30vw] lg:pt-[2rem] ">
            {" "}
            {/* include three container block left center right side */}
            <div className="basis-[20vw] sm:basis-auto md:basis-auto lg:pt-[2rem] ">
              {" "}
              {/* container block left side */}
              {/* ตัววัดระดับเสียง */}
              <div className="flex flex-row lg:flex-col md:flex-row sm:flex-row ">
                <div className="w-[50%] h-auto sm:w-[32%] lg:w-full flex items-center justify-center ">
                  <div className="audio-meter">
                    <div
                      className="absolute transition-all ease-out"
                      style={{
                        "--volume-percentage": `${volume}%`,
                        width:
                          window.innerWidth <= 1024 ? `${volume}%` : "100%",
                        height:
                          window.innerWidth <= 1024 ? "100%" : `${volume}%`,
                        bottom: window.innerWidth <= 1024 ? "auto" : "0",
                        background:
                          volume > 90
                            ? "red"
                            : volume > 60
                            ? "yellow"
                            : "green",
                      }}
                    ></div>
                  </div>
                </div>

                <p className="text-[10px] md:text-[12px] lg:text-[13px] flex items-center pl-5 text-gray-700">
                  ระดับเสียง: {volume.toFixed(2)}%
                </p>
              </div>
              <div className="lg:flex flex flex-row lg:flex-col md:flex-row sm:flex-row w-full overflow-hidden justify-center hidden lg:block ">
                <div className="flex items-center lg:pl-5 pl-5  lg:w-full space-x-2 ">
                  <div className="flex items-center w-2 h-2  md:w-2 md:h-2 lg:w-3 lg:h-3 rounded-full bg-[rgba(235,67,53,1)]"></div>
                  <div className="flex items-center text-left rounded-lg ">
                    <p className="text-black text-[8px] md:text-[11px] lg:text-[12px]">
                      เสียงดัง
                    </p>
                  </div>
                </div>

                <div className="flex items-center lg:pl-5 pl-5 lg:w-full space-x-2 ">
                  <div className="flex items-center justify-center w-2 h-2  md:w-2 md:h-2 lg:w-3 lg:h-3  rounded-full bg-[rgba(255,190,48,1)]"></div>
                  <div className="flex items-center text-left rounded-lg ">
                    <p className="text-black text-[8px] md:text-[11px] lg:text-[12px] whitespace-nowrap">
                      เสียงปานกลาง (แนะนำ)
                    </p>
                  </div>
                </div>

                <div className="flex items-center lg:pl-5 pl-5 lg:w-full  space-x-2 ">
                  <div className="flex items-center justify-center w-2 h-2  md:w-2 md:h-2 lg:w-3 lg:h-3 rounded-full bg-[rgba(48,255,218,1)]"></div>
                  <div className="flex items-center text-left rounded-lg ">
                    <p className="text-black text-[8px] md:text-[11px] lg:text-[12px]">
                      เสียงเบา{" "}
                    </p>
                  </div>
                </div>
              </div>
              <div className="">
                <div
                  onClick={AudioSampleUI}
                  className="flex justify-center items-center space-x-1 p-1 mt-2 w-[8rem] bg-gray-100 shadow-md rounded-full border border-[#eb6f35] hover:bg-[rgba(235,67,53,1)] cursor-pointer text-[rgba(235,67,53,1)] hover:text-white transition-all duration-300 "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 sm:size-5 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                  <p className="text-sm md:text-md lg:text-md items-center">
                    ตัวอย่างเสียง
                  </p>
                </div>
              </div>
            </div>
            {/* สิ้นสุด container block left side */}
            <div className="w-full sm:w-auto lg:w-full">
              <div className="flex flex-col md:flex-row sm:flex-row flex-1 record-container ">
                {" "}
                {/* container block center recorded side */}
                {/* Reset Button */}
                <div className="py-1 mt-1">
                  <div
                    className="control-button shadow-lg  text-gray-400 hover:text-red-400"
                    onClick={() =>
                      handleReset(set_number, currentScript.script_number)
                    }
                  >
                    {/* <button onClick={() => handleReset(setId, scriptNumber)}>
                  ลบเสียง
                </button> */}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-7 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                  <h1 className=" text-[1rem] text-center text-gray-500 pt-3 sm:pt-5 md:pt-7 lg:pt-10">
                    รีเซ็ทเสียง
                  </h1>
                </div>
                {/* <button onClick={() => handleRecordProcess(set_number, currentScript.script_number)}>เริ่ม/หยุดบันทึก</button> */}
                <div className="py-1 mt-1 ">
                  {/* Record Button */}
                  <div className="record-button">
                    <div
                      className={`record-button ${
                        isRecording ? "recording" : ""
                      }`}
                      // onClick={handleRecordClick}
                      onClick={() =>
                        handleRecordProcess(
                          set_number,
                          currentScript.script_number
                        )
                      }
                    >
                      {isRecording ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="url(#gradient)"
                          className="w-[4rem] h-[4rem] text-gray-400 "
                        >
                          {" "}
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0"
                              x2="1"
                              y1="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#ff7e5f" />{" "}
                              {/* สีเริ่มต้น */}
                              <stop offset="100%" stopColor="#feb47b" />{" "}
                              {/* สีปลายทาง */}
                            </linearGradient>
                          </defs>
                          <path
                            fillRule="evenodd"
                            d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mic-icon text-gray-400 "
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      )}
                    </div>
                  </div>
                  <h1 className="text-[1rem] text-center text-gray-500 pt-5 sm:pt-5 md:pt-7 lg:pt-10">
                    เริ่มอัดเสียง
                  </h1>
                </div>
                <div className="py-1 mt-1 ">
                  {/* Play Button */}
                  <div
                    className="control-button shadow-lg text-gray-400 hover:text-red-400"
                    onClick={handlePlayClick}
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h12v12H6z"
                        />{" "}
                        {/* ไอคอนหยุด */}
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-7 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                        />{" "}
                        {/* ไอคอนเล่น */}
                      </svg>
                    )}
                  </div>

                  <h1 className="text-[1rem] text-center text-gray-500 pt-3 sm:pt-5 md:pt-7 lg:pt-10">
                    ฟังเสียง
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center ">
                {/* Timer */}
                <p className="text-lg font-semibold text-gray-700 text-center">
                  {formatTime(timer)}
                </p>
                {/* Audio Player */}
                {/* {audioUrl && (
                <audio ref={audioPlayerRef} controls  className=" w-[30vw] shadow-lg border border-red-200 rounded-full text-center">
                  <source src={audioUrl} type="audio/webm" />
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นไฟล์เสียง
                </audio>
              )} */}
                {/* <p>{config.apiBaseUrl} </p> */}
                {audioFile ? (
                   <div className="w-xl md:w-[70%] w-[70%] lg:w-[40%] mt-2 shadow-md border border-red-100 rounded-full text-center p-2">
                   {/* ✅ Safari iOS → ใช้ปุ่ม Play */}
                   {isSafari && (
                    //  <button onClick={handlePlayClick} className="px-4 py-2 bg-blue-500 text-white rounded-full">
                    //    {isPlaying ? "⏸ Pause" : "▶ Play"}
                    //  </button>
                    <button onClick={handlePlayClick} className="px-4 py-2 w-[95%] border-2 border-gray-200 bg-gray-100 hover:bg-gray-300 duration-300 transition ease-in-out text-gray-500 rounded-full">
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </button>
                   )}
             
                   {/* ✅ Chrome Android → ใช้ <audio> */}
                   {!isSafari && (
                     <audio
                       ref={audioPlayerRef}
                       key={audioFile}
                       id="audioElement"
                       controls
                       controlsList="nodownload"
                       className="w-full mt-2"
                     >
                       <source src={`${config.apiBaseUrl}/record/play/${audioFile}`} type="audio/wav" />
                       Your browser does not support the audio element.
                     </audio>
                  //   <button onClick={handlePlayClick} className="px-4 py-2 w-[95%] border-2 border-gray-200 bg-gray-100 hover:bg-gray-300 duration-300 transition ease-in-out text-gray-500 rounded-full">
                  //   {isPlaying ? "⏸ Pause" : "▶ Play"}
                  // </button>
                   )}
                  </div>
                ) : (
                  <p></p>
                )}

              </div>
            </div>
            {/* {user ? (
            <span className="text-sm text-gray-600 mr-4">สวัสดี, {user.name_lastname}</span>
          ) : (
            <span className="text-sm text-gray-600 mr-4">กรุณาเข้าสู่ระบบ</span>
          )} */}
            <div className="basis-[5vw] sm:basis-auto md:basis-[5vw] pt-[1rem] lg:pt-[25rem]">
              {" "}
              {/* container block right side */}
              {isRecording ? (
                <div className="flex ml-auto w-40 lg:w-40 md:w-40 p-1 py-2 shadow-md rounded-full border border-[#eb6f35] hover:bg-[rgba(235,67,53,1)] cursor-pointer text-[rgba(235,67,53,1)] hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  <p className="mx-1">ประวัติบันทึกเสียง</p>
                </div>
              ) : (
                <Link
                  to={`/user/history/${set_number}`}
                  className="flex sm:justify-start md:justify-end"
                >
                  <div className="flex ml-auto w-40 lg:w-40 md:w-40 p-1 py-2 shadow-md rounded-full border border-[#eb6f35] hover:bg-[rgba(235,67,53,1)] cursor-pointer text-[rgba(235,67,53,1)] hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    <p className="mx-1 whitespace-nowrap">ประวัติบันทึกเสียง</p>
                  </div>
                </Link>
              )}
              {/* ตัววัดระดับเสียง */}
            </div>
            {/* สิ้นสุด container block right side */}
          </div>
          {/* สิ้นสุด include three container block left center right side */}
        </div>
      </main>
    </div>
  );
};

export default VoiceRecorder;
