import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AuthProvider } from "../lib/AuthContext";
import ShellChrome from "../components/ShellChrome";
import AdminLayout from "../components/AdminLayout";
import "../styles/globals.css";

import { Source_Serif_4, Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPath = router.pathname.startsWith("/admin");

  return (
    <div
      className={`${sourceSerif.variable} ${hanken.variable} ${inter.variable} ${jbmono.variable} bg-[#FBF9F8] text-[#1B1C1C] antialiased min-h-screen flex flex-col font-sans`}
    >
      <AuthProvider>
        {isAdminPath ? (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        ) : (
          <ShellChrome>
            <Component {...pageProps} />
          </ShellChrome>
        )}
      </AuthProvider>
    </div>
  );
}
