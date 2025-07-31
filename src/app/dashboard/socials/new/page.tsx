"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

interface Icon {
  id: number;
  name: string;
  url: string;
}

const NewSocialPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [iconId, setIconId] = useState<number | "">("");
  const [icons, setIcons] = useState<Icon[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchIcons = async () => {
      const res = await api.icon.getAll();
      if (res.error) toast.error(handleApiError(res));
      else setIcons(res.data || []);
    };
    fetchIcons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !iconId) {
      toast.error("All fields are required");
      return;
    }
    setSubmitting(true);
    const res = await api.social.create({ name, url, icon_id: Number(iconId) });
    if (res.error) toast.error(handleApiError(res));
    else {
      toast.success("Social added");
      router.push("/dashboard/socials");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl bg-gradient-to-r from-[#172442]/90 to-[#0f1a35]/90 border border-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold text-white mb-4">Add Social</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Social name"
          className="w-full px-3 py-2 rounded border border-white/20 bg-[#17233f] text-white focus:outline-none"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Social URL"
          className="w-full px-3 py-2 rounded border border-white/20 bg-[#17233f] text-white focus:outline-none"
        />
        {/* Icon preview */}
        {iconId && (
          <div className="flex justify-center mb-2">
            <img
              src={icons.find((ic) => ic.id === iconId)?.url}
              alt="Selected icon"
              className="h-10 w-10"
            />
          </div>
        )}
        <select
          value={iconId}
          onChange={(e) =>
            setIconId(e.target.value ? Number(e.target.value) : "")
          }
          className="w-full px-3 py-2 rounded border border-white/20 bg-[#17233f] text-white focus:outline-none"
        >
          <option value="">Select icon</option>
          {icons.map((icon) => (
            <option
              key={icon.id}
              value={icon.id}
              style={{
                backgroundImage: `url(${icon.url})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "24px 24px",
                paddingLeft: "28px",
                color: "transparent",
              }}
            >
              {icon.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-[#4f9bff] hover:bg-[#3b82f6] disabled:opacity-50 text-white rounded-lg transition-colors w-full"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default NewSocialPage;
