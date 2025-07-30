"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

interface Media {
  id: number;
  name: string;
  url: string;
  is_video: boolean;
}

const EditMediaPage = () => {
  const router = useRouter();
  const params = useParams();
  const mediaId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    is_video: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  // Fetch media data
  useEffect(() => {
    const fetchMedia = async () => {
      setFetchLoading(true);
      try {
        const response = await api.media.getById(mediaId);

        if (response.error) {
          toast.error(handleApiError(response));
          router.push("/dashboard/medias");
        } else {
          const media = response.data as Media;
          setFormData({
            name: media.name,
            is_video: media.is_video,
          });
          setOriginalUrl(media.url);
          setFilePreview(media.url);
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        toast.error("Failed to fetch media data");
        router.push("/dashboard/medias");
      } finally {
        setFetchLoading(false);
      }
    };

    if (mediaId) {
      fetchMedia();
    }
  }, [mediaId, router]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setErrors({
        ...errors,
        file: "Only image and video files are allowed",
      });
      return;
    }

    // Update form data with file type
    setFormData({
      ...formData,
      is_video: isVideo,
    });

    setFile(selectedFile);

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);

    // Clear file error if it exists
    if (errors.file) {
      setErrors({
        ...errors,
        file: "",
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create a FormData object for the update
      const mediaFormData = new FormData();
      mediaFormData.append("name", formData.name);
      mediaFormData.append("is_video", String(formData.is_video));
      if (file) {
        mediaFormData.append("file", file);
      }

      const response = await api.media.update(mediaId, mediaFormData);

      if (response.error) {
        toast.error(handleApiError(response));
      } else {
        toast.success("Media updated successfully");
        router.push("/dashboard/medias");
      }
    } catch (err) {
      console.error("Error updating media:", err);
      toast.error("Failed to update media");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f9bff]"></div>
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
            <h1 className="text-3xl font-bold text-white">Edit Media</h1>
          </div>
          <p className="text-white/80 max-w-lg pl-11">
            Update media details or replace the file.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative rounded-xl bg-[#172442]/90 backdrop-blur-sm border border-white/10 shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-white font-medium mb-2">
              Media Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-[#0f1a35]/50 border ${
                errors.name ? "border-red-500" : "border-white/10"
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#478be5]/50`}
              placeholder="Enter a name for this media"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* File upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="file" className="block text-white font-medium">
                Media File
              </label>
              <div className="text-sm text-white/70">
                {formData.is_video ? "Video" : "Image"}
              </div>
            </div>

            {/* Current file and preview */}
            <div
              className={`mb-4 p-4 border-2 border-dashed rounded-lg ${
                filePreview
                  ? "border-[#478be5]/50 bg-[#478be5]/5"
                  : errors.file
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-white/20 bg-white/5"
              } flex flex-col items-center justify-center cursor-pointer h-64 transition-all duration-300`}
              onClick={() => fileInputRef.current?.click()}
            >
              {filePreview ? (
                formData.is_video ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-white/70"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-white/70 text-sm mt-2">
                      {file
                        ? `${file.name} (Video preview not available)`
                        : "Current video (preview not available)"}
                    </p>
                    {!file && (
                      <p className="text-white/50 text-xs mt-1">
                        Click to replace with a new file
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-[80%] max-w-full object-contain"
                    />
                    {!file && originalUrl === filePreview && (
                      <p className="text-white/50 text-xs mt-2">
                        Click to replace with a new file
                      </p>
                    )}
                  </div>
                )
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
                  <p className="text-white/70 mb-1">
                    Drag and drop or click to select
                  </p>
                  <p className="text-white/50 text-sm">
                    Supports images and videos
                  </p>
                </div>
              )}

              <input
                type="file"
                id="file"
                name="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
            {errors.file && (
              <p className="text-red-400 text-sm mt-1">{errors.file}</p>
            )}

            {file && (
              <div className="bg-[#4f9bff]/10 border border-[#4f9bff]/30 rounded-lg p-3 mt-2">
                <p className="text-white/80 text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-[#4f9bff]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Uploading a new file will replace the current one
                </p>
              </div>
            )}
          </div>

          {/* Media type toggle */}
          <div className="flex items-center space-x-3">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_video"
                id="is_video"
                checked={formData.is_video}
                onChange={handleChange}
                className="sr-only peer"
                disabled={!!file} // Disable if a new file is selected
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#478be5]"></div>
            </div>
            <label
              htmlFor="is_video"
              className="text-sm text-white/80 select-none"
            >
              This is a video
              {file && (
                <span className="text-xs text-white/50 ml-2">
                  (Automatically detected)
                </span>
              )}
            </label>
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/medias")}
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

export default EditMediaPage;
