"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

interface Icon {
  id: number;
  name: string;
  url: string;
}

const EditIconPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const iconId = params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [, setOriginalUrl] = useState<string | null>(null); // originalUrl state variable not needed directly
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  // Fetch existing icon details
  useEffect(() => {
    const fetchIcon = async () => {
      if (!iconId) return;
      setFetchLoading(true);
      const res = await api.icon.getById(iconId);
      setFetchLoading(false);
      if (res.error) {
        toast.error(handleApiError(res));
        router.push("/dashboard/icons");
        return;
      }

      const icon = res.data as Icon;
      setFormData({ name: icon.name });
      setFilePreview(icon.url);
      setOriginalUrl(icon.url);
    };
    fetchIcon();
  }, [iconId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setFilePreview(url);
  };

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    if (file) data.append("file", file);

    const res = await api.icon.update(iconId, data);
    setLoading(false);

    if (res.error) {
      toast.error(handleApiError(res));
      return;
    }

    toast.success("Icon updated successfully");
    router.push("/dashboard/icons");
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl p-6 bg-gradient-to-r from-[#0f1a35]/80 to-[#2a3c7d]/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center mb-1">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-white">Edit Icon</h1>
          </div>
          <p className="text-white/80 pl-11 max-w-lg">
            Update icon details or replace image.
          </p>
        </div>
      </div>

      <div className="relative rounded-xl bg-[#172442]/90 backdrop-blur-sm border border-white/10 shadow-lg p-6 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-white font-medium mb-2">
              Icon Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter icon name"
              className="w-full px-4 py-2.5 bg-[#0f1a35]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#478be5]/50"
            />
          </div>

          {/* File upload */}
          <div>
            <label htmlFor="file" className="block text-white font-medium mb-2">
              Icon Image
            </label>
            <div
              className="mb-4 p-4 border-2 border-dashed rounded-lg border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer h-56 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              {filePreview ? (
                <div className="relative h-full w-full">
                  <Image
                    src={filePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-white/40 mx-auto mb-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-white/70 mb-1">Click to select</p>
                  <p className="text-white/50 text-sm">
                    Only images are supported
                  </p>
                </div>
              )}
              <input
                type="file"
                id="file"
                name="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-white/10 text-white/80 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#478be5] text-white rounded-lg hover:bg-[#3a75c4] transition-colors shadow-lg shadow-[#478be5]/30 flex items-center"
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
  );
};

export default EditIconPage;
