"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconShield } from "../components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center px-10 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-5xl font-semibold text-[#1B1C1C] leading-tight">PindahTangan</h1>
          <p className="font-body text-sm text-[#4E453C]">
            Masuk ke marketplace elektronik pre-owned terpercaya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#D1C4B8] rounded-2xl p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold text-[#1B1C1C]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-body bg-[#F5F3F3] border border-[#D1C4B8] rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold text-[#1B1C1C]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-body bg-[#F5F3F3] border border-[#D1C4B8] rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[#725A39]"
              />
              <span className="font-body text-sm text-[#1B1C1C]">Ingat saya</span>
            </label>

            <button
              type="submit"
              className="bg-[#2D2D2D] hover:bg-[#1B1C1C] text-white font-body font-semibold text-base py-4 rounded-sm transition-colors"
            >
              Masuk Sekarang
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#D1C4B8]" />
            <span className="font-mono text-xs font-medium text-[#80756A] tracking-wide">ATAU MASUK DENGAN</span>
            <div className="flex-1 h-px bg-[#D1C4B8]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="border border-[#D1C4B8] bg-white hover:bg-[#F5F3F3] rounded-sm py-3 text-sm font-body font-medium text-[#1B1C1C] transition-colors">
              Google
            </button>
            <button type="button" className="border border-[#D1C4B8] bg-white hover:bg-[#F5F3F3] rounded-sm py-3 text-sm font-body font-medium text-[#1B1C1C] transition-colors">
              Apple
            </button>
          </div>

          <p className="font-body text-sm text-[#4E453C]">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-[#1B1C1C] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </form>

        <div className="bg-[#F5F3F3] border border-[#D1C4B8] rounded-xl px-6 py-4 flex items-center gap-3">
          <IconShield className="w-5 h-5 text-[#735A39] flex-shrink-0" />
          <span className="font-mono text-xs font-medium text-[#4E453C] tracking-wide">VERIFIED BY PINDAHTANGAN</span>
        </div>
      </div>
    </div>
  );
}
