"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Load initial collapsed state from localStorage (default false)
  const [collapsed, setCollapsed] = useState(false);

  // On mount, read stored value if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  // Persist whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  }, [collapsed]);

  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  // Function to generate particles
  useEffect(() => {
    const createParticles = () => {
      const particleContainer = document.getElementById("particles");
      if (!particleContainer) return;

      particleContainer.innerHTML = "";
      const particleCount = 70;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-full opacity-0";

        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random animation duration between 10s and 30s
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s infinite ease-in-out`;

        // Random delay
        particle.style.animationDelay = `${Math.random() * 5}s`;

        // Random opacity between 0.1 and 0.5
        particle.style.opacity = `${Math.random() * 0.4 + 0.1}`;

        // Add to container
        particleContainer.appendChild(particle);
      }
    };

    createParticles();

    // Recreate particles on window resize
    window.addEventListener("resize", createParticles);
    return () => window.removeEventListener("resize", createParticles);
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Animated particles background */}
      <div
        id="particles"
        className="absolute inset-0 z-0 pointer-events-none"
      ></div>

      {/* Animated glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Content layout */}
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      {/* Toggle Button outside sidebar */}
      <button
        onClick={handleToggleSidebar}
        className="absolute bottom-4 transition-all duration-300 z-20 w-6 h-10 rounded-l-none rounded-r-full bg-gradient-to-r from-[#4f9bff]/90 to-[#3b82f6]/90 backdrop-blur-sm hover:from-[#4f9bff] hover:to-[#3b82f6] text-white/90 hover:text-white flex items-center justify-center shadow-lg border-r border-t border-b border-white/20 group overflow-hidden"
        style={{ left: collapsed ? "5rem" : "16rem" }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#4f9bff]/20 rounded-r-full group-hover:bg-[#4f9bff]/30 transition-all duration-500"></div>

        {/* Arrow icon with animation */}
        <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110">
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>

      <div className="flex flex-col flex-grow overflow-hidden relative z-10">
        <Header />
        <main className="p-6 overflow-y-auto bg-color-surface/30 rounded-tl-3xl m-2 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
