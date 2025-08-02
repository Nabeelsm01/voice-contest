import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./component/home";
import InputScript from "./component/admin/input_script";
import AllSound from "./component/admin/all_sound";
import Record from "./component/user/pages/record";
import HeaderUser from "./component/user/navbar_user";
import SlidebarUser from "./component/user/slidebar_user";

import HeaderAdmin from "./component/admin/navbar_admin";
import SlidebarAdmin from "./component/admin/slidebar_admin";
import Dashboard from "./component/admin/dashboard";
import Users from "./component/admin/users";

import ListSet from "./component/user/pages/list"; // เลือกชุด
import ListScript from "./component/user/pages/listone";

import Use from "./component/user/pages/use";
import Trophy from "./component/user/pages/trophy";
import AudioSettings from "./component/user/pages/sound";
import { AudioProvider } from "./component/user/pages/audiocontext";
import Rules from "./component/user/pages/rules";
import History from "./component/user/pages/history";
import Profile from "./component/user/pages/profile";
import Leaderboard from "./component/user/pages/leaderboard";
import Condition from "./component/condition";

import PrivateRoute from "./component/PrivateRoute"; // นำเข้า PrivateRoute
import config from "../config";

import AdminLayout from "./layout/AdminLayout";
import UserLayout from "./layout/UserLayout";
import UserRoute from "./routes/UserRoute"; // Import
import AdminRoute from "./routes/adminroute"; // Import

import { AuthProvider, useAuth } from './context/authcontext'; // นำเข้า AuthProvider

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  //console.log(user?.role);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["admin"]}>
            <AdminLayout>
              <Routes>
                <Route
                  path="input_script"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["admin"]}>
                      <InputScript />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="all_sound"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["admin"]}>
                      <AllSound />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["admin"]}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["admin"]}>
                      <Users />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/*"
        element={
          <UserLayout>
            <AudioProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="user/record/:set_number"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <Record />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="user/list"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <ListSet />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="how-to-use"
                  element={
                    <Use />
                  }
                />
                <Route
                  path="setting-record-voice"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <AudioSettings />
                    </PrivateRoute>
                  }
                />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route
                  path="leaderboard/trophy"
                  element={
                    <Trophy />
                  }
                />
                <Route path="rules" element={<Rules />} />
                <Route
                  path="user/listone/:set_number"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <ListScript />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="user/history/:set_number?"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated} userRole={user?.role} allowedRoles={["user", "admin"]}>
                      <History />
                    </PrivateRoute>
                  }
                />
                <Route path="condition" element={<Condition />} />
              </Routes>
            </AudioProvider>
          </UserLayout>
        }
      />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;