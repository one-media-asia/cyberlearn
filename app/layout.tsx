import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberLearn | Learn cybersecurity by doing",
  description: "Free beginner-friendly cybersecurity courses, guided labs and learning resources."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
