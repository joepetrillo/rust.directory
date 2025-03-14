import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import ThemeSwitcher from "../components/theme-switcher";
import "./globals.css";

const mori = localFont({
  src: "../../public/fonts/mori-variable.woff2",
  variable: "--font-sans",
});

const editorial = localFont({
  src: "../../public/fonts/editorial-variable.woff2",
  variable: "--font-editorial",
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
        className={`${mori.variable} ${editorial.variable} ${geistMono.variable} overflow-y-scroll font-sans antialiased`}
      >
        <ThemeProvider attribute="class">
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
