import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRISM | Ramgarh Police",
  description: "From FIR to Final Report—Under One Prism. Police Review of Investigation Status & Monitoring — Ramgarh Police",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${mono.variable} antialiased bg-[#f4f7fb] text-slate-900 min-h-screen`}
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
