"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

// Interface for admin data
interface Admin {
  id: number;
  name: string;
  surname: string;
  username: string;
  avatar?: string;
}

const AdminsPage = () => {
  const token = useAuthStore((s) => s.token);
  const canManage = isSuperAdmin(token);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<"nameAsc" | "nameDesc">(
    "nameAsc"
  );

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

  // Fetch admins data
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await api.admin.getAll();

        if (response.error) {
          setError(handleApiError(response));
        } else {
          setAdmins(
            Array.isArray(response.data) ? (response.data as Admin[]) : []
          );
        }
      } catch (err) {
        setError("Failed to fetch admins data");
        console.error("Error fetching admins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const displayedAdmins = useMemo(() => {
    let list = [...admins];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          `${a.name} ${a.surname}`.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) =>
      sortOption === "nameAsc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    return list;
  }, [admins, search, sortOption]);

  // Actually perform deletion (no confirmations here)
  const deleteAdmin = async (id: number) => {
    try {
      const response = await api.admin.delete(id);

      if (response.error) {
        toast.error(handleApiError(response));
      } else {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        toast.success("Admin deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete admin");
      console.error("Error deleting admin:", err);
    }
  };

  // Show sonner confirmation toast
  const confirmDeleteAdmin = (id: number) => {
    if (id === 1) {
      toast.error("Cannot delete the primary admin account.");
      return;
    }

    toast.custom(
      (t) => (
        <div className="flex flex-col text-white">
          <p>Are you sure you want to delete this admin?</p>
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteAdmin(id);
                toast.dismiss(t);
              }}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  return (
    <div className="space-y-8">
      {/* Particles container for background effect */}
      <div
        id="particles"
        className="fixed inset-0 pointer-events-none z-0"
      ></div>

      {/* Header Section */}
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="z-10 relative">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold mb-2 text-white">
              Admins Management
            </h1>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
              />
              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value as "nameAsc" | "nameDesc")
                }
                className="px-2 py-1 rounded border border-white/20 bg-[#17233f] text-white text-sm focus:outline-none"
              >
                <option value="nameAsc">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
              </select>
            </div>
            {canManage && (
              <Link
                href="/dashboard/admins/new"
                className="px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 text-center flex items-center"
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
                Add Admin
              </Link>
            )}
          </div>
          <p className="text-white/80 max-w-lg">
            Manage administrator accounts for your learning center dashboard.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Admins List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAdmins.map((admin) => (
            <div
              key={admin.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300"
            >
              {/* Background glow effect */}
              <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-700"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Admin avatar */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4 border-2 border-white/20">
                  {admin.avatar ? (
                    <Image
                      src={admin.avatar}
                      alt={`${admin.name} ${admin.surname}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#4f9bff]/30 flex items-center justify-center text-white text-2xl font-bold">
                      {admin.name[0]}
                      {admin.surname[0]}
                    </div>
                  )}
                </div>

                {/* Admin info */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {admin.name} {admin.surname}
                </h3>
                <p className="text-white/70 text-sm mb-4">@{admin.username}</p>

                {/* Action buttons */}
                {canManage && (
                  <div className="flex gap-3 mt-4 w-full">
                    <Link
                      href={`/dashboard/admins/${admin.id}/edit`}
                      className="flex-1 px-4 py-2 text-sm bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 text-center flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </Link>
                    {admin.id !== 1 ? (
                      <button
                        onClick={() => confirmDeleteAdmin(admin.id)}
                        className="flex-1 px-4 py-2 text-sm text-red-400 hover:text-white transition-colors border border-red-500/30 rounded-lg hover:bg-red-500/20 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Delete
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 text-sm text-gray-500 cursor-not-allowed border border-gray-600/30 rounded-lg bg-gray-700/20 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {canManage && (
            <Link href="/dashboard/admins/new">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px]">
                {/* Background glow effect */}
                <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

                <div className="relative z-10">
                  <div className="mb-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#4f9bff]/20 transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[#4f9bff]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Add New Admin
                  </h3>
                  <p className="text-white/70">
                    Create a new administrator account
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
