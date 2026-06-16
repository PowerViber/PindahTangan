"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch } from "./Icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/jual", label: "Operations" },
];

export default function TopNavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#FBF9F8] border-b border-[#D1C5B8] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-medium text-[#1B1C1C]">
            PindahTangan
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/jual" && pathname?.startsWith("/jual"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base pb-1 transition-colors ${
                    active
                      ? "font-bold text-[#725A39] border-b border-[#725A39]"
                      : "font-normal text-[#4D453C] hover:text-[#1B1C1C]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <IconSearch className="w-4 h-4 text-[#4D453C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-xl pl-10 pr-4 py-2.5 text-sm w-56 focus:outline-none focus:border-[#725A39]"
            />
          </div>
          <button className="text-sm font-medium text-[#1B1C1C] px-3 py-1.5 rounded-full hover:bg-[#F6F3F2] transition-colors">
            Profile
          </button>
          <Link href="/" className="text-sm font-medium text-[#4D453C] px-3 py-1.5 rounded-full hover:bg-[#F6F3F2] transition-colors">
            Log Out
          </Link>
        </div>
      </div>
    </nav>
  );
}
