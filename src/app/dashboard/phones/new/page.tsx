"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

const NewPhonePage = () => {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Phone cannot be empty");
      return;
    }
    setSubmitting(true);
    const res = await api.phone.create({ phone });
    if (res.error) toast.error(handleApiError(res));
    else {
      toast.success("Phone added");
      router.push("/dashboard/phones");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl bg-gradient-to-r from-[#172442]/90 to-[#0f1a35]/90 border border-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold text-white mb-4">Add Phone</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="w-full px-3 py-2 rounded border border-white/20 bg-[#17233f] text-white focus:outline-none"
        />
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

export default NewPhonePage;
