import React from "react";
import HeaderUser from "../component/user/navbar_user";
import SlidebarUser from "../component/user/slidebar_user";

const UserLayout = ({ children }) => {
    return (
      <div className="min-h-screen flex flex-col"> {/* เพิ่ม wrapper */}
      <HeaderUser />
      <div className="flex flex-1"> {/* ใช้ flex-1 แทน h-screen */}
        <SlidebarUser />
        <main className="flex-1">{children}</main>
      </div>
    </div>
    );
  };
  
  export default UserLayout;
  