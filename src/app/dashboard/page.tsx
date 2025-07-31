"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { api, handleApiError } from "@/services/api";
import { toast } from "sonner";

// Valid periods for charts (kept for future use)
type Period = "weekly" | "monthly" | "yearly";

// Message shape
interface Message {
  id: number | string;
  name?: string;
  message?: string;
  created_at?: string;
  phone?: string;
  email?: string;
  is_checked?: number | boolean;
}

const DashboardPage = () => {
  // Dashboard stats
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [markingIds, setMarkingIds] = useState<(number | string)[]>([]);

  // Un-used for now (reserved for future charts / activities)
  const [_selectedPeriod, _setSelectedPeriod] = useState<Period>("weekly");
  const [_chartData, _setChartData] = useState<Record<Period, number[]>>({
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0, 0, 0, 0],
    yearly: [0, 0, 0, 0, 0, 0, 0],
  });
  const [_recentActivities, _setRecentActivities] = useState<
    {
      id: number | string;
      user: string;
      action: string;
      time: string;
      avatar: string;
      color: string;
    }[]
  >([]);

  // -----------------------------
  // Clock tick
  // -----------------------------
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // -----------------------------
  // Fetch stats data
  // -----------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, teachersRes, adminsRes, messagesRes] =
          await Promise.all([
            api.student.getAll(),
            api.teacher.getAll(),
            api.admin.getAll(),
            api.message.getAll(),
          ]);

        const students = (studentsRes.data || []) as any[];
        const teachers = (teachersRes.data || []) as any[];
        const admins = (adminsRes.data || []) as any[];
        const messages = (messagesRes.data || []) as any[];

        setStudentCount(students.length);
        setTeacherCount(teachers.length);
        setAdminCount(admins.length);
        setMessageCount(messages.length);
        // messages with is_checked falsy are considered new/unread

        const allMsgs = messages as Message[];
        // sort newest first
        allMsgs.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        setRecentMessages(allMsgs.slice(0, 10));
        setNewMessagesCount(allMsgs.filter((m) => !m.is_checked).length);

        // Placeholder chart data (kept for future visualisations)
        const weekly = new Array(7).fill(Math.ceil(students.length / 7));
        const monthly = new Array(7).fill(Math.ceil(students.length / 30) * 4);
        const yearly = new Array(7).fill(Math.ceil(students.length / 365) * 30);
        _setChartData({ weekly, monthly, yearly });

        const colors = [
          "bg-blue-500",
          "bg-purple-500",
          "bg-green-500",
          "bg-amber-500",
        ];
        _setRecentActivities(
          (messages as Message[]).slice(0, 4).map((m, idx) => {
            const name = m.name || "Unknown";
            const initials = name
              .split(" ")
              .map((n) => n[0])
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

  // Helpers
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date: Date) =>
    date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // -----------------------------
  // Mark message as read
  // -----------------------------
  const markAsRead = async (id: number | string) => {
    if (markingIds.includes(id)) return;
    setMarkingIds((prev) => [...prev, id]);
    try {
      const res = await api.message.setChecked(id, 1);
      if (res.error) {
        toast.error(handleApiError(res));
      } else {
        setRecentMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_checked: 1 } : m))
        );
        setNewMessagesCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setMarkingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
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

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-6 mt-6">
            {/* Messages */}
            <StatCard
              bgColor="blue"
              title="Total Messages"
              value={messageCount.toString()}
              footer={`${messageCount} messages in total`}
            />

            {/* Students */}
            <StatCard
              bgColor="purple"
              title="Total Students"
              value={studentCount.toString()}
              footer="+7.2% new enrollments"
            />

            {/* New Messages */}
            <StatCard
              bgColor="red"
              title="New Messages"
              value={newMessagesCount.toString()}
            />

            {/* Teachers */}
            <StatCard
              bgColor="green"
              title="Total Teachers"
              value={teacherCount.toString()}
            />

            {/* Admins */}
            <StatCard
              bgColor="amber"
              title="Total Admins"
              value={adminCount.toString()}
            />
          </div>
        </div>
      </div>

      {/* Messages & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unread Messages */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-6 relative z-10">
            New Messages
          </h2>
          {recentMessages.length === 0 ? (
            <p className="text-white/70">All caught up! 🎉</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-500/30 text-white flex items-center justify-center font-medium">
                    {(msg.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">
                      {msg.name || "Unknown"}
                    </p>
                    {msg.phone && (
                      <p className="text-white/70 text-sm">📞 {msg.phone}</p>
                    )}
                    {msg.email && (
                      <p className="text-white/70 text-sm truncate">
                        ✉️ {msg.email}
                      </p>
                    )}
                    <p className="text-white/70 text-sm truncate mt-1">
                      {msg.message || "(no content)"}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(
                        msg.created_at || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {msg.is_checked ? (
                    <span className="text-xs px-3 py-1 rounded bg-gray-700 text-white/70">
                      Read
                    </span>
                  ) : (
                    <button
                      disabled={markingIds.includes(msg.id)}
                      onClick={() => markAsRead(msg.id)}
                      className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                    >
                      {markingIds.includes(msg.id) ? "…" : "Mark as read"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Actions placeholder */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Actions</h2>
          <p className="text-white/70">Coming soon...</p>
        </div>
      </div>

      {/* Additional dashboard sections (charts, tables, etc.) can go here */}
    </div>
  );
};

export default DashboardPage;

// ------------------------------------------------------------------
// Small reusable stat-card component to avoid repetitive markup above
// ------------------------------------------------------------------
interface StatCardProps {
  bgColor: "blue" | "purple" | "green" | "amber" | "red";
  title: string;
  value: string;
  footer?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  bgColor,
  title,
  value,
  footer,
}) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center gap-4 transition-all duration-500 hover:bg-white/20">
      <div className="p-3 bg-white/10 rounded-lg relative overflow-hidden">
        <div
          className={`absolute inset-0 ${colorMap[bgColor]}/30 animate-pulse`}
        ></div>
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
        <p className="text-sm text-white/70">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        {footer && (
          <p className="text-xs text-green-300 flex items-center gap-1">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
};
