"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();

  // Generate breadcrumbs based on the current path
  const generateBreadcrumbs = () => {
    // Remove trailing slash and split the path
    const paths = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    // Don't show breadcrumbs if we're at the root of the dashboard
    if (paths.length <= 1) {
      return null;
    }

    return (
      <div className="flex items-center text-sm">
        <Link
          href="/dashboard"
          className="text-[#4f9bff] hover:text-white transition-colors"
        >
          Dashboard
        </Link>

        {paths.slice(1).map((path, index) => {
          // Create the path up to this point
          const href = `/${paths.slice(0, index + 2).join("/")}`;
          const isLast = index === paths.slice(1).length - 1;

          // Format the breadcrumb text (capitalize first letter)
          const formattedPath =
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <React.Fragment key={path}>
              <span className="mx-2 text-white/50">/</span>
              {isLast ? (
                <span className="text-white/70">{formattedPath}</span>
              ) : (
                <Link
                  href={href}
                  className="text-[#4f9bff] hover:text-white transition-colors"
                >
                  {formattedPath}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="py-3 px-6 backdrop-blur-sm bg-[#172442]/30 border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-medium text-white">
          {pathname === "/dashboard" ? "Admire Dashboard" : ""}
        </h1>
        {generateBreadcrumbs()}
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-white/70 hover:text-[#4f9bff] transition-colors relative">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4f9bff] rounded-full animate-pulse"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <div className="h-8 w-8 rounded-full bg-[#4f9bff] text-white flex items-center justify-center text-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          <span className="relative z-10 font-medium">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
