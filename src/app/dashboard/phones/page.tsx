"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { isSuperAdmin } from "@/utils/auth";
import { useAuthStore } from "@/stores/authStore";

interface Phone {
  id: number;
  phone: string;
}

const PhonesPage = () => {
  const token = useAuthStore((s) => s.token);
  const canManage = isSuperAdmin(token);

  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchPhones = async () => {
      setLoading(true);
      const res = await api.phone.getAll();
      if (res.error) setError(handleApiError(res));
      else setPhones(Array.isArray(res.data) ? (res.data as Phone[]) : []);
      setLoading(false);
    };

    fetchPhones();
  }, []);

  const displayedPhones = useMemo(() => {
    let list = [...phones];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.phone.toLowerCase().includes(q));
    }
    list.sort((a, b) =>
      sortOption === "asc"
        ? a.phone.localeCompare(b.phone)
        : b.phone.localeCompare(a.phone)
    );
    return list;
  }, [phones, search, sortOption]);

  const deletePhone = async (id: number) => {
    const res = await api.phone.delete(id);
    if (res.error) toast.error(handleApiError(res));
    else {
      setPhones((prev) => prev.filter((p) => p.id !== id));
      toast.success("Phone deleted");
    }
  };

  const confirmDeletePhone = (id: number) => {
    toast.custom((t) => (
      <div className="flex flex-col text-white">
        <p>Are you sure you want to delete this phone number?</p>
        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deletePhone(id);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="z-10 relative flex justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Phones</h1>
          <div className="flex gap-3 items-center ml-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "asc" | "desc")}
              className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
            >
              <option value="asc">Number ↑</option>
              <option value="desc">Number ↓</option>
            </select>
          </div>
          {canManage && (
            <Link
              href="/dashboard/phones/new"
              className="px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Phone
            </Link>
          )}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]" />
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {phones.length === 0 && (
            <p className="text-center text-white/70">No phone numbers found.</p>
          )}
          {displayedPhones.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm"
            >
              <span className="text-white font-medium">{p.phone}</span>
              {canManage && (
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/phones/${p.id}/edit`}
                    className="px-3 py-1 text-sm rounded-lg border border-white/20 text-white/70 hover:bg-white/10"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDeletePhone(p.id)}
                    className="px-3 py-1 text-sm text-red-400 hover:text-white transition-colors border border-red-500/30 rounded-lg hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhonesPage;
