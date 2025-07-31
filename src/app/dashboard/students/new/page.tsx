"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

const NewStudentPage = () => {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin(token)) router.replace("/dashboard/students");
  }, [token, router]);

  const [loading, setLoading] = useState(false);

  const metricKeys = [
    "overall",
    "listening",
    "reading",
    "writing",
    "speaking",
  ] as const;
  type MetricKey = (typeof metricKeys)[number];

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    cefr: "",
    review_uz: "",
    review_en: "",
    overall: 0,
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: metricKeys.includes(name as MetricKey) ? Number(value) : value,
    }));
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCertificatePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      if (avatarFile) fd.append("image", avatarFile);
      if (certificateFile) fd.append("certificate_image", certificateFile);
      const res = await api.student.create(fd);
      if (res.error) toast.error(handleApiError(res));
      else {
        toast.success("Student created");
        router.push("/dashboard/students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="z-10 relative flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Add New Student</h1>
          <Link
            href="/dashboard/students"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
        <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4 min-w-[200px]">
              <div className="relative h-40 w-40 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden group">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="avatar"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="text-white/50">Upload image</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm text-white/80 mb-1"
                    htmlFor="name"
                  >
                    First Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm text-white/80 mb-1"
                    htmlFor="surname"
                  >
                    Surname
                  </label>
                  <input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm text-white/80 mb-1"
                  htmlFor="cefr"
                >
                  CEFR
                </label>
                <input
                  id="cefr"
                  name="cefr"
                  value={formData.cefr}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metricKeys.map((metric) => (
                  <div key={metric}>
                    <label
                      className="block text-xs text-white/60 mb-1 capitalize"
                      htmlFor={metric}
                    >
                      {metric}
                    </label>
                    <input
                      id={metric}
                      name={metric}
                      type="number"
                      value={formData[metric as MetricKey] as number}
                      onChange={handleChange}
                      className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm text-white/80 mb-1"
                    htmlFor="review_uz"
                  >
                    Review (UZ)
                  </label>
                  <textarea
                    id="review_uz"
                    name="review_uz"
                    rows={2}
                    value={formData.review_uz}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm text-white/80 mb-1"
                    htmlFor="review_en"
                  >
                    Review (EN)
                  </label>
                  <textarea
                    id="review_en"
                    name="review_en"
                    rows={2}
                    value={formData.review_en}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>

              {/* Certificate image upload */}
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Certificate Image *
                </label>
                <div className="relative h-40 w-full md:w-60 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center overflow-hidden group">
                  {certificatePreview ? (
                    <Image
                      src={certificatePreview}
                      alt="certificate"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className="text-white/50">Upload certificate</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertificate}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-4 mt-6">
            <button
              disabled={loading}
              className="px-6 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStudentPage;
