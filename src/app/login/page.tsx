"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Function to generate particles
  useEffect(() => {
    const createParticles = () => {
      const particleContainer = document.getElementById("particles");
      if (!particleContainer) return;

      particleContainer.innerHTML = "";
      const particleCount = 50;

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

  // Check if already logged in
  useEffect(() => {
    if (api.auth.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.auth.login(username, password);

      if (response.error) {
        setError(response.error);
      } else {
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (_error) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-color-surface relative overflow-hidden">
      {/* Animated particles background */}
      <div id="particles" className="absolute inset-0 z-0"></div>

      {/* Animated glow effect */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-lg bg-color-surface backdrop-blur-sm bg-opacity-80 z-10 transition-all duration-300 hover:shadow-xl border border-[#273355]/30">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
            <Image
              src="/logo.svg"
              alt="Admire Admin Logo"
              width={60}
              height={60}
              className="relative z-10 drop-shadow-md"
            />
          </div>
          <h2 className="text-3xl font-bold text-center text-text-primary">
            Welcome Back
          </h2>
          <p className="text-text-secondary text-center text-sm">
            Sign in to access your admin dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-text-secondary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm appearance-none bg-background/50 border-[#273355] placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-[#478be5]/50 focus:border-[#478be5] transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-text-secondary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm appearance-none bg-background/50 border-[#273355] placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-[#478be5]/50 focus:border-[#478be5] transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-base font-medium text-white border border-[#273355] rounded-lg shadow-lg bg-[#478be5] hover:bg-[#3a75c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#478be5] transition-all duration-200 relative overflow-hidden group"
              style={{
                boxShadow: "0 4px 14px 0 rgba(71, 139, 229, 0.39)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                  Processing...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Sign in</span>
                  <span className="absolute inset-0 bg-[#3a75c4] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-text-secondary opacity-70">
        &copy; {new Date().getFullYear()} Admire Admin. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
