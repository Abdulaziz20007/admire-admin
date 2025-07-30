"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

// Interface for icon data
interface Icon {
  id: number;
  name: string;
  url: string;
}

const IconsPage = () => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch icons data
  useEffect(() => {
    const fetchIcons = async () => {
      setLoading(true);
      try {
        const response = await api.icon.getAll();

        if (response.error) {
          setError(handleApiError(response));
        } else {
          setIcons(response.data || []);
        }
      } catch (err) {
        setError("Failed to fetch icons data");
        console.error("Error fetching icons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, []);

  const deleteIcon = async (id: number) => {
    try {
      const response = await api.icon.delete(id);

      if (response.error) {
        toast.error(handleApiError(response));
      } else {
        setIcons((prev) => prev.filter((i) => i.id !== id));
        toast.success("Icon deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete icon");
      console.error("Error deleting icon:", err);
    }
  };

  const confirmDeleteIcon = (id: number) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col text-white">
          <p>Are you sure you want to delete this icon?</p>
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteIcon(id);
                toast.dismiss(t.id);
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-2 text-white">
              Icons Management
            </h1>
            <Link
              href="/dashboard/icons/new"
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
              Add Icon
            </Link>
          </div>
          <p className="text-white/80 max-w-lg">
            Manage icons for your learning center website. Icons can be used for
            social media links and other areas of the site.
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

      {/* Icons List */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {icons.map((icon) => (
            <div
              key={icon.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-4 group hover:scale-[1.02] transition-all duration-300"
            >
              {/* Background glow effect */}
              <div className="absolute top-0 -right-16 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Icon preview */}
                <div className="relative h-24 w-24 mb-4 flex items-center justify-center bg-white/5 rounded-lg p-4 overflow-hidden">
                  <Image
                    src={icon.url}
                    alt={icon.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>

                {/* Icon info */}
                <h3
                  className="text-base font-medium text-white mb-4 text-center line-clamp-1"
                  title={icon.name}
                >
                  {icon.name}
                </h3>

                {/* Action buttons */}
                <div className="flex gap-2 w-full">
                  <Link
                    href={`/dashboard/icons/${icon.id}/edit`}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 text-center flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDeleteIcon(icon.id)}
                    className="flex-1 px-3 py-1.5 text-xs text-red-400 hover:text-white transition-colors border border-red-500/30 rounded-lg hover:bg-red-500/20 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1"
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
                </div>
              </div>
            </div>
          ))}

          {/* Add new icon card */}
          <Link href="/dashboard/icons/new">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 group hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer h-full min-h-[220px]">
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
                  Add New Icon
                </h3>
                <p className="text-white/70">Upload a new icon</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default IconsPage;
