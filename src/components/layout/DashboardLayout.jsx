import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import FloatingNavButtons from "../ui/misc/FloatingNavButtons";

function DashboardLayout({ menuItems }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = menuItems.find((item) =>
    location.pathname.endsWith(item.path),
  )?.label;

  return (
    <section className="flex flex-col md:flex-row">
      <FloatingNavButtons />

      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-2xl p-1 hover:bg-gray-100 rounded"
          >
            {isMobileOpen ? "❌" : "🍔"}
          </button>
          <h1 className="font-bold text-lg">{activeTab}</h1>
        </div>
      </div>

      <aside
        className={`shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-300 transition-all duration-300 ease-in-out overflow-hidden
            
            /* Desktop Styles */
            md:sticky md:top-0 md:h-screen
            ${isCollapsed ? "md:w-20" : "md:w-48 lg:w-64"}

            /* Mobile Styles (Accordion effect) */
            ${isMobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 md:max-h-screen md:opacity-100"}`}
      >
        <div className="p-2">
          {/* Desktop Collapse Toggle */}
          <div className="hidden md:block mb-2 text-right border-b border-gray-300">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-xl"
            >
              {isCollapsed ? "➡️" : "⬅️"}
            </button>
          </div>

          <nav className="mt-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);
                }}
                className={`mb-2 px-3 py-2 w-full text-lg rounded-xl flex items-center 
                                    ${isCollapsed ? "justify-center" : ""} gap-4 transition-colors whitespace-nowrap
                                    ${activeTab === item.label ? "text-violet-500 font-semibold bg-blue-100" : "text-gray-500 hover:bg-blue-50"}`}
              >
                <span className="text-2xl">{item.icon}</span>
                {/* Hide label only on Desktop when collapsed */}
                <span className={`${isCollapsed ? "md:hidden" : "block"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="w-full min-w-0 p-4">
        <Outlet />
      </div>
    </section>
  );
}

export default DashboardLayout;
