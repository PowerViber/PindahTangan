import type { Metadata } from "next";
import { Source_Serif_4, Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ShellChrome from "./components/ShellChrome";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500", "600"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PindahTangan — Refined Electronics Logistics",
  description: "Platform recommerce yang mengurus seluruh proses penjualan barang elektronik bekasmu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${sourceSerif.variable} ${hanken.variable} ${inter.variable} ${jbmono.variable} bg-[#FBF9F8] text-[#1B1C1C] antialiased min-h-screen flex flex-col font-sans`}
      >
        <ShellChrome>{children}</ShellChrome>
      </body>
    </html>
  );
}
