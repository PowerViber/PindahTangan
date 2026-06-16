"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TopNavBar from "./TopNavBar";
import SimpleFooter from "./SimpleFooter";

export default function ShellChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const restrictedPaths = ["/dashboard", "/jual"];
      const isRestricted = restrictedPaths.some(
        (path) => pathname === path || pathname?.startsWith(path + "/")
      );

      if (!isLoggedIn && isRestricted) {
        router.push("/login");
      }
    };

    checkAuth();

    window.addEventListener("local-auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("local-auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname, router]);

  if (pathname?.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>;
  }

  const suppressNav = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!suppressNav && <TopNavBar />}
      <main className="flex-1">{children}</main>
      <SimpleFooter />
    </>
  );
}
