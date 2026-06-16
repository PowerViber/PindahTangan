"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconShield } from "../components/Icons";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [agree, setAgree] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-5xl bg-white border border-[#D1C4B8] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm relative z-10">

        {/* Left: editorial branding */}
        <div className="hidden md:flex md:w-[42%] bg-[#F5F3F3] flex-col justify-between p-10">
          <div className="bg-white border border-[#D1C4B8] rounded-xl h-64 flex items-center justify-center text-[#A89070] text-xs">
            Foto Produk
          </div>
          <div className="flex flex-col gap-7 mt-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-sans text-4xl font-semibold text-[#735A39] leading-tight">PindahTangan</h1>
              <p className="font-sans text-xl font-medium text-[#4E453C] leading-snug">
                Masa depan teknologi, di tangan kedua Anda.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <IconShield className="w-4 h-4 text-[#735A39]" />
                <span className="font-mono text-xs font-medium text-[#735A39] tracking-wide">VERIFIED BY PINDAHTANGAN</span>
              </div>
              <p className="font-body text-sm text-[#5F5E5E] leading-relaxed">
                Bergabunglah dengan komunitas eksklusif kami untuk mendapatkan akses ke perangkat premium yang telah dikurasi dan disertifikasi oleh ahli kami.
              </p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 p-10 md:p-14 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-3xl font-semibold text-[#1B1C1C]">Daftar Akun Baru</h2>
            <p className="font-body text-sm text-[#5F5E5E]">Lengkapi data Anda untuk mulai bertransaksi dengan aman.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-[#1B1C1C]">Nama Lengkap</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="font-body bg-white border border-[#D1C4B8] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-[#1B1C1C]">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="font-body bg-white border border-[#D1C4B8] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-[#1B1C1C]">Nomor WhatsApp</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+62 8xx-xxxx-xxxx"
                className="font-body bg-white border border-[#D1C4B8] rounded-sm px-4 py-3 text-sm placeholder-[#A89070] focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-[#1B1C1C]">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="font-body bg-white border border-[#D1C4B8] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#725A39]"
              />
              <span className="font-body text-sm text-[#4E453C]">
                Saya setuju dengan Syarat &amp; Ketentuan serta Kebijakan Privasi PindahTangan
              </span>
            </label>

            <button
              type="submit"
              disabled={!agree}
              className="bg-[#303031] hover:bg-[#1B1C1C] disabled:bg-[#D1C5B8] disabled:cursor-not-allowed text-[#FBF9F8] font-sans font-bold py-4 rounded-sm transition-colors"
            >
              Buat Akun Sekarang
            </button>

            <p className="font-body text-sm text-[#5F5E5E] border-t border-[#D1C4B8] pt-6">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-[#1B1C1C] hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
