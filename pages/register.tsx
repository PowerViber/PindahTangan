import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconShield } from "../components/Icons";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
        },
      });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // If identities is empty, the email is already registered (email enumeration protection)
        const isExistingUser = data.user.identities && data.user.identities.length === 0;

        if (isExistingUser) {
          setErrorMsg("Email sudah terdaftar. Silakan masuk ke akun Anda.");
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          full_name: form.name,
          email: form.email,
          is_admin: false,
        });

        if (profileError) {
          setErrorMsg(profileError.message);
        } else {
          if (data.session) {
            router.push("/dashboard");
          } else {
            setErrorMsg("Registrasi berhasil! Silakan periksa email Anda untuk memverifikasi akun.");
          }
        }
      } else {
        setErrorMsg("Registrasi selesai. Silakan verifikasi email Anda jika diperlukan.");
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 relative">
      <div className="w-full max-w-5xl bg-white border border-[#D1C4B8] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm relative z-10">
        
        {/* Left Panel: editorial branding */}
        <div className="hidden md:flex md:w-[42%] bg-[#F5F3F3] flex-col justify-between p-10 border-r border-[#D1C4B8]">
          <div className="bg-white border border-[#D1C4B8] rounded-xl h-64 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-tr from-[#FBF9F8] to-[#EFEDED]">
            <svg className="w-16 h-16 text-[#A89070]/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-serif text-lg font-semibold text-[#1B1C1C]">Keamanan Terjamin</span>
            <p className="font-sans text-xs text-[#7F766A] mt-1.5 leading-relaxed max-w-xs">
              Verifikasi fisik 50-titik yang ketat untuk memastikan keaslian dan performa perangkat elektronik Anda.
            </p>
          </div>
          
          <div className="flex flex-col gap-5 mt-8">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-serif text-3xl font-bold text-[#735A39] leading-tight">PindahTangan</h1>
              <p className="font-sans text-lg font-medium text-[#4E453C] leading-snug">
                Masa depan teknologi, di tangan kedua Anda.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <IconShield className="w-4 h-4 text-[#735A39]" />
                <span className="font-mono text-[10px] font-bold text-[#735A39] tracking-wider uppercase">VERIFIED BY PINDAHTANGAN</span>
              </div>
              <p className="font-body text-xs text-[#5F5E5E] leading-relaxed">
                Bergabunglah dengan komunitas eksklusif kami untuk mendapatkan akses ke perangkat premium yang telah dikurasi dan disertifikasi oleh ahli kami.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: form */}
        <div className="flex-1 p-8 sm:p-12 md:p-14 flex flex-col gap-6 justify-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-3xl font-bold text-[#1B1C1C]">Daftar Akun Baru</h2>
            <p className="font-body text-sm text-[#5F5E5E]">Lengkapi data Anda untuk mulai bertransaksi dengan aman.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] p-4 rounded-lg text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama Lengkap Anda"
                className="font-body bg-white border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                className="font-body bg-white border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Nomor WhatsApp</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+62 8xx-xxxx-xxxx"
                className="font-body bg-white border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm placeholder-[#A89070] focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="font-body bg-white border border-[#D1C4B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer py-1.5 select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded-sm border-[#D1C4B8] text-[#725A39] focus:ring-[#725A39] accent-[#725A39]"
              />
              <span className="font-body text-sm text-[#4E453C]">
                Saya setuju dengan Syarat &amp; Ketentuan serta Kebijakan Privasi PindahTangan
              </span>
            </label>

            <button
              type="submit"
              disabled={!agree || loading}
              className="bg-[#303031] hover:bg-[#1B1C1C] disabled:bg-[#D1C5B8] disabled:cursor-not-allowed text-white font-sans font-bold py-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Buat Akun Sekarang"
              )}
            </button>

            <p className="font-body text-sm text-[#5F5E5E] border-t border-[#F5F3F3] pt-5 text-center">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-bold text-[#725A39] hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
