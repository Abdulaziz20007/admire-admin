"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/utils/auth";

interface TeacherDto {
  id: number;
  name: string;
  surname: string;
  about_uz: string;
  about_en: string;
  quote_uz: string;
  quote_en: string;
  image?: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  cefr: string;
  experience: number;
  students: number;
}

const EditTeacherPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // Redirect non super-admins
  useEffect(() => {
    if (!isSuperAdmin(token)) {
      router.replace("/dashboard/teachers");
    }
  }, [token, router]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    about_uz: "",
    about_en: "",
    quote_uz: "",
    quote_en: "",
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
  const [error, setError] = useState<string | null>(null);

  // Fetch teacher
  useEffect(() => {
    const fetchTeacher = async () => {
      setLoadingData(true);
      const res = await api.teacher.getById(params.id as string);
      if (res.error) {
        setError(handleApiError(res));
        setLoadingData(false);
        return;
      }
      const t = res.data as TeacherDto;
      setFormData({
        name: t.name,
        surname: t.surname ?? "",
        about_uz: t.about_uz ?? "",
        about_en: t.about_en ?? "",
        quote_uz: t.quote_uz ?? "",
        quote_en: t.quote_en ?? "",
        cefr: t.cefr ?? "",
        overall: t.overall ?? 0,
        listening: t.listening ?? 0,
        reading: t.reading ?? 0,
        writing: t.writing ?? 0,
        speaking: t.speaking ?? 0,
        experience: t.experience ?? 0,
        students: t.students ?? 0,
      });
      if (t.image) setAvatarPreview(t.image);
      setLoadingData(false);
    };
    if (params.id) fetchTeacher();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      fd.append("name", formData.name);
      fd.append("surname", formData.surname);
      fd.append("about_uz", formData.about_uz);
      fd.append("about_en", formData.about_en);
      fd.append("quote_uz", formData.quote_uz);
      fd.append("quote_en", formData.quote_en);
      fd.append("cefr", formData.cefr);
      [
        "overall",
        "listening",
        "reading",
        "writing",
        "speaking",
        "experience",
        "students",
      ].forEach((k) => {
        fd.append(k, String(formData[k as keyof typeof formData]));
      });
      if (avatarFile) fd.append("image", avatarFile);
      const res = await api.teacher.update(params.id as string, fd);
      if (res.error) toast.error(handleApiError(res));
      else {
        toast.success("Teacher updated");
        router.push("/dashboard/teachers");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update teacher");
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
          href="/dashboard/teachers"
          className="inline-block mt-4 px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors"
        >
          Back to Teachers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="z-10 relative">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Edit Teacher</h1>
            <Link
              href="/dashboard/teachers"
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
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
        <div className="absolute top-0 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
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
                      <p className="text-sm">Upload image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-white/50 text-center">
                  Click to upload or drag and drop
                  <br /> JPG, PNG or GIF (max. 2MB)
                </p>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-white/80 mb-1"
                      htmlFor="name"
                    >
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9bff]/50 focus:border-[#4f9bff] transition-all"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-white/80 mb-1"
                      htmlFor="surname"
                    >
                      Last Name
                    </label>
                    <input
                      id="surname"
                      name="surname"
                      type="text"
                      value={formData.surname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9bff]/50 focus:border-[#4f9bff] transition-all"
                    />
                  </div>
                </div>

                {/* About EN */}
                <div>
                  <label
                    className="block text-sm font-medium text-white/80 mb-1"
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
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  ></textarea>
                </div>
                {/* About UZ */}
                <div>
                  <label
                    className="block text-sm font-medium text-white/80 mb-1"
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
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  ></textarea>
                </div>

                {/* Quotes */}
                <div>
                  <label
                    className="block text-sm font-medium text-white/80 mb-1"
                    htmlFor="quote_en"
                  >
                    Quote (EN)
                  </label>
                  <input
                    id="quote_en"
                    name="quote_en"
                    type="text"
                    value={formData.quote_en}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-white/80 mb-1"
                    htmlFor="quote_uz"
                  >
                    Quote (UZ)
                  </label>
                  <input
                    id="quote_uz"
                    name="quote_uz"
                    type="text"
                    value={formData.quote_uz}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>

                {/* Numeric metrics */}
                {(() => {
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
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {metricKeys.map((metric) => (
                        <div key={metric}>
                          <label
                            className="block text-sm text-white/80 mb-1 capitalize"
                            htmlFor={metric}
                          >
                            {metric}
                          </label>
                          <input
                            id={metric}
                            name={metric}
                            type="number"
                            value={formData[metric as MetricKey] as number}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
                    type="text"
                    value={formData.cefr}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10 mt-8">
              <Link
                href="/dashboard/teachers"
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherPage;
