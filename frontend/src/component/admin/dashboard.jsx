import React, { useEffect, useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import config from "../../../config";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/user/all_users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ส่งคุกกี้ไปกับคำขอ
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch all records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/record/get_records_all`, {
          method: "GET",
          credentials: "include", // แนบ Cookie ไปกับคำขอ
        });
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Count summary
  const totalUsers = users.length;
  const totalRecords = records.length;
  const completedRecords = records.filter(record => record.status_record === "completed").length;
  const pendingRecords = records.filter(record => record.status_record === "pending").length;
  const rejectedRecords = records.filter(record => record.status_record === "rejected").length;
  // Data for Pie Chart
  const pieData = {
    labels: ["Completed", "Pending", "rejected"],
    datasets: [
      {
        data: [completedRecords, pendingRecords, rejectedRecords],
        backgroundColor: ["#4caf50", "#f4aa30", "#ff2222"],
        hoverBackgroundColor: ["#45a049", "#e3991f", "#d31010"],
      },
    ],
  };

  // Data for Bar Chart (e.g., user-specific records)
  const barData = {
    labels: users.map(user => `${user.firstname} ${user.lastname}`),
    datasets: [
      {
        label: "Records per User",
        data: users.map(user =>
          records.filter(record => record.user_id === user._id).length
        ),
        backgroundColor: "#2196f3",
      },
    ],
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-gray-700 font-bold text-xl">Total Users</h3>
              <p className="text-2xl font-semibold text-blue-600">{totalUsers}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-gray-700 font-bold text-xl">Total Records</h3>
              <p className="text-2xl font-semibold text-purple-600">{totalRecords}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-gray-700 font-bold text-xl">Completed Records</h3>
              <p className="text-2xl font-semibold text-green-600">{completedRecords}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-gray-700 font-bold text-xl">Pending Records</h3>
              <p className="text-2xl font-semibold text-yellow-600">{pendingRecords}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-gray-700 font-bold text-xl">Rejected Records</h3>
              <p className="text-2xl font-semibold text-red-600">{rejectedRecords}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-gray-700 font-bold text-xl mb-4">Record Status Distribution</h3>
              <Pie data={pieData} />
            </div>

            {/* Bar Chart */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-gray-700 font-bold text-xl mb-4">Records Per User</h3>
              <Bar data={barData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
