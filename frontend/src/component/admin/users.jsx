import React, { useEffect, useState } from "react";
import config from "../../../config";

const UserTable = () => {
  const [users, setUsers] = useState([]); // เก็บข้อมูลผู้ใช้
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  // ฟังก์ชันดึงข้อมูลผู้ใช้
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
        setUsers(data); // เก็บข้อมูลผู้ใช้ใน state
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error.message);
      } finally {
        setLoading(false); // เปลี่ยนสถานะการโหลด
      }
    };

    fetchUsers();
  }, []);

  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4">
     <div className="container mx-auto px-4 py-8 w-full shadow-md bg-white rounded-xl">
      <h1 className="text-3xl font-semibold text-black text-center mb-8 font-prompt ">รายชื่อผู้ใช้</h1>
      {loading ? (
        <div className="text-lg text-gray-600 text-center">กำลังโหลดข้อมูล...</div>
      ) : users.length > 0 ? (
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">ลำดับ</th>
                <th className="py-3 px-4 text-left font-semibold">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4 text-left font-semibold">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4 text-left font-semibold">อีเมล</th>
                <th className="py-3 px-4 text-left font-semibold">ที่อยู่</th>
                <th className="py-3 px-4 text-left font-semibold">วันที่สมัคร</th>
                <th className="py-3 px-4 text-left font-semibold">จำนวนอัดเสียง</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.email}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="py-3 px-4 text-gray-800 text-center">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.phone_number}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">{user.address}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-center">{user.sum_record}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-lg text-gray-600 text-center">ไม่พบข้อมูลผู้ใช้</div>
      )}
    </div>
    </div>
  );
};

export default UserTable;
