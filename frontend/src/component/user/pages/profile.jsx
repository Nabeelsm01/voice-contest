import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../../config";
import Swal from "sweetalert2";


const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State สำหรับตรวจสอบสถานะการโหลดข้อมูล

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true); // เริ่มโหลด
      try {
        const response = await fetch(`${config.apiBaseUrl}/user/me/`, {
          method: "GET",
          credentials: "include", // Cookie ถูกส่งไปยัง server
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false); // โหลดเสร็จแล้ว
      }
    };

    fetchUser();
  }, []);

  // หลังจากหน้าโหลดเสร็จ ตรวจสอบและแสดง Toast
  useEffect(() => {
    if (localStorage.getItem("showToast") === "true") {
      toast.success("อัปเดตข้อมูลสำเร็จ!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        localStorage.removeItem("showToast"); // ลบสถานะหลังแสดง Toast
      }, 2000);
    }
  }, []);

  //ฟังชันก์อินพุด
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  //ฟังชันก์รูป
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // 1. ตรวจสอบประเภทไฟล์
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("ไฟล์ต้องเป็นรูปภาพในรูปแบบ JPG หรือ PNG เท่านั้น!");
        return;
      }

      // 2. ตรวจสอบขนาดไฟล์
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert("ไฟล์ต้องมีขนาดไม่เกิน 2MB!");
        return;
      }

      // 3. ตรวจสอบขนาดภาพ
      const img = new Image();
      img.onload = () => {
        const maxWidth = 2048;
        const maxHeight = 2048;
        if (img.width > maxWidth || img.height > maxHeight) {
          alert(`ขนาดรูปภาพต้องไม่เกิน ${maxWidth}x${maxHeight} พิกเซล!`);
          return;
        }

        // 4. อัปเดต state หากไฟล์ผ่านเงื่อนไขทั้งหมด
        setProfile((prev) => ({ ...prev, profile_picture: file }));
      };

      img.onerror = () => {
        alert("ไม่สามารถอ่านไฟล์รูปภาพได้!");
      };

      // ใช้ FileReader เพื่อโหลดไฟล์เป็น URL
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result; // ใช้ URL สำหรับตรวจสอบขนาดภาพ
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEdit = () => setEditing(!editing);

  const handleUpdateProfile = async () => {
    try {
      // หากมีการเลือกไฟล์ใหม่สำหรับอัปโหลด
      if (profile?.profile_picture instanceof File) {
        const formData = new FormData();
        formData.append("file", profile.profile_picture);

        const uploadResponse = await fetch(`${config.apiBaseUrl}/user/uploadimg/?id=${profile._id}`, {
          method: "POST",
          credentials: "include", // ส่งคุกกี้ไปด้วย
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.error("Failed to upload profile picture:", uploadError);
          toast.error("อัปโหลดรูปภาพล้มเหลว!", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
        const uploadData = await uploadResponse.json();
        console.log("Image uploaded successfully:", uploadData);
      }

      const response = await fetch(`${config.apiBaseUrl}/user/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ส่งคุกกี้ไปกับคำขอ
        body: JSON.stringify({
          firstname: profile.firstname,
          lastname: profile.lastname,
          phone_number: profile.phone_number,
          address: profile.address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Updated successfully:", data);
        // ก่อนรีโหลด เก็บสถานะใน localStorage
        localStorage.setItem("showToast", "true");
        window.location.reload();
        setEditing(false); // ปิดโหมดแก้ไข
      } else {
        const error = await response.json();
        console.error("Failed to update profile:", error);
        alert("ไม่สามารถอัปเดตข้อมูลได้!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ!");
    }
  };

  const handleLogout = async () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะต้องเข้าสู่ระบบอีกครั้งหลังจากออกจากระบบ!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${config.apiBaseUrl}/user/logout/`, {
            method: "POST",
            credentials: "include", // ส่งคุกกี้ไปกับคำขอ
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data);
            Swal.fire({
              title: "ออกจากระบบสำเร็จ!",
              text: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              timerProgressBar: true,
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            console.error("ไม่สามารถออกจากระบบได้:", response.statusText);
            Swal.fire({
              title: "เกิดข้อผิดพลาด!",
              text: "ไม่สามารถออกจากระบบได้",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            icon: "error",
          });
        }
      }
    });
  };



  return (
    <div className="flex-1 bg-gray-100 min-h-screen p-2 sm:p-0 md:p-2 lg:px-6 py-1">
      {/* Sidebar */}

      {/* Back Button */}
      <div className="flex justify-center items-center  rounded-full bg-white sm:w-10 sm:m-2 w-10 m-2 lg:w-14 md:w-12 shadow-md">
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
      {/* Main Content */}
      <main className="flex-1 bg-gray-100  py-1 text-gray-700">
        <div className="bg-white rounded-[50px] shadow-lg p-10 ">
          <h2 className="text-2xl font-bold text-red-500 mb-4">โปรไฟล์</h2>
          {isLoading ? ( // แสดง Spinner เมื่อกำลังโหลด
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* รูปโปรไฟล์ */}
              <div className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200"
                  style={{ position: "relative" }}
                >
                  {isLoading ? ( // แสดง Spinner ระหว่างโหลดรูปภาพ
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-red-500"></div>
                    </div>
                  ) : (
                    <img
                      src={
                        profile?.profile_picture
                          ? profile.profile_picture instanceof File
                            ? URL.createObjectURL(profile.profile_picture) // แปลง File เป็น URL
                            : profile.profile_picture.startsWith("https")
                              ? profile.profile_picture // ใช้ URL ที่เริ่มต้นด้วย https
                              : `${config.apiBaseUrl}/${profile.profile_picture}` // แปลง path เป็น URL
                          : "/src/assets/112.png" // ค่าเริ่มต้น
                      }
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                {editing && ( // เงื่อนไขเพื่อแสดงปุ่มเพิ่มรูปภาพเมื่อ editing เป็น true
                  <>
                    <label
                      htmlFor="fileInput"
                      className="relative bottom-11 left-10 bg-gray-100 border rounded-full p-5 hover:bg-gray-200 cursor-pointer "
                    > 
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        class="size-5"
                      >
                        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                        <path
                          fill-rule="evenodd"
                          d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </label>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                )}
                <button
                  onClick={toggleEdit}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {editing ? "ยกเลิก" : "แก้ไขโปรไฟล์"}
                </button>
              </div>

              {/* ข้อมูลโปรไฟล์ */}
              <div>
                {editing ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block font-bold">ชื่อ:</label>
                      <input
                        type="text"
                        name="firstname"
                        value={profile.firstname}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">นามสกุล:</label>
                      <input
                        type="text"
                        name="lastname"
                        value={profile.lastname}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <span className="block font-bold">อีเมล: </span>
                      {profile.email}
                    </div>
                    <div>
                      <label className="block font-bold">เบอร์โทร:</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={profile.phone_number}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">ที่อยู่:</label>
                      <textarea
                        name="address"
                        value={profile.address}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdateProfile}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      บันทึก
                    </button>
                  </form>
                ) : (
                  <ul className="space-y-4">
                    <li>
                      <span className="font-bold">ชื่อ: </span>
                      {profile.firstname}
                    </li >
                    <li>
                      <span className="font-bold">นามสกุล: </span>
                      {profile.lastname}
                    </li>
                    <li>
                      <span className="font-bold">อีเมล: </span>
                      {profile.email}
                    </li>
                    <li>
                      <span className="font-bold">เบอร์โทร: </span>
                      {profile.phone_number}
                    </li>
                    <li>
                      <span className="font-bold">ที่อยู่: </span>
                      {profile.address}
                    </li>
                  </ul >
                )}
              </div >
            </div >
          )}
        </div >
        <li className="flex justify-end items-center mt-10 mx-10 relative group">
          <Link
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-500"
          >
            <i className="fas fa-sign-out-alt w-8 text-center "></i>
            <span className="text-[16px]">ออกจากระบบ</span>
          </Link>
        </li>
      </main >
    </div >
  );
};

export default ProfilePage;
