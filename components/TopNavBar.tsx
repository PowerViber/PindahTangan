import Link from "next/link";
import { useRouter } from "next/router";
import { IconSearch, IconCart } from "./Icons";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jual", label: "Operations" },
];

export default function TopNavBar() {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, profile, loading } = useAuth();
  const { count } = useCart();

  return (
    <nav className="bg-[#FBF9F8] border-b border-[#D1C5B8] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-bold text-[#1B1C1C] hover:text-[#725A39] transition-colors">
            PindahTangan
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/jual" && pathname?.startsWith("/jual"));
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
          <div className="relative mr-2">
            <IconSearch className="w-4 h-4 text-[#4D453C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari perangkat..."
              className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-xl pl-10 pr-4 py-2 text-sm w-48 focus:outline-none focus:border-[#725A39] focus:bg-white transition-all"
            />
          </div>

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
                <>
                  <Link
                    href="/orders"
                    className="text-sm font-semibold text-[#4D453C] hover:text-[#1B1C1C] px-2 transition-colors"
                  >
                    Pesanan Saya
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm font-semibold bg-[#2D2D2D] hover:bg-[#1B1C1C] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {profile?.full_name || user.user_metadata?.full_name || user.email}
                  </Link>
                </>
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
      </div>
    </nav>
  );
}
