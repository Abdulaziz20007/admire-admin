"use client";

import React, { useState, useEffect } from "react";
import { api, handleApiError } from "@/services/api";
import { toast } from "sonner";

// Valid periods for charts
type Period = "weekly" | "monthly" | "yearly";

// Message shape
interface Message {
  id: number | string;
  name?: string;
  message?: string;
  created_at?: string;
}

const DashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentCount, setStudentCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [chartData, setChartData] = useState<Record<Period, number[]>>({
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0, 0, 0, 0],
    yearly: [0, 0, 0, 0, 0, 0, 0],
  });
  const [recentActivities, setRecentActivities] = useState<
    {
      id: number | string;
      user: string;
      action: string;
      time: string;
      avatar: string;
      color: string;
    }[]
  >([]);

  // Function to generate particles (similar to login page)
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

    // Clock update
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Recreate particles on window resize
    window.addEventListener("resize", createParticles);
    return () => {
      window.removeEventListener("resize", createParticles);
      clearInterval(clockTimer);
    };
  }, []);

  // Fetch real data for dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, messagesRes] = await Promise.all([
          api.student.getAll(),
          api.message.getAll(),
        ]);

        const students = studentsRes.data || [];
        const messages = messagesRes.data || [];

        setStudentCount(students.length);
        setMessageCount(messages.length);

        // Very simple chart data derived from student count (placeholder until dedicated stats endpoint exists)
        const weekly = new Array(7).fill(Math.ceil(students.length / 7));
        const monthly = new Array(7).fill(Math.ceil(students.length / 30) * 4);
        const yearly = new Array(7).fill(Math.ceil(students.length / 365) * 30);
        setChartData({ weekly, monthly, yearly });

        const colors = [
          "bg-blue-500",
          "bg-purple-500",
          "bg-green-500",
          "bg-amber-500",
        ];

        setRecentActivities(
          (messages as Message[]).slice(0, 4).map((m, idx) => {
            const name: string = m.name || "Unknown";
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return {
              id: m.id,
              user: name,
              action: (m.message || "Sent a message").substring(0, 60),
              time: new Date(m.created_at || Date.now()).toLocaleDateString(),
              avatar: initials,
              color: colors[idx % colors.length],
            };
          })
        );
      } catch (err) {
        console.error(err);
        toast.error(handleApiError(err));
      }
    };

    fetchDashboardData();
  }, []);

  // Format the time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="z-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">
                Admire Learning Center
              </h1>
              <p className="text-white/80 max-w-lg">
                Track your learning center metrics and manage content with ease.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {formatTime(currentTime)}
              </div>
              <div className="text-white/80">{formatDate(currentTime)}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center gap-4 transition-all duration-500 hover:bg-white/20">
              <div className="p-3 bg-white/10 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/30 animate-pulse"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white relative z-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/70">Total Messages</p>
                <h3 className="text-2xl font-bold text-white">
                  {messageCount}
                </h3>
                <p className="text-xs text-green-300 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {messageCount} messages in total
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center gap-4 transition-all duration-500 hover:bg-white/20">
              <div className="p-3 bg-white/10 rounded-lg relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-purple-500/30 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white relative z-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/70">Total Students</p>
                <h3 className="text-2xl font-bold text-white">
                  {studentCount}
                </h3>
                <p className="text-xs text-green-300 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  +7.2% new enrollments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 - Students */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-700"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/30 animate-pulse"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-100 relative z-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-300 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
              +12%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white/90">
            Active Students
          </h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">{studentCount}</p>
            <span className="text-sm text-white/70 mb-1">students</span>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full relative"
              style={{ width: "75%" }}
            >
              <div className="absolute inset-0 bg-blue-300/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Card 2 - Course Sales */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 -right-16 w-32 h-32 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-700"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/30 animate-pulse"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-100 relative z-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-300 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
              +24%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white/90">Course Sales</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">$56,789</p>
            <span className="text-sm text-white/70 mb-1">this month</span>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full relative"
              style={{ width: "85%" }}
            >
              <div className="absolute inset-0 bg-green-300/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Card 3 - Course Enrollments */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 -right-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-700"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/30 animate-pulse"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-100 relative z-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-300 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
              +18%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white/90">
            New Enrollments
          </h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">345</p>
            <span className="text-sm text-white/70 mb-1">this month</span>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full relative"
              style={{ width: "65%" }}
            >
              <div className="absolute inset-0 bg-purple-300/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Card 4 - Pending Tasks */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-700"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/30 animate-pulse"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-100 relative z-10"
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
            </div>
            <span className="text-xs font-medium text-red-300 bg-red-900/30 px-2 py-1 rounded-full border border-red-500/20">
              -3%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white/90">Pending Tasks</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">12</p>
            <span className="text-sm text-white/70 mb-1">tasks</span>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full relative"
              style={{ width: "25%" }}
            >
              <div className="absolute inset-0 bg-amber-300/30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="flex flex-wrap items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setSelectedPeriod("weekly")}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  selectedPeriod === "weekly"
                    ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedPeriod("monthly")}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  selectedPeriod === "monthly"
                    ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPeriod("yearly")}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  selectedPeriod === "yearly"
                    ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full relative z-10">
            <div className="flex h-full items-end">
              {chartData[selectedPeriod].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full max-w-[50px] bg-[#4f9bff]/10 hover:bg-[#4f9bff]/20 rounded-t-md transition-all relative group"
                    style={{
                      height: `${
                        (value / Math.max(...chartData[selectedPeriod])) * 100
                      }%`,
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#4f9bff] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg shadow-[#4f9bff]/30">
                      {selectedPeriod === "weekly"
                        ? `$${value}K`
                        : selectedPeriod === "monthly"
                        ? `$${value}K`
                        : `$${value}K`}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#4f9bff] rounded-t-md"></div>
                  </div>
                  <span className="text-xs text-white/70 mt-2">
                    {selectedPeriod === "weekly"
                      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]
                      : selectedPeriod === "monthly"
                      ? [
                          "Week 1",
                          "Week 2",
                          "Week 3",
                          "Week 4",
                          "Week 5",
                          "Week 6",
                          "Week 7",
                        ][index]
                      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
                          index
                        ]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>

          <h2 className="text-xl font-bold text-white mb-6 relative z-10">
            Recent Activities
          </h2>
          <div className="space-y-6 relative z-10">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
              >
                <div
                  className={`${activity.color} h-10 w-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <span className="relative z-10">{activity.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white group-hover:text-[#4f9bff] transition-colors">
                    {activity.user}
                  </p>
                  <p className="text-white/70 text-sm truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-white/50 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-[#4f9bff] hover:text-white transition-colors relative z-10 border border-[#4f9bff]/30 rounded-lg hover:bg-[#4f9bff]/20">
            View All Activities
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white">Recent Enrollments</h2>
          <button className="px-4 py-2 text-sm bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30">
            View All
          </button>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  #ENR-7895
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  John Doe
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  May 15, 2023
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  $125.00
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full border border-green-500/30">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  #ENR-7894
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  Sarah Smith
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  May 14, 2023
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  $243.00
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-400 rounded-full border border-blue-500/30">
                    Processing
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  #ENR-7893
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  Mike Johnson
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  May 14, 2023
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  $350.00
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-amber-900/30 text-amber-400 rounded-full border border-amber-500/30">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  #ENR-7892
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  Emily Wilson
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  May 13, 2023
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                  $534.00
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-red-900/30 text-red-400 rounded-full border border-red-500/30">
                    Cancelled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
