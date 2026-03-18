import type { Metadata } from "next";
import CyberBackground from "@/components/CyberBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Imitation - Bot or Not",
  description: "Can you tell bot from human?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <CyberBackground />
        {children}
      </body>
    </html>
  );
}
