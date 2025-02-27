import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const unicaSans = localFont({
  src: [
    {
      path: "../../public/fonts/unica-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/unica-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/unica-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rust Directory",
  description: "Your go-to resource for staying ahead in rust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${unicaSans.variable} ${geistMono.variable} bg-black font-sans text-neutral-300 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
