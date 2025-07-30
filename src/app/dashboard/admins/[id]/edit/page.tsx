"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

interface Admin {
  id: number;
  name: string;
  surname: string;
  username: string;
  avatar?: string;
}

const EditAdminPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // Redirect if not super admin
  React.useEffect(() => {
    if (!isSuperAdmin(token)) {
      router.replace("/dashboard/admins");
    }
  }, [token, router]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
  });

  // State for password change form
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
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

  // Fetch admin data on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      setLoadingData(true);
      try {
        const response = await api.admin.getById(params.id as string);

        if (response.error) {
          setError(handleApiError(response));
          setLoadingData(false);
          return;
        }

        const adminData = response.data as Admin;
        setAdmin(adminData);
        setFormData({
          name: adminData.name,
          surname: adminData.surname,
          username: adminData.username,
        });

        if (adminData.avatar) {
          setAvatarPreview(adminData.avatar);
        }

        setLoadingData(false);
      } catch (err) {
        console.error("Error fetching admin:", err);
        setError("Failed to load admin data");
        setLoadingData(false);
      }
    };

    if (params.id) {
      fetchAdmin();
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("surname", formData.surname);
      formDataToSend.append("username", formData.username);

      // Password cannot be updated here

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await api.admin.update(
        params.id as string,
        formDataToSend
      );

      if (response.error) {
        toast.error(handleApiError(response));
      } else {
        toast.success("Admin updated successfully");
        router.push("/dashboard/admins");
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Failed to update admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p>{error}</p>
        <Link
          href="/dashboard/admins"
          className="inline-block mt-4 px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors"
        >
          Back to Admins
        </Link>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Admin Not Found</h3>
        <p>The requested admin could not be found.</p>
        <Link
          href="/dashboard/admins"
          className="inline-block mt-4 px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors"
        >
          Back to Admins
        </Link>
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-2 text-white">
              Edit Admin: {admin.name} {admin.surname}
            </h1>
            <Link
              href="/dashboard/admins"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors shadow-lg border border-white/10 text-center flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Admins
            </Link>
          </div>
          <p className="text-white/80 max-w-lg">
            Update administrator account information.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
        <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar upload section */}
              <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                <div className="relative h-40 w-40 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden group">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="text-white/50 text-center p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto mb-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm">Upload avatar</p>
                    </div>
                  )}

                  <input
                    type="file"
                    name="avatar"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-white/50">
                  Click to upload or drag and drop
                  <br />
                  JPG, PNG or GIF (max. 2MB)
                </p>
              </div>

              {/* Form fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white/80 mb-1"
                    >
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9bff]/50 focus:border-[#4f9bff] transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="surname"
                      className="block text-sm font-medium text-white/80 mb-1"
                    >
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      required
                      value={formData.surname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9bff]/50 focus:border-[#4f9bff] transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9bff]/50 focus:border-[#4f9bff] transition-all"
                    placeholder="Enter username"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    This will be used for login. Must be unique.
                  </p>
                </div>

                {/* Password is managed in separate section */}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10 mt-8">
              <Link
                href="/dashboard/admins"
                className="px-6 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors mr-4"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
        <div className="absolute top-0 -right-16 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Change Password
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!passwordData.newPassword) {
                toast.error("New password cannot be empty.");
                return;
              }
              setPasswordLoading(true);
              try {
                const res = await api.admin.changePassword({
                  admin_id: admin!.id,
                  old_password: passwordData.oldPassword,
                  new_password: passwordData.newPassword,
                });
                if (res.error) {
                  toast.error(handleApiError(res));
                } else {
                  toast.success("Password updated successfully");
                  setPasswordData({ oldPassword: "", newPassword: "" });
                }
              } catch (err) {
                console.error(err);
                toast.error("Failed to change password. Please try again.");
              } finally {
                setPasswordLoading(false);
              }
            }}
            className="flex flex-col md:flex-row flex-wrap items-end gap-4"
          >
            <div className="flex flex-col">
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                required
                value={passwordData.oldPassword}
                onChange={handlePasswordInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50 focus:border-[#ec4899] transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50 focus:border-[#ec4899] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="self-end px-6 py-2 bg-[#ec4899] hover:bg-[#db2777] text-white rounded-lg transition-colors shadow-lg shadow-[#ec4899]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mt-6 md:mt-0"
            >
              {passwordLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAdminPage;
