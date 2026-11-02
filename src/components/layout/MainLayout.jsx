import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 relative">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <div className="flex-shrink-0 z-30">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-3 sm:p-5 md:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;