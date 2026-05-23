import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { fetchUserInfo } from "@/lib/api.server";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevIntel",
  description: "AI-powered code review and security auditing platform",
  keywords: [
    "repository auditing",
    "github code review",
    "code review",
    "security auditing",
    "AI code analysis",
    "vulnerability detection",
    "code quality",
    "developer tools",
    "software security",
    "static code analysis",
  ],
  appleWebApp: {
    title: "DevIntel",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await fetchUserInfo();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}
