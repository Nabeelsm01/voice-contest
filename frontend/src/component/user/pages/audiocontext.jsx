// audiocontext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [devices, setDevices] = useState({ input: [], output: [] });
    const [selectedInput, setSelectedInput] = useState("");
    const [selectedOutput, setSelectedOutput] = useState("");
    const [speakerVolume, setSpeakerVolume] = useState(
        () => Number(localStorage.getItem("speakerVolume")) || 80
    );
    const [audioStream, setAudioStream] = useState(null);

    // โหลดรายการอุปกรณ์
    const loadDevices = async () => {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();
            const inputDevices = deviceList.filter((d) => d.kind === "audioinput");
            const outputDevices = deviceList.filter((d) => d.kind === "audiooutput");

            setDevices({ input: inputDevices, output: outputDevices });

            // โหลดค่าที่บันทึกไว้จาก localStorage
            const savedInput = localStorage.getItem("selectedMicrophone");
            if (savedInput && inputDevices.some((d) => d.deviceId === savedInput)) {
                setSelectedInput(savedInput);
            } else if (inputDevices.length > 0) {
                setSelectedInput(inputDevices[0].deviceId);
            }

            const savedOutput = localStorage.getItem("selectedSpeaker");
            if (savedOutput && outputDevices.some((d) => d.deviceId === savedOutput)) {
                setSelectedOutput(savedOutput);
            } else if (outputDevices.length > 0) {
                setSelectedOutput(outputDevices[0].deviceId);
            }
        } catch (error) {
            console.error("Error loading devices:", error);
        }
    };

    // เปลี่ยนไมโครโฟน
    const handleInputChange = async (newInput) => {
        try {
            const constraints = {
                audio: { 
                    deviceId: { exact: newInput },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setAudioStream(stream);
            setSelectedInput(newInput);
            localStorage.setItem("selectedMicrophone", newInput);
        } catch (error) {
            console.error("Error switching microphone:", error);
        }
    };

    // เปลี่ยนลำโพง
    const handleOutputChange = async (newOutput) => {
        try {
            setSelectedOutput(newOutput);
            localStorage.setItem("selectedSpeaker", newOutput);

            // ค้นหา audio elements ทั้งหมดในหน้าและอัพเดท
            const audioElements = document.getElementsByTagName('audio');
            for (let audio of audioElements) {
                if (typeof audio.setSinkId === 'function') {
                    await audio.setSinkId(newOutput);
                }
            }
        } catch (error) {
            console.error("Error switching speaker:", error);
        }
    };
// ใน audiocontext.jsx
useEffect(() => {
    const initializeAudioOutput = async () => {
        if (selectedOutput) {
            try {
                // เช็คการรองรับ setSinkId
                if (typeof HTMLMediaElement.prototype.setSinkId === 'undefined') {
                    console.warn("Browser ไม่รองรับการเปลี่ยน audio output");
                    return;
                }

                // อัพเดททุก audio elements ที่มีอยู่
                const audioElements = document.getElementsByTagName('audio');
                for (let audio of audioElements) {
                    try {
                        await audio.setSinkId(selectedOutput);
                    } catch (err) {
                        console.error("Error setting initial sink ID:", err);
                    }
                }
            } catch (error) {
                console.error("Error initializing audio output:", error);
            }
        }
    };

    initializeAudioOutput();
}, [selectedOutput]); // เรียกใช้เมื่อ selectedOutput มีการเปลี่ยนแปลง
// ใน audiocontext.jsx เพิ่ม useEffect อีกอัน
useEffect(() => {
    if (!selectedOutput) return;

    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'AUDIO') {
                    try {
                        await node.setSinkId(selectedOutput);
                    } catch (err) {
                        console.error("Error setting sink ID for new audio element:", err);
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return () => observer.disconnect();
}, [selectedOutput]);

    // ปรับระดับเสียง
    // const handleVolumeChange = (newVolume) => {
    //     setSpeakerVolume(newVolume);
    //     localStorage.setItem("speakerVolume", newVolume);
        
    //     // อัพเดทระดับเสียงให้กับ audio elements ทั้งหมด
    //     const audioElements = document.getElementsByTagName('audio');
    //     for (let audio of audioElements) {
    //         audio.volume = newVolume / 100;
    //     }
    // };
    // const handleSpeakerVolumeChange = (e) => {
    //     const newVolume = e.target.value;
    //     setSpeakerVolume(newVolume);
    //     localStorage.setItem("speakerVolume", newVolume);
    //     if (audioRef.current) audioRef.current.volume = newVolume / 100;
    //   };
    const handleSpeakerVolumeChange = (newVolume) => {
        setSpeakerVolume(newVolume);
        localStorage.setItem("speakerVolume", newVolume);
        
        // อัพเดทระดับเสียงให้กับ audio elements ทั้งหมด
        const audioElements = document.getElementsByTagName('audio');
        for (let audio of audioElements) {
            audio.volume = newVolume / 100;
        }
    };

    
    useEffect(() => {
        loadDevices();
        // เพิ่ม event listener สำหรับการเปลี่ยนแปลงอุปกรณ์
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
        
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
            // หยุด stream เมื่อ component unmount
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const value = {
        devices,
        selectedInput,
        selectedOutput,
        speakerVolume,
        audioStream,
        setAudioStream,
        handleInputChange,
        handleOutputChange,
        handleSpeakerVolumeChange,
        loadDevices
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudioContext = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudioContext must be used within an AudioProvider');
    }
    return context;
};