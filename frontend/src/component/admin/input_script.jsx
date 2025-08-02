import React, { useState, useEffect, useCallback } from 'react'
import { Edit2, Trash2, Check, ChevronDown, Filter, X } from 'lucide-react'
import Swal from 'sweetalert2'
import config from "../../../config";

const App = () => {
  // State Management
  const [scripts, setScripts] = useState([])
  const [originalScripts, setOriginalScripts] = useState({})
  const [setNumber, setSetNumber] = useState('default')
  const [textInput, setTextInput] = useState('')
  const [setSummary, setSetSummary] = useState({})
  const [editingScript, setEditingScript] = useState(null)
  const [selectedSetView, setSelectedSetView] = useState('latest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [newSetNumber, setNewSetNumber] = useState('');  // ชุดข้อมูลใหม่
  const [newDescrip, setNewDescrip] = useState(''); // เพิ่ม state สำหรับคำอธิบาย
  const [setsDropdown, setSetsDropdown] = useState([]);  // แสดงชุดข้อมูลใน dropdown

  // Fetch Data with Enhanced Logic
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/script/read_scripts`, {
        method: "GET",
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      });
      const { data, total_count, remaining } = await response.json();
  
      // เพิ่ม console.log เพื่อตรวจสอบข้อมูล
      console.log('Fetched Data:', { data, total_count, remaining });
  
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        return;
      }
  
      // Group scripts by set_number with preserved chronological order
      const groupedScripts = data.reduce((acc, item) => {
        if (!acc[item.set_number]) {
          acc[item.set_number] = [];
        }
        acc[item.set_number].push({
          ...item,
          created_timestamp: new Date(item.created_at).getTime()
        });
        return acc;
      }, {});
      
      // Sort and number scripts within each set
      Object.keys(groupedScripts).forEach(set => {
        groupedScripts[set].sort((a, b) => a.created_timestamp - b.created_timestamp);
        groupedScripts[set] = groupedScripts[set].map((item, index) => ({
          ...item,
          set_order: index + 1
        }));
      });
      
      // Create a summary of sets with script count
      const summary = Object.keys(groupedScripts).reduce((acc, set) => {
        acc[set] = groupedScripts[set].length;
        return acc;
      }, {});
      
      setSetSummary(summary);
      setOriginalScripts(groupedScripts);
      
      // Default to latest scripts on initial load
      const latestScripts = Object.keys(groupedScripts)
        .map(set => {
          const setScripts = groupedScripts[set];
          return setScripts[setScripts.length - 1];
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
  
      setScripts(latestScripts); // Update the scripts displayed
      setSelectedSetView('latest'); // Default to 'latest' view
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  }, []);
  
  const changeSetView = (set) => {
    setSelectedSetView(set);
    setIsDropdownOpen(false);
  
    let filteredScripts = [];
  
    if (set === 'latest') {
      filteredScripts = Object.keys(originalScripts)
        .map(setKey => {
          const setScripts = originalScripts[setKey];
          return setScripts[setScripts.length - 1]; // เลือกเฉพาะสคริปต์ล่าสุดในแต่ละชุด
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filteredScripts = originalScripts[set] || []; // เลือกชุดตามที่เลือก
    }
  
    // เพิ่มการ log เพื่อตรวจสอบ
    console.log(`Filtered Scripts for ${set}:`, filteredScripts);
  
    setScripts(filteredScripts);
  };
  
  
  // ลบ state และฟังก์ชันที่เกี่ยวกับ pagination
  const filteredScripts = scripts.filter(script => 
    script.textinput.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle Script Submission
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // เปิด Loading
  
    if (setNumber === 'default') {
      // alert('กรุณาเลือกชุดประโยค');
      Swal.fire({
        title: "กรุณาเลือกชุดประโยค",
        icon: "warning",
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      setIsLoading(false);
      return;
    }
  
    if (!textInput.trim()) {
      Swal.fire({
        title: "กรุณากรอกสคริปข้อความ",
        icon: "warning",
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      // alert('กรุณากรอกข้อความ!');
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/script/add_script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include", // แนบ Cookie ไปกับคำขอ
        body: JSON.stringify({
          set_number: setNumber,
          textinput: textInput,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาด');
      }
  
      // alert('เพิ่มข้อมูลสำเร็จ!');
      Swal.fire({
        position: "top",
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      setTextInput('');
      fetchData();
      changeSetView(setNumber);
    } catch (error) {
      console.error('Error adding data:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsLoading(false); // ปิด Loading
    }
  };
  
  // สำหรับเพิ่มชุดใหม่ collection set_number
  const handleAddNewSet = async () => {
    if (!newSetNumber || !newDescrip) {
      // alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      Swal.fire({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        icon: "warning",
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      return;
    }
    try {
      const response = await fetch(`${config.apiBaseUrl}/script/add_set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // แนบ Cookie ไปกับคำขอ
        body: JSON.stringify({
          set_number: newSetNumber,
          description: newDescrip,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add new set");
      }
      // alert('เพิ่มชุดใหม่สำเร็จ!');
      Swal.fire({
        position: "top",
        icon: "success",
        title: "เพิ่มชุดใหม่สำเร็จ",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      setIsModalOpen(false);
      setNewSetNumber("");
      setNewDescrip("");
      fetchSets(); // อัปเดต `setSummary` หลังเพิ่มชุดใหม่
    } catch (error) {
      console.error("Error adding new set:", error);
      // alert("เกิดข้อผิดพลาดในการเพิ่มชุดใหม่");
      Swal.fire({
        title: "ไม่สามารถเลือกชุดซ้ำได้",
        icon: "warning",
        customClass: {
          popup: 'rounded-2xl'
        }
      });
    }
  };

// ฟังก์ชันดึงข้อมูลจาก set Backend
const fetchSets = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/script/read_set`, {
      method: "GET",
      credentials: "include", // แนบ Cookie ไปกับคำขอ
    });
    if (!response.ok) {
      throw new Error("Failed to fetch sets");
    }
    const data = await response.json();
    console.log("ข้อมูลจาก API:", data); 

    // เรียงลำดับข้อมูลตาม set_number
    const sortedData = data.sort((a, b) => a.set_number - b.set_number);

    // แยกข้อมูลสำหรับ dropdown
    const dropdownData = sortedData.map((item) => ({
      set_number: item.set_number,
      description: item.description || "ไม่มีคำอธิบาย",
    }));
    setSetsDropdown(dropdownData);

    // เรียก fetchData เพื่อให้มั่นใจว่ามีข้อมูลสคริปต์ล่าสุด
    fetchData(); 
  } catch (error) {
    console.error("Error fetching sets:", error);
  }
};

// เรียก fetchSets เมื่อ component โหลดครั้งแรก
useEffect(() => {
  fetchSets();
}, []);

// ลบชุด สำหรับ collection set_number
const handleDeleteSet = async (setToDelete) => {
  const confirmDelete = window.confirm(`คุณต้องการลบชุด ${setToDelete} ใช่หรือไม่?`);
  if (confirmDelete) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/script/delete_set/${setToDelete}`, {
        method: 'DELETE',
        credentials: "include", // แนบ Cookie ไปกับคำขอ
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // อัปเดต UI หลังลบชุด
      const updatedSummary = { ...setSummary };
      delete updatedSummary[setToDelete];
      setSetSummary(updatedSummary);

      // รีเฟรชข้อมูล
      fetchData();

      alert('ลบชุดสำเร็จ!');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบชุด:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }
};


  // Handle Script Edit
  const handleEdit = (script) => {
    setEditingScript(script);
    setTextInput(script.textinput);
    setSetNumber(script.set_number);
  };

  // Handle Script Update
  const handleUpdate = async () => {
    try {
      if (!editingScript?._id || !setNumber || !textInput) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/script/update_script/${editingScript._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include", // แนบ Cookie ไปกับคำขอ
        body: JSON.stringify({
          set_number: setNumber,
          textinput: textInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Network response was not ok');
      }

      alert('อัพเดทข้อมูลสำเร็จ!');
      setEditingScript(null);
      setTextInput('');
      fetchData();
      changeSetView(setNumber); // Refresh the view with the updated set
    } catch (error) {
      console.error('Error updating data:', error);
      alert('อัพเดทข้อมูลสำเร็จ');
    }
  };

  // Handle Script Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?');
    if (confirmDelete) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/script/delete_script/${id}`, {
          method: 'DELETE',
          credentials: "include" // แนบ Cookie ไปกับคำขอ
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        alert('ลบข้อมูลสำเร็จ!');
        fetchData();
        // Maintain current view after deletion
        changeSetView(selectedSetView);
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-prompt font-semibold mb-8 text-gray-800 text-center" >
            จัดการสคริปต์ข้อความ
          </h1>

          {/* Form for adding/editing scripts */}
          <form 
            onSubmit={editingScript ? handleUpdate : handleSubmit} 
            className="grid grid-cols-4 gap-5  mb-8 bg-blue-50 p-6 rounded-3xl"
          >
            <div className='cols-1'>
              <p className='pl-2 pb-2 text-[15px] text-gray-500 '>เลือกชุด</p>
        <select
          value={setNumber}
          onChange={(e) => {
            const selectedValue = e.target.value;
            if (selectedValue === "new_set") {
              setIsModalOpen(true);
            } else {
              setSetNumber(selectedValue);
            }
          }}
           className="p-3 border-2 border-gray-300 bg-white text-gray-600 w-full rounded-xl focus:ring-2 focus:ring-blue-500"
        >
        <option value="default">เลือกชุดประโยค</option>
          {setsDropdown.map((set) => (
            <option key={set.set_number} value={set.set_number}>
              {set.set_number} {/* แสดงหมายเลขชุด */}
            </option>
          ))}
          <option value="new_set">เพิ่มชุดใหม่</option>
        </select>
        </div>

            {/* Modal สำหรับเพิ่มชุดใหม่ */}
            {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 className="text-xl bg-white text-gray-600 font-semibold mb-4">เพิ่มชุดใหม่</h2>
            <p className="text-sm bg-white text-gray-600 p-2">หมายเลขชุด</p>
            <input
              type="text" // เปลี่ยนจาก type="number" เป็น type="text" เพื่อป้องกันปุ่มเพิ่ม/ลด
              value={newSetNumber}
              onChange={(e) => {
                const value = e.target.value;
                // อนุญาตเฉพาะตัวเลขที่มากกว่า 0 (Positive Integers)
                if (/^[1-9]\d*$/.test(value) || value === "") {
                  setNewSetNumber(value); // อัปเดตค่าที่ถูกต้อง
                }
              }}
              placeholder="กรอกหมายเลขชุด (ตัวเลขเท่านั้น)"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
            />
            <p className="text-sm bg-white text-gray-600 p-2">คำอธิบาย (เช่น. ชุดที่ 1 จำนวน 50 ประโยค (01 - 50))</p>
            <input
              type="text"
              value={newDescrip}
              onChange={(e) => setNewDescrip(e.target.value)}
              placeholder="กรอกคำอธิบาย"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button" // ป้องกันการ Submit Form
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-red-400"
              >
                ยกเลิก
              </button>
              <button
                type="button" // ป้องกันการ Submit Form
                onClick={handleAddNewSet}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}

            <div className='col-span-2'>
              <p className='pl-2 pb-2 text-[15px] text-gray-500'>เพิ่มสคริป</p>
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการเพิ่ม"
              className="p-3 w-full border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 col-span-2 md:col-span-2 bg-white text-gray-600"
            />
           </div>
           <div >
            <button 
              type="submit" 
              className={`
                ${editingScript  
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-500 hover:bg-blue-600 '
                } 
                text-white h-[50px] col-span-1 w-full mt-8 rounded-xl flex items-center justify-center space-x-2 shadow-lg 
              ` }
              disabled={isLoading}
            >
              {isLoading ? 'กำลัง' : ''}
              {editingScript ? (
                <>
                  <Check size={20} />
                  <span>บันทึกการแก้ไข</span>
                </>
              ) : (
                'บันทึก'
              )}
            </button>
            </div>
          </form>

          {/* Set Selection and Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            {/* Set Selection Dropdown */}
          {/* Dropdown สำหรับเลือกชุด */}
          <div className="relative w-full md:w-1/3">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-blue-500 text-white p-3 rounded-xl 
                flex items-center justify-between hover:bg-blue-600 transition"
            >
              {selectedSetView === 'latest' 
                ? 'รายการล่าสุด' 
                : `ชุดที่ ${selectedSetView}`}
              <ChevronDown />
            </button>

            {isDropdownOpen && (
            <div className="absolute z-10 w-full bg-blue-50 shadow-lg rounded-xl mt-2">
              <div 
                onClick={() => changeSetView('latest')}
                className="p-3 hover:bg-gray-100 cursor-pointer bg-white text-gray-600"
              >
                รายการล่าสุด
              </div>
              {Object.keys(setSummary).map(set => (
                <span onClick={() => changeSetView(set)}>
                <div 
                  key={set}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                    <p className='text-gray-500 '>ชุด <strong>{set}</strong></p>
                
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-gray-500 
                      ${Number(setSummary[set]) > 50 ? 'text-red-500 font-bold' : ''}
                    `}>
                      {Number(setSummary[set])} รายการ
                      {Number(setSummary[set]) > 50 && ' (เกินจำนวน!)'}
                    </span>
                    <button 
                      onClick={() => handleDeleteSet(set)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded-full bg-white "
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                </span>
              ))}
            </div>
            )}
          </div>

            {/* Search Input */}
            <div className="relative w-full md:w-1/2">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาข้อความ..."
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Scripts List */}
           <div className="space-y-4 bg-white text-gray-600">
              {filteredScripts.length === 0 ? (
                <p className="text-center text-gray-500">ไม่พบข้อมูล</p>
              ) : (
                filteredScripts.map((item) =>  (
            <div 
              key={item._id} 
              className="bg-white border border-gray-200 p-4 rounded-3xl 
                flex justify-between items-center hover:shadow-md 
                transition duration-300 ease-in-out"
            >
              <div className="flex-grow">
                <strong className="text-blue-600 mr-5">ชุดที่ {item.set_number} </strong>
                <span>
                  {item.set_order}. {item.textinput}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <small className="text-gray-500 mr-4">
                  {new Date(item.created_at).toLocaleString('th-TH', {
                    timeZone: 'Asia/Bangkok',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 border border-blue-100 shadow-md hover:bg-blue-100 p-2 rounded-full transition bg-white"
                    >
                      <Edit2 size={20} />
                    </button>
                    {/* <button 
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 border border-red-100 shadow-md hover:bg-red-100 p-2 rounded-full transition"
                    >
                      <Trash2 size={20} />
                    </button> */}
                  </div>
                </div>
              ))
            )}
         

          </div>
        </div>
      </div>
    </div>
  )
}

export default App