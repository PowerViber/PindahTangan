import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconCart, IconMenu, IconX } from "./Icons";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jual", label: "Operations" },
  { href: "/profile", label: "Profile" },
];

export default function TopNavBar() {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, profile, loading } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function isActive(href: string) {
    if (href === "/jual") return pathname === "/jual" || pathname.startsWith("/jual");
    if (href === "/profile") return pathname === "/profile";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="bg-[#FBF9F8] border-b border-[#D1C5B8] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold text-[#1B1C1C] hover:text-[#725A39] transition-colors flex-shrink-0">
          PindahTangan
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-base pb-1 transition-colors ${
                isActive(item.href)
                  ? "font-bold text-[#725A39] border-b border-[#725A39]"
                  : "font-normal text-[#4D453C] hover:text-[#1B1C1C]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop right: auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-[#D1C5B8] text-[#1B1C1C] hover:bg-[#F6F3F2] transition-colors"
          >
            <IconCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#725A39] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {user ? (
                <Link
                  href="/profile"
                  className="text-sm font-semibold bg-[#2D2D2D] hover:bg-[#1B1C1C] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {profile?.full_name || user.user_metadata?.full_name || user.email}
                </Link>
              ) : pathname !== "/login" ? (
                <Link
                  href="/login"
                  className="text-sm font-semibold border border-[#1B1C1C] text-[#1B1C1C] hover:bg-[#F6F3F2] px-4 py-2 rounded-lg transition-colors"
                >
                  Log In
                </Link>
              ) : null}
            </>
          )}
        </div>

        {/* Mobile right: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-[#D1C5B8] text-[#1B1C1C] hover:bg-[#F6F3F2] transition-colors"
          >
            <IconCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#725A39] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#D1C5B8] text-[#1B1C1C] hover:bg-[#F6F3F2] transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div ref={menuRef} className="md:hidden border-t border-[#D1C5B8] bg-[#FBF9F8] shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-3 rounded-lg text-base font-semibold transition-colors ${
                  isActive(item.href)
                    ? "bg-[#F0EAE2] text-[#725A39]"
                    : "text-[#4D453C] hover:bg-[#F6F3F2] hover:text-[#1B1C1C]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-[#E8E2D9] mt-2 pt-3">
              {!loading && (
                <>
                  {user ? (
                    <div className="px-3 py-2 text-sm text-[#7F766A] font-medium truncate">
                      {profile?.full_name || user.user_metadata?.full_name || user.email}
                    </div>
                  ) : pathname !== "/login" ? (
                    <Link
                      href="/login"
                      className="block px-3 py-3 rounded-lg text-base font-semibold text-[#1B1C1C] hover:bg-[#F6F3F2] transition-colors"
                    >
                      Log In
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
