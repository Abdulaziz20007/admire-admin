"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

const metricKeys = [
  "overall",
  "listening",
  "reading",
  "writing",
  "speaking",
  "experience",
  "students",
] as const;

type MetricKey = (typeof metricKeys)[number];

const NewTeacherPage = () => {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // restrict non-super-admins
  useEffect(() => {
    if (!isSuperAdmin(token)) router.replace("/dashboard/teachers");
  }, [token, router]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    about_en: "",
    about_uz: "",
    quote_en: "",
    quote_uz: "",
    cefr: "",
    overall: 0,
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    experience: 0,
    students: 0,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (metricKeys as readonly string[]).includes(name)
        ? Number(value)
        : value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      if (avatarFile) fd.append("image", avatarFile);
      const res = await api.teacher.create(fd);
      if (res.error) toast.error(handleApiError(res));
      else {
        toast.success("Teacher created");
        router.push("/dashboard/teachers");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="z-10 relative flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Add New Teacher</h1>
          <Link
            href="/dashboard/teachers"
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
            {/* avatar */}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm text-white/80 mb-1"
                  htmlFor="about_en"
                >
                  About (EN)
                </label>
                <textarea
                  id="about_en"
                  name="about_en"
                  rows={3}
                  value={formData.about_en}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-white/80 mb-1"
                  htmlFor="about_uz"
                >
                  About (UZ)
                </label>
                <textarea
                  id="about_uz"
                  name="about_uz"
                  rows={3}
                  value={formData.about_uz}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-white/80 mb-1"
                  htmlFor="quote_en"
                >
                  Quote (EN)
                </label>
                <input
                  id="quote_en"
                  name="quote_en"
                  value={formData.quote_en}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-white/80 mb-1"
                  htmlFor="quote_uz"
                >
                  Quote (UZ)
                </label>
                <input
                  id="quote_uz"
                  name="quote_uz"
                  value={formData.quote_uz}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                />
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
                />
              </div>

              {/* metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metricKeys.map((m) => (
                  <div key={m}>
                    <label
                      className="block text-xs text-white/60 mb-1 capitalize"
                      htmlFor={m}
                    >
                      {m}
                    </label>
                    <input
                      id={m}
                      name={m}
                      type="number"
                      value={formData[m as MetricKey] as number}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-4 mt-6">
            <button
              disabled={loading}
              className="px-6 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTeacherPage;
