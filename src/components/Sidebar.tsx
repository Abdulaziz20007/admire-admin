"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clearToken);

  // Reference onToggle to avoid ESLint unused-vars error
  React.useEffect(() => {}, [onToggle]);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore error
    } finally {
      clearToken();
      router.push("/login");
    }
  };

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // For the main dashboard link we only want to match the exact path, not its sub-routes
    if (path === "/dashboard") {
      return pathname === path; // Only active on the exact dashboard root
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={`${sidebarWidth} h-screen ${
        collapsed ? "py-6 px-2" : "p-6"
      } text-white bg-[#0f1a35]/90 backdrop-blur-sm border-r border-white/10 relative overflow-hidden flex-shrink-0 transition-all duration-300`}
    >
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#4f9bff]/5 rounded-full blur-[100px] animate-pulse"></div>

      <div className="flex items-center mb-10 relative z-10 justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#4f9bff]/30 rounded-full animate-ping opacity-75"></div>
          <Image
            src="/logo.svg"
            alt="Admire Admin Logo"
            width={40}
            height={40}
            className="relative z-10"
          />
        </div>
        {!collapsed && (
          <h2 className="ml-4 text-2xl font-bold text-white whitespace-nowrap transition-opacity duration-300">
            Admire
          </h2>
        )}
      </div>

      <nav className="relative z-10">
        {!collapsed && (
          <h3 className="text-xs uppercase text-white/50 mb-4 font-semibold tracking-wider">
            Navigation
          </h3>
        )}
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard") &&
                !isActive("/dashboard/versions") &&
                !isActive("/dashboard/settings")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {!collapsed && <span className="truncate">Dashboard</span>}
            </Link>
          </li>

          {/* Website */}
          <li>
            <Link
              href="/dashboard/versions"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/versions")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && <span className="truncate">Versions</span>}
            </Link>
          </li>

          {/* Admins */}
          <li>
            <Link
              href="/dashboard/admins"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/admins")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              {!collapsed && <span className="truncate">Admins</span>}
            </Link>
          </li>

          {/* Content Management Section */}
          {!collapsed && (
            <h3 className="text-xs uppercase text-white/50 mt-8 mb-4 font-semibold tracking-wider">
              Content Management
            </h3>
          )}

          {/* Teachers */}
          <li>
            <Link
              href="/dashboard/teachers"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/teachers")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              {!collapsed && <span className="truncate">Teachers</span>}
            </Link>
          </li>

          {/* Students */}
          <li>
            <Link
              href="/dashboard/students"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/students")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {!collapsed && <span className="truncate">Students</span>}
            </Link>
          </li>

          {/* Media */}
          <li>
            <Link
              href="/dashboard/medias"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/medias")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && <span className="truncate">Media</span>}
            </Link>
          </li>

          {/* Icons */}
          <li>
            <Link
              href="/dashboard/icons"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/icons")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && <span className="truncate">Icons</span>}
            </Link>
          </li>

          {/* Communication Section */}
          {!collapsed && (
            <h3 className="text-xs uppercase text-white/50 mt-8 mb-4 font-semibold tracking-wider">
              Communication
            </h3>
          )}

          {/* Messages */}
          <li>
            <Link
              href="/dashboard/messages"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/messages")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {!collapsed && <span className="truncate">Messages</span>}
            </Link>
          </li>

          {/* Phones */}
          <li>
            <Link
              href="/dashboard/phones"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/phones")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {!collapsed && <span className="truncate">Phones</span>}
            </Link>
          </li>

          {/* Socials */}
          <li>
            <Link
              href="/dashboard/socials"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/dashboard/socials")
                  ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              {!collapsed && <span className="truncate">Socials</span>}
            </Link>
          </li>

          {/* Logout */}
          <li className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 rounded-lg transition-all text-red-400 hover:text-white hover:bg-red-500/20 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.5A1.5 1.5 0 014.5 3h5a1.5 1.5 0 010 3h-5A1.5 1.5 0 013 4.5zM3 10a1.5 1.5 0 011.5-1.5h5a1.5 1.5 0 010 3h-5A1.5 1.5 0 013 10zm1.5 4.5A1.5 1.5 0 003 16h5a1.5 1.5 0 000-3h-5zM12 7a1 1 0 011-1h4.293l-1.147-1.146a1 1 0 011.414-1.415l3 3a1 1 0 010 1.415l-3 3a1 1 0 01-1.414-1.415L17.293 9H13a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && <span className="truncate">Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
