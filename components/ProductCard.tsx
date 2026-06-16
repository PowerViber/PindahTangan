"use client";
import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconShield, IconCart, IconCheck } from "./Icons";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    grade: "MINT" | "GOOD" | "FAIR" | string;
    price: number | string;
    image_url?: string | null;
    sold?: boolean;
    seller_id?: string | null;
  };
  hideCartButton?: boolean;
}

const gradeStyle: Record<string, string> = {
  MINT: "bg-[#1B1C1C] text-white",
  GOOD: "bg-[#D2B48C] text-[#5B4526] border border-[#5B4526]",
  FAIR: "bg-[#E8E2D9] text-[#1B1C1C] border border-[#D1C5B8]",
};

export function formatIDR(val: number | string | null | undefined) {
  if (val === null || val === undefined) return "Rp0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ProductCard({ product, hideCartButton = false }: Readonly<ProductCardProps>) {
  const router = useRouter();
  const { user } = useAuth();
  const displayGrade = (product.grade || "GOOD").toUpperCase();
  const badgeClass = gradeStyle[displayGrade] || gradeStyle.GOOD;
  const { addToCart, isInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const inCart = isInCart(product.id);
  const isOwnListing = Boolean(user && product.seller_id && product.seller_id === user.id);

  async function handleAddToCart(e: MouseEvent) {
    e.preventDefault();
    if (inCart || product.sold || isOwnListing || adding) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  }

  return (
    <article className="bg-white border border-[#E8E2D9] hover:border-[#D1C5B8] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full group">
      <div className="bg-[#FBF9F8] p-4">
        <div className="relative bg-[#F6F3F2] border border-[#D1C5B8] rounded-lg h-48 flex items-center justify-center text-[#A89070] overflow-hidden group-hover:scale-[1.01] transition-transform">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-[#FBF9F8] to-[#EFEDED] p-4 text-center">
              <svg className="w-12 h-12 text-[#A89070]/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-sans text-xs tracking-wide text-[#7F766A] uppercase font-semibold">PindahTangan Verified</span>
            </div>
          )}
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide ${badgeClass}`}>
            {displayGrade}
          </span>
          {isOwnListing && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide bg-white text-[#725A39] border border-[#D1C5B8]">
              Listing Anda
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-lg font-semibold text-[#1B1C1C] line-clamp-2 leading-snug group-hover:text-[#725A39] transition-colors">{product.name}</h2>
          <div className="bg-[#FEDDB3] rounded-full px-3 py-1 flex items-center gap-1.5 w-fit">
            <IconShield className="w-3.5 h-3.5 text-[#725A39]" />
            <span className="font-body text-xs font-semibold text-[#725A39]">Verified by PindahTangan</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#F5F3F3]">
          <span className="font-body text-xl font-bold text-[#1B1C1C]">
            {formatIDR(product.price)}
          </span>
          <div className="flex items-center gap-2">
            {!hideCartButton && (
              <button
                onClick={handleAddToCart}
                disabled={inCart || product.sold || isOwnListing || adding}
                title={
                  isOwnListing
                    ? "Listing milikmu tidak bisa dibeli sendiri"
                    : inCart
                      ? "Sudah di keranjang"
                      : "Tambah ke Keranjang"
                }
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default ${
                  inCart
                    ? "bg-[#1B1C1C] border-[#1B1C1C] text-white"
                    : "border-[#D1C5B8] text-[#1B1C1C] hover:bg-[#F6F3F2]"
                }`}
              >
                {inCart ? <IconCheck className="w-4 h-4" /> : <IconCart className="w-4 h-4" />}
              </button>
            )}
            <Link
              href={`/marketplace/${product.id}`}
              className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
