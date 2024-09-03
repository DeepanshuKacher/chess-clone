import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Play Chess",
  description: "Play chess with online opponent",
  authors: [
    {
      name: "Deepanshu Kacher",
      url: "https://deepanshu.techresonance.com",
    },
  ],
  creator: "Deepanshu Kacher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
