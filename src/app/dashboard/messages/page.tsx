"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

interface Message {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  is_checked?: number | boolean;
  created_at?: string;
}

const MessagesPage = () => {
  const token = useAuthStore((s) => s.token);
  const canManage = isSuperAdmin(token);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridView, setGridView] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<
    "dateDesc" | "dateAsc" | "readFirst" | "unreadFirst"
  >("dateDesc");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const res = await api.message.getAll();
      if (res.error) {
        setError(handleApiError(res));
      } else {
        setMessages(Array.isArray(res.data) ? (res.data as Message[]) : []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const toggleChecked = async (msg: Message) => {
    const newChecked = !(msg.is_checked as boolean);
    const res = await api.message.setChecked(msg.id, newChecked);
    if (res.error) {
      toast.error(handleApiError(res));
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, is_checked: newChecked ? 1 : 0 } : m
        )
      );
      toast.success(newChecked ? "Marked as read" : "Marked as unread");
    }
  };

  const deleteMessage = async (id: number) => {
    const res = await api.message.delete(id);
    if (res.error) toast.error(handleApiError(res));
    else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted");
    }
  };

  const confirmDeleteMessage = (id: number) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col text-white">
          <p>Are you sure you want to delete this message?</p>
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteMessage(id);
                toast.dismiss(t);
              }}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const displayedMessages = useMemo(() => {
    let list = [...messages];

    // Filter by status
    if (filterStatus === "read") {
      list = list.filter((m) => m.is_checked);
    } else if (filterStatus === "unread") {
      list = list.filter((m) => !m.is_checked);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false) ||
          (m.phone?.toLowerCase().includes(q) ?? false) ||
          m.message.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortOption === "readFirst") {
        return a.is_checked === b.is_checked ? 0 : a.is_checked ? -1 : 1;
      }
      if (sortOption === "unreadFirst") {
        return a.is_checked === b.is_checked ? 0 : a.is_checked ? 1 : -1;
      }
      const dateA = new Date(a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? 0).getTime();
      return sortOption === "dateDesc" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [messages, filterStatus, sortOption, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="z-10 relative flex justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "read" | "unread")
              }
              className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(
                  e.target.value as
                    | "dateDesc"
                    | "dateAsc"
                    | "readFirst"
                    | "unreadFirst"
                )
              }
              className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
            >
              <option value="dateDesc">Date: Newest</option>
              <option value="dateAsc">Date: Oldest</option>
              <option value="readFirst">Read First</option>
              <option value="unreadFirst">Unread First</option>
            </select>
            <button
              onClick={() => setGridView((p) => !p)}
              className="order-last p-2 rounded-lg border border-white/20 hover:bg-white/10 text-white/70"
              title={gridView ? "List view" : "Grid view"}
            >
              {gridView ? (
                /* list icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 5h12a1 1 0 100-2H4a1 1 0 100 2zM4 11h12a1 1 0 100-2H4a1 1 0 100 2zM4 17h12a1 1 0 100-2H4a1 1 0 100 2z" />
                </svg>
              ) : (
                /* grid icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V5a2 2 0 00-2-2H5zM12 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM5 12a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2H5zM12 14a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
                </svg>
              )}
            </button>
          </div>
          {/*removed legacy toggle
            className="p-2 rounded-lg border border-white/20 hover:bg-white/10 text-white/70"
            title={gridView ? "List view" : "Grid view"}
          >
            {gridView ? (
              // list icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 5h12a1 1 0 100-2H4a1 1 0 100 2zM4 11h12a1 1 0 100-2H4a1 1 0 100 2zM4 17h12a1 1 0 100-2H4a1 1 0 100 2z" />
              </svg>
            ) : (
              // grid icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V5a2 2 0 00-2-2H5zM12 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM5 12a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2H5zM12 14a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
              </svg>
            )}
          */}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          className={
            gridView
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {displayedMessages.length === 0 && (
            <p className="text-center text-white/70">No messages found.</p>
          )}
          {displayedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 transition-colors flex flex-col ${
                msg.is_checked ? "opacity-70" : ""
              } ${gridView ? "min-h-[220px]" : ""}`}
            >
              <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 space-y-2 flex flex-col h-full">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {msg.name} {msg.phone && ": " + msg.phone}
                  </h3>
                  {!gridView && (
                    <div className="flex gap-2">
                      {canManage && (
                        <button
                          onClick={() => toggleChecked(msg)}
                          className={`px-3 py-1 text-sm rounded-lg border ${
                            msg.is_checked
                              ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {msg.is_checked ? "Mark Unread" : "Mark Read"}
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={() => confirmDeleteMessage(msg.id)}
                          className="px-3 py-1 text-sm text-red-400 hover:text-white transition-colors border border-red-500/30 rounded-lg hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {msg.email && (
                  <p className="text-white/70 text-sm">Email: {msg.email}</p>
                )}
                {msg.created_at && (
                  <p className="text-white/50 text-xs">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                )}
                <p className="text-white mt-2 whitespace-pre-line flex-1">
                  {msg.message}
                </p>
                {gridView && (
                  <div className="mt-4 flex gap-2 justify-end">
                    {canManage && (
                      <button
                        onClick={() => toggleChecked(msg)}
                        className={`px-3 py-1 text-sm rounded-lg border ${
                          msg.is_checked
                            ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "border-green-500/30 text-green-400 hover:bg-green-500/20"
                        }`}
                      >
                        {msg.is_checked ? "Mark Unread" : "Mark Read"}
                      </button>
                    )}
                    {canManage && (
                      <button
                        onClick={() => confirmDeleteMessage(msg.id)}
                        className="px-3 py-1 text-sm text-red-400 hover:text-white transition-colors border border-red-500/30 rounded-lg hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
