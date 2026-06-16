"use client";
import { usePathname } from "next/navigation";
import TopNavBar from "./TopNavBar";
import SimpleFooter from "./SimpleFooter";

export default function ShellChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
