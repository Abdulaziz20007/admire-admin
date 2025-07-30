"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, handleApiError } from "@/services/api";
import { toast } from "sonner";

interface Version {
  id: number;
  header_img?: string;
  header_h1_en?: string;
  about_p1_en?: string;
  total_students?: number;
  total_teachers?: number;
  best_students?: number;
  visits?: number;
  address_en?: string;
  work_time?: string;
  email?: string;
  is_active?: boolean;
  main_phone?: { id: number; phone: string };
}

const VersionsPage = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activate version handler
  const handleActivate = async (id: number) => {
    const res = await api.web.setActive(id);
    if (res.error) {
      toast.error(handleApiError(res));
      return;
    }
    // Update local state: set this version active and others inactive
    setVersions((prev) => prev.map((v) => ({ ...v, is_active: v.id === id })));
    toast.success(`Version ${id} activated`);
  };

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const res = await api.web.getAll();
        if (res.error) {
          setError(handleApiError(res));
        } else {
          // Ensure the response is an array of Version objects
          setVersions(Array.isArray(res.data) ? (res.data as Version[]) : []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch versions");
        toast.error("Failed to fetch versions");
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  // Function to generate particles (similar to dashboard page)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2 text-white">
            Website Versions
          </h1>
          <p className="text-white/80 max-w-lg">
            Manage and review different versions of your learning center
            website.
          </p>
        </div>
      </div>

      {/* Version Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {versions.map((version) => (
          <div
            key={version.id}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300"
          >
            {/* Background glow effect */}
            <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-700"></div>

            <div className="relative z-10">
              {/* Version status indicator */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Version {version.id}
                </h2>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    version.is_active
                      ? "bg-green-900/30 text-green-400 border-green-500/30"
                      : "bg-amber-900/30 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {version.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Header image */}
              <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={version.header_img || "/logo.svg"}
                  alt="Website Header"
                  fill
                  style={{ objectFit: "cover" }}
                  className="hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Version details */}
              <h3 className="text-white font-semibold mb-2">
                {version.header_h1_en}
              </h3>
              <p className="text-white/70 text-sm mb-4">
                {version.about_p1_en}
              </p>

              {/* Stats and info */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/50 text-xs">Students</p>
                  <p className="text-white font-bold">
                    {version.total_students}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/50 text-xs">Teachers</p>
                  <p className="text-white font-bold">
                    {version.total_teachers}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/50 text-xs">Best Students</p>
                  <p className="text-white font-bold">
                    {version.best_students}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center hidden md:block">
                  <p className="text-white/50 text-xs">Visits</p>
                  <p className="text-white font-bold">{version.visits ?? 0}</p>
                </div>
              </div>
              {/* Visits on small screens */}
              <div className="md:hidden mb-4 bg-white/10 rounded-lg p-3 text-center">
                <p className="text-white/50 text-xs">Visits</p>
                <p className="text-white font-bold">{version.visits ?? 0}</p>
              </div>

              {/* Contact info */}
              <div className="text-sm text-white/70 space-y-1 mb-4">
                <p>📍 {version.address_en}</p>
                <p>📞 {version.main_phone?.phone}</p>
                <p>📧 {version.email}</p>
                <p>⏰ {version.work_time}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  href={`/dashboard/versions/${version.id}/edit`}
                  className="flex-1 px-4 py-2 text-sm bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 text-center"
                >
                  Edit
                </Link>
                {version.is_active ? (
                  <span className="flex-1 px-4 py-2 text-sm text-green-400 border border-green-500/30 rounded-lg text-center cursor-default">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivate(version.id)}
                    className="flex-1 px-4 py-2 text-sm text-green-400 hover:text-white transition-colors border border-green-500/30 rounded-lg hover:bg-green-500/20"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add new version card */}
        <Link
          href="/dashboard/versions/new"
          className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px]"
        >
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
              Add New Version
            </h3>
            <p className="text-white/70">Create a new website version</p>
          </div>
        </Link>
        {/* End Add new version card */}
      </div>
    </div>
  );
};

export default VersionsPage;
