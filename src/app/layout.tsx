import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ThemeSwitcher from "./theme-switcher";

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
    <html suppressHydrationWarning lang="en">
      <body
        className={`${unicaSans.variable} ${geistMono.variable} bg-stone-200 font-sans text-stone-700 antialiased dark:bg-stone-950 dark:text-stone-300`}
      >
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
