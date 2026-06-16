import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "../../components/ProductCard";
import { useCart } from "../../lib/CartContext";
import { useAuth } from "../../lib/AuthContext";
import { IconCart, IconCheck } from "../../components/Icons";

interface Product {
  id: string;
  name: string;
  grade: "MINT" | "GOOD" | "FAIR" | string;
  price: number;
  image_url?: string | null;
  created_at: string;
  sold?: boolean;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setProduct(data as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const inCart = product ? isInCart(product.id) : false;

  async function handleAddToCart() {
    if (!product || inCart || product.sold || adding) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  }

  async function handleBuyNow() {
    if (!product || product.sold || adding) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    if (!inCart) {
      await addToCart(product.id);
    }
    setAdding(false);
    router.push("/checkout");
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 lg:px-20 py-20 text-center">
        <div className="w-10 h-10 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-6 lg:px-20 py-20 text-center text-[#7F766A]">
        <p className="text-xl font-semibold mb-4">Produk tidak ditemukan.</p>
        <p className="text-sm">Silakan kembali ke Marketplace untuk memilih produk lain.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="rounded-3xl overflow-hidden bg-[#FBF9F8] border border-[#D1C5B8] w-full lg:w-1/2 h-[420px]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F6F3F2] text-[#A89070] px-6 text-center">
              <div>
                <p className="text-xl font-semibold mb-2">Gambar belum tersedia</p>
                <p className="text-sm text-[#7F766A]">Produk ini belum memiliki gambar.</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-[#7F766A] uppercase tracking-[0.2em] font-semibold">
              <span>{product.grade}</span>
              <span className="h-1 w-1 rounded-full bg-[#7F766A] block" />
              <span>{new Date(product.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B1C1C]">{product.name}</h1>
            <p className="text-2xl font-bold text-[#1B1C1C]">{formatIDR(product.price)}</p>
            <p className="text-base leading-relaxed text-[#4D453C]">
              Deskripsi singkat produk belum tersedia, tetapi semua barang di Marketplace kami melalui inspeksi kualitas ketat.
            </p>
          </div>

          {product.sold ? (
            <div className="w-full bg-[#E8E2D9] text-[#7F766A] rounded-2xl py-4 font-semibold text-center">
              Produk Sudah Terjual
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={inCart || adding}
                className="w-full flex items-center justify-center gap-2 border border-[#1B1C1C] text-[#1B1C1C] rounded-2xl py-4 font-semibold hover:bg-[#F5F3F3] transition-colors disabled:opacity-60 disabled:cursor-default"
              >
                {inCart ? <IconCheck className="w-5 h-5" /> : <IconCart className="w-5 h-5" />}
                {inCart ? "Sudah di Keranjang" : "Tambah ke Keranjang"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="w-full bg-[#1B1C1C] hover:bg-[#333333] text-white rounded-2xl py-4 font-semibold transition-colors disabled:opacity-60"
              >
                Beli Sekarang
              </button>
            </div>
          )}

          <button
            className="text-sm font-semibold text-[#725A39] hover:underline text-left"
            onClick={() => router.back()}
          >
            ← Kembali ke Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
