"use client";
import { useState } from "react";
import { IconCheck, IconShield, IconMapPin } from "../../components/Icons";

const dayLabels = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const calendarCells = [
  { day: 29, faded: true }, { day: 30, faded: true },
  ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1, faded: false })),
];

const timeSlots = [
  { label: "09:00 — 12:00", sub: "Pagi" },
  { label: "13:00 — 17:00", sub: "Siang" },
];

const addresses = [
  { name: "Budi Santoso", phone: "+62 812-3456-7890", address: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190" },
  { name: "Budi Santoso", phone: "+62 812-3456-7890", address: "Gedung SCBD, Lt. 12, Sudirman Central Business District, Jakarta Selatan 12110" },
];

export default function PenjadwalanPage() {
  const [selectedDate, setSelectedDate] = useState(22);
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D1C4B8] rounded-2xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#735A39] rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] mb-2">Jadwal Dikonfirmasi</h2>
          <p className="font-body text-sm text-[#5F5E5E] mb-8">
            Kurir kami akan datang pada {selectedDate} Oktober 2024, {timeSlots[selectedTime].label}. Pantau statusnya di dashboard.
          </p>
          <a href="/dashboard" className="bg-[#303031] hover:bg-[#1B1C1C] text-white font-body font-bold px-8 py-3 rounded-sm transition-colors inline-block">
            Lihat Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="font-sans text-base text-[#1B1C1C]">Penjadwalan Pick-up</h1>
        <p className="font-body text-base text-[#4E453C] max-w-2xl">
          Atur waktu penjemputan barang elektronik Anda. Tim kami akan datang langsung ke lokasi untuk verifikasi dan pembayaran.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: scheduler */}
        <div className="flex flex-col gap-8">
          {/* 1. Date */}
          <div className="bg-white border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold">1</div>
              <h2 className="font-sans text-base text-[#1B1C1C]">Pilih Tanggal Penjemputan</h2>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-bold text-[#1B1C1C]">Oktober 2024</span>
                <div className="flex gap-2">
                  <button type="button" className="w-7 h-7 border border-[#D1C5B8] rounded-sm flex items-center justify-center text-[#1B1C1C]">‹</button>
                  <button type="button" className="w-7 h-7 border border-[#D1C5B8] rounded-sm flex items-center justify-center text-[#1B1C1C]">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center">
                {dayLabels.map((d) => (
                  <span key={d} className="font-mono text-sm text-[#5F5E5E] py-2">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((c, i) => (
                  <button
                    type="button"
                    key={i}
                    disabled={c.faded}
                    onClick={() => setSelectedDate(c.day)}
                    className={`h-14 rounded-sm font-body text-base transition-colors ${
                      c.faded
                        ? "text-[#DBDAD9] cursor-default"
                        : c.day === selectedDate
                        ? "bg-[#735A39] text-white font-bold"
                        : "text-[#1B1C1C] hover:bg-[#F6F3F2]"
                    }`}
                  >
                    {c.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Time */}
          <div className="bg-white border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold">2</div>
              <h2 className="font-sans text-base text-[#1B1C1C]">Pilih Slot Waktu</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {timeSlots.map((t, i) => (
                <button
                  type="button"
                  key={t.label}
                  onClick={() => setSelectedTime(i)}
                  className={`rounded-lg p-4 flex justify-between items-center border transition-colors ${
                    i === selectedTime ? "bg-[#C5A67F] border-[#735A39]" : "bg-white border-[#D1C4B8] hover:border-[#735A39]"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-body text-base font-bold text-[#1B1C1C]">{t.label}</div>
                    <div className="font-body text-sm text-[#4E453C]">{t.sub}</div>
                  </div>
                  {i === selectedTime && <IconCheck className="w-5 h-5 text-[#735A39]" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Address */}
          <div className="bg-white border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold">3</div>
                <h2 className="font-sans text-base text-[#1B1C1C]">Alamat Penjemputan</h2>
              </div>
              <button type="button" className="font-body text-base font-bold text-[#735A39] hover:underline">+ Tambah Baru</button>
            </div>
            <div className="flex flex-col gap-4">
              {addresses.map((a, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedAddress(i)}
                  className={`rounded-lg p-5 flex flex-col gap-2 text-left border transition-colors ${
                    i === selectedAddress ? "bg-[#C5A67F] border-[#735A39] border-2" : "bg-white border-[#D1C4B8] hover:border-[#735A39]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-[#735A39]" />
                      <span className="font-mono text-sm font-medium text-[#5F5E5E]">{a.name} ({a.phone})</span>
                    </div>
                    {i === selectedAddress && <IconCheck className="w-4 h-4 text-[#735A39]" />}
                  </div>
                  <p className="font-body text-base text-[#4E453C]">{a.address}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#303031] text-white rounded-lg p-8 flex flex-col gap-6">
            <h3 className="font-sans text-base">Ringkasan Jadwal</h3>
            <div className="flex flex-col gap-4 border-b border-[#4E453C] pb-6">
              <div className="flex items-start gap-4">
                <IconCheck className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">22 Oktober 2024</div>
                  <div className="font-body text-xs text-[#C9C6C0]">Tanggal penjemputan</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <IconCheck className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">{timeSlots[selectedTime].label}</div>
                  <div className="font-body text-xs text-[#C9C6C0]">Slot waktu</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <IconMapPin className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">{addresses[selectedAddress].name}</div>
                  <div className="font-body text-xs text-[#C9C6C0]">{addresses[selectedAddress].address}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-sm px-4 py-3 flex justify-between items-center">
                <span className="font-body text-sm text-[#1B1C1C]">MacBook Pro 16&quot;</span>
                <span className="font-body text-sm font-bold text-[#1B1C1C]">Rp28.500.000</span>
              </div>
              <button
                onClick={() => setConfirmed(true)}
                className="bg-[#735A39] hover:bg-[#5B4526] text-white font-body font-bold py-4 rounded-sm transition-colors"
              >
                Konfirmasi Jadwal
              </button>
              <p className="font-body text-sm text-[#C9C6C0]">
                Satu langkah lagi untuk menjual perangkat Anda dengan harga terbaik.
              </p>
            </div>
          </div>

          <div className="bg-[#EFEDED] border border-[#D1C4B8] rounded-lg p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <IconShield className="w-5 h-5 text-[#735A39]" />
            </div>
            <div>
              <h4 className="font-body text-base font-bold text-[#1B1C1C] mb-1">Penjemputan Tanpa Risiko</h4>
              <p className="font-body text-sm text-[#5F5E5E]">
                Tidak ada biaya pembatalan hingga 2 jam sebelum jadwal. Kurir kami terverifikasi dan terlatih.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
