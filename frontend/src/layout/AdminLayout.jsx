import React from "react";
import HeaderAdmin from "../component/admin/navbar_admin";
import SlidebarAdmin from "../component/admin/slidebar_admin";

const AdminLayout = ({ children }) => {
    return (
      <div className="min-h-screen flex flex-col"> {/* เพิ่ม wrapper */}
      <HeaderAdmin />
      <div className="flex flex-1"> {/* ใช้ flex-1 แทน h-screen */}
        <SlidebarAdmin />
        <main className="flex-1">{children}</main>
      </div>
    </div>
    );
  };
export default AdminLayout;