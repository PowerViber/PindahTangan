import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";
import { formatIDR } from "../components/ProductCard";
import { IconCart, IconStore } from "../components/Icons";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, loading, subtotal, removeFromCart } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B1C1C] flex items-center gap-3">
        <IconCart className="w-7 h-7 text-[#725A39]" />
        Keranjang Belanja
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-16 text-center text-[#7F766A] flex flex-col items-center gap-4">
          <IconCart className="w-12 h-12 text-[#A89070]/40" />
          <p className="text-base font-semibold text-[#1B1C1C]">Keranjang kamu masih kosong</p>
          <Link
            href="/marketplace"
            className="mt-2 bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <IconStore className="w-4 h-4" />
            Jelajahi Marketplace
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8E2D9] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-lg bg-[#F6F3F2] border border-[#D1C5B8] overflow-hidden flex-shrink-0">
                  {item.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/marketplace/${item.product.id}`}
                    className="font-serif text-lg font-semibold text-[#1B1C1C] hover:text-[#725A39] transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-[#7F766A] uppercase tracking-wider font-semibold">{item.product.grade}</p>
                  <p className="font-body text-lg font-bold text-[#1B1C1C] mt-1">{formatIDR(item.product.price)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm font-semibold text-[#BA1A1A] hover:text-[#93000A] transition-colors px-3 py-2 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-80 bg-white border border-[#D1C5B8] rounded-2xl p-6 flex flex-col gap-5 self-start">
            <h2 className="font-serif text-xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-3">
              Ringkasan Pesanan
            </h2>
            <div className="flex items-center justify-between text-sm text-[#4D453C]">
              <span>{items.length} barang</span>
              <span className="font-bold text-[#1B1C1C] text-lg">{formatIDR(subtotal)}</span>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-[#1B1C1C] hover:bg-[#333333] text-white rounded-xl py-3.5 font-semibold transition-colors cursor-pointer"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
