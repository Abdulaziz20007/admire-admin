import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admire Admin",
  description: "Admire Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          offset={24}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "bg-[#172442]/90 border border-[#4f9bff]/30 text-white shadow-lg shadow-[#4f9bff]/20 rounded-lg backdrop-blur-md p-4 flex items-center gap-3",
              title: "font-semibold text-white text-sm",
              description: "text-white/70 text-xs mt-1",
              actionButton:
                "bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-md px-3 py-1 text-xs font-medium transition-colors mt-2.5 mr-2",
              cancelButton:
                "bg-transparent text-white/70 hover:text-white rounded-md px-3 py-1 text-xs border border-transparent hover:border-white/20 transition-colors mt-2.5",
              closeButton: "text-white/70 hover:text-white ml-auto self-start",
              success: "border-l-4 border-l-green-500 pl-3",
              error: "border-l-4 border-l-red-500 pl-3",
              info: "border-l-4 border-l-blue-500 pl-3",
              warning: "border-l-4 border-l-amber-500 pl-3",
            },
          }}
          icons={{
            success: (
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3.5 7L6 9.5L10.5 4.5"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ),
            error: (
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3.5 3.5L10.5 10.5M3.5 10.5L10.5 3.5"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ),
            info: (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 3.5V7.5M7 10.5H7.005"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ),
            warning: (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 3V7.5M7 10.5H7.005"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ),
            loading: (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3.5 h-3.5 border-2 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            ),
          }}
        />
      </body>
    </html>
  );
}
