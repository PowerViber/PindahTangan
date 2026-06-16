import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconShield } from "../components/Icons";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="font-serif text-4xl font-bold text-[#1B1C1C] leading-tight">PindahTangan</h1>
          <p className="font-sans text-sm text-[#4D453C]">
            Masuk ke marketplace elektronik pre-owned terpercaya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#D1C4B8] rounded-2xl p-8 sm:p-10 flex flex-col gap-6 shadow-xs">
          {errorMsg && (
            <div className="bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] p-4 rounded-lg text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="font-body bg-[#F6F3F2] border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#725A39] focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="font-body bg-[#F6F3F2] border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#725A39] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-[#D1C4B8] text-[#725A39] focus:ring-[#725A39] accent-[#725A39]"
                />
                <span className="font-body text-sm text-[#4D453C]">Ingat saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D2D2D] hover:bg-[#1B1C1C] disabled:bg-[#7F766A] text-white font-body font-semibold text-sm py-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-[#D1C4B8]" />
            <span className="font-mono text-[10px] font-bold text-[#80756A] tracking-wider uppercase">ATAU MASUK DENGAN</span>
            <div className="flex-1 h-px bg-[#D1C4B8]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="border border-[#D1C5B8] bg-white hover:bg-[#F5F3F3] rounded-lg py-3 text-xs font-semibold text-[#1B1C1C] transition-colors cursor-pointer">
              Google
            </button>
            <button type="button" className="border border-[#D1C5B8] bg-white hover:bg-[#F5F3F3] rounded-lg py-3 text-xs font-semibold text-[#1B1C1C] transition-colors cursor-pointer">
              Apple
            </button>
          </div>

          <p className="font-body text-sm text-[#4E453C] text-center border-t border-[#F5F3F3] pt-5">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-[#725A39] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </form>

        <div className="bg-[#F5F3F3] border border-[#D1C4B8] rounded-xl px-5 py-4 flex items-center gap-3">
          <IconShield className="w-5 h-5 text-[#735A39] flex-shrink-0" />
          <span className="font-mono text-[10px] font-bold text-[#4E453C] tracking-wider uppercase">VERIFIED BY PINDAHTANGAN</span>
        </div>
      </div>
    </div>
  );
}
