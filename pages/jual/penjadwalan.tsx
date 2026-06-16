

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { IconCheck, IconShield, IconMapPin } from "../../components/Icons";
import { formatIDR } from "../../components/ProductCard";

const dayLabels = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const timeSlots = [
  { label: "08.00 - 09.00", sub: "Pagi" },
  { label: "09.00 - 10.00", sub: "Pagi" },
  { label: "10.00 - 11.00", sub: "Pagi" },
  { label: "12.00 - 13.00", sub: "Siang" },
  { label: "13.00 - 14.00", sub: "Siang" },
  { label: "14.00 - 15.00", sub: "Siang" },
  { label: "15.00 - 16.00", sub: "Sore" },
];

interface PendingSubmission {
  productName: string;
  purchaseYear?: string;
  condition?: string;
  functionality?: string;
  completeness?: string;
  address?: string;
  contact?: string;
  estimationPrice?: number;
  imageUrl?: string | null;
  draftId?: string;
}

interface CalendarCell {
  day: number;
  faded: boolean;
  fullDate: Date;
}

interface UnavailableSlot {
  pickup_date: string;
  pickup_time: string;
}

function slotKey(date: string, time: string) {
  return `${date.trim()}__${time.trim()}`;
}

async function fetchUnavailableSlots(excludeSubmissionId?: string) {
  const { data, error } = await supabase.rpc("qc_unavailable_slots", {
    p_exclude_submission_id: excludeSubmissionId || null,
  });

  if (error) throw error;
  return (data || []) as UnavailableSlot[];
}

export default function PenjadwalanPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [submission, setSubmission] = useState<PendingSubmission | null>(null);
  const [calendarCells, setCalendarCells] = useState<CalendarCell[]>([]);
  const [monthYearLabel, setMonthYearLabel] = useState("");
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);

  function formatSelectedDate(dateObj: Date | null) {
    if (!dateObj) return "";
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const dataStr = sessionStorage.getItem("pending_submission");
      if (dataStr) {
        setSubmission(JSON.parse(dataStr) as PendingSubmission);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!submission) return;
    let cancelled = false;
    const draftId = submission.draftId;

    queueMicrotask(() => {
      async function loadUnavailableSlots() {
        try {
          setSlotsLoading(true);
          const slots = await fetchUnavailableSlots(draftId);
          if (!cancelled) setUnavailableSlots(slots);
        } catch (err) {
          console.error("Gagal memuat slot QC:", err);
          if (!cancelled) {
            setErrorMsg("Gagal memuat slot QC yang sudah terisi. Silakan muat ulang halaman.");
          }
        } finally {
          if (!cancelled) setSlotsLoading(false);
        }
      }

      void loadUnavailableSlots();
    });

    return () => {
      cancelled = true;
    };
  }, [submission]);

  useEffect(() => {
    const today = new Date();
    const startLimit = new Date();
    startLimit.setDate(today.getDate() + 1);
    startLimit.setHours(0, 0, 0, 0);

    // Calculate base date (today + 1 day)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1);

    // Target month based on monthOffset
    const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const nextMonthYearLabel = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: CalendarCell[] = [];

    // Faded cells from previous month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthTotalDays - i,
        faded: true,
        fullDate: new Date(year, month - 1, prevMonthTotalDays - i)
      });
    }

    // Days of current month
    let firstAvailableDate: Date | null = null;
    for (let d = 1; d <= totalDays; d++) {
      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      const isBeforeLimit = cellDate < startLimit;

      if (!isBeforeLimit && !firstAvailableDate) {
        firstAvailableDate = cellDate;
      }

      cells.push({
        day: d,
        faded: isBeforeLimit,
        fullDate: cellDate
      });
    }

    queueMicrotask(() => {
      setMonthYearLabel(nextMonthYearLabel);
      setCalendarCells(cells);
      setSelectedDateObj((current) => current || firstAvailableDate);
    });
  }, [monthOffset]);

  const currentSubmission = submission;

  if (loading || !user || !currentSubmission) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userDisplayName = profile?.full_name || user.email?.split("@")[0] || "Budi Santoso";
  const userContactPhone = currentSubmission.contact || profile?.contact_number || "";
  const userCustomAddress = currentSubmission.address || "Jl. Sudirman No. 12, Jakarta";
  const selectedDateLabel = formatSelectedDate(selectedDateObj);
  const unavailableSlotKeys = new Set(
    unavailableSlots.map((slot) => slotKey(slot.pickup_date, slot.pickup_time))
  );
  const selectedSlotKey = slotKey(selectedDateLabel, timeSlots[selectedTime].label);
  const selectedSlotUnavailable = unavailableSlotKeys.has(selectedSlotKey);

  const addresses = [
    { name: userDisplayName, phone: userContactPhone, address: userCustomAddress },
  ];

  async function handleConfirmSchedule() {
    if (!user) {
      setErrorMsg("Sesi aktif tidak ditemukan. Silakan login kembali.");
      return;
    }
    const submissionToSave = currentSubmission;
    if (!submissionToSave) {
      setErrorMsg("Data pengajuan tidak ditemukan. Silakan ulangi dari form jual.");
      return;
    }
    if (!userContactPhone.trim()) {
      setErrorMsg("Nomor kontak belum tersedia. Silakan kembali ke form jual dan isi nomor kontak Anda.");
      return;
    }
    if (selectedSlotUnavailable) {
      setErrorMsg("Slot QC ini sudah terisi oleh item lain. Silakan pilih jam lain.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      const selectedAddr = addresses[selectedAddress].address;
      const dateStr = selectedDateLabel;
      const latestUnavailableSlots = await fetchUnavailableSlots(submissionToSave.draftId);
      const latestUnavailableKeys = new Set(
        latestUnavailableSlots.map((slot) => slotKey(slot.pickup_date, slot.pickup_time))
      );

      if (latestUnavailableKeys.has(slotKey(dateStr, timeSlots[selectedTime].label))) {
        setErrorMsg("Slot QC ini baru saja terisi oleh item lain. Silakan pilih jam lain.");
        setUnavailableSlots(latestUnavailableSlots);
        setSubmitting(false);
        return;
      }

      let error;
      if (submissionToSave.draftId) {
        const res = await supabase
          .from("submissions")
          .update({
            address: selectedAddr,
            contact: userContactPhone,
            status: "PENDING",
            pickup_date: dateStr,
            pickup_time: timeSlots[selectedTime].label,
          })
          .eq("id", submissionToSave.draftId);
        error = res.error;
      } else {
        const res = await supabase.from("submissions").insert({
          user_id: user.id,
          product_name: submissionToSave.productName,
          purchase_year: submissionToSave.purchaseYear,
          condition: submissionToSave.condition,
          functionality: submissionToSave.functionality,
          completeness: submissionToSave.completeness,
          address: selectedAddr,
          contact: userContactPhone,
          status: "PENDING",
          estimation_price: submissionToSave.estimationPrice,
          image_url: submissionToSave.imageUrl || null,
          pickup_date: dateStr,
          pickup_time: timeSlots[selectedTime].label,
        });
        error = res.error;
      }

      if (error) {
        if (error.code === "23505") {
          setErrorMsg("Slot QC ini sudah terisi oleh item lain. Silakan pilih jam lain.");
          setUnavailableSlots(await fetchUnavailableSlots(submissionToSave.draftId));
          setSubmitting(false);
          return;
        }
        throw new Error(error.message);
      }

      sessionStorage.removeItem("pending_submission");
      setConfirmed(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan pengajuan ke database. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    const dateStr = formatSelectedDate(selectedDateObj);
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D1C4B8] rounded-2xl p-12 max-w-md w-full text-center shadow-md">
          <div className="w-16 h-16 bg-[#735A39] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
            <IconCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1B1C1C] mb-2">Jadwal Dikonfirmasi</h2>
          <p className="font-body text-sm text-[#5F5E5E] mb-8 leading-relaxed">
            Kurir kami akan datang pada {dateStr}, {timeSlots[selectedTime].label}. Pantau statusnya di dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-[#303031] hover:bg-[#1B1C1C] text-white font-body font-bold px-8 py-3.5 rounded-lg transition-colors cursor-pointer"
          >
            Lihat Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex flex-col gap-2 mb-10 border-b border-[#D1C5B8] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#1B1C1C]">Penjadwalan Penjemputan</h1>
        <p className="font-sans text-base text-[#4E453C] max-w-2xl">
          Atur waktu penjemputan gratis ke rumah Anda. Tim kami akan memverifikasi kondisi perangkat di tempat.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] p-4 rounded-lg text-sm font-semibold mb-6">
          {errorMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: scheduler */}
        <div className="flex flex-col gap-8">
          {/* 1. Date */}
          <div className="bg-white border border-[#D1C4B8] rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold shadow-2xs">1</div>
              <h2 className="font-sans text-base font-bold text-[#1B1C1C]">Pilih Tanggal Penjemputan</h2>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-bold text-[#1B1C1C]">{monthYearLabel}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={monthOffset === 0}
                    onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                    className="p-2 border border-[#D1C4B8] rounded-lg hover:border-[#735A39] hover:bg-[#F6F3F2] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[#1B1C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={monthOffset === 2}
                    onClick={() => setMonthOffset((o) => Math.min(2, o + 1))}
                    className="p-2 border border-[#D1C4B8] rounded-lg hover:border-[#735A39] hover:bg-[#F6F3F2] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[#1B1C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center">
                {dayLabels.map((d) => (
                  <span key={d} className="font-mono text-xs text-[#5F5E5E] font-semibold py-2">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((c, i) => {
                  const isSelected = selectedDateObj && c.fullDate && selectedDateObj.getTime() === c.fullDate.getTime() && !c.faded;
                  return (
                    <button
                      type="button"
                      key={i}
                      disabled={c.faded}
                      onClick={() => !c.faded && setSelectedDateObj(c.fullDate)}
                      className={`h-12 rounded-lg font-body text-sm transition-colors cursor-pointer ${c.faded
                        ? "text-[#DBDAD9] cursor-default"
                        : isSelected
                          ? "bg-[#735A39] text-white font-bold shadow-xs"
                          : "text-[#1B1C1C] hover:bg-[#F6F3F2]"
                        }`}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Time */}
          <div className="bg-white border border-[#D1C4B8] rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold shadow-2xs">2</div>
              <div>
                <h2 className="font-sans text-base font-bold text-[#1B1C1C]">Pilih Slot Waktu</h2>
                <p className="font-body text-xs text-[#7F766A] mt-0.5">
                  {slotsLoading ? "Memuat slot QC..." : "Satu slot hanya bisa dipakai oleh satu item QC."}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {timeSlots.map((t, i) => {
                const slotUnavailable = unavailableSlotKeys.has(slotKey(selectedDateLabel, t.label));
                return (
                  <button
                    type="button"
                    key={t.label}
                    disabled={slotUnavailable}
                    onClick={() => {
                      if (!slotUnavailable) setSelectedTime(i);
                    }}
                    className={`rounded-xl p-4 flex justify-between items-center border transition-colors ${slotUnavailable
                        ? "bg-[#F5F3F3] border-[#D1C4B8] text-[#7F766A] cursor-not-allowed opacity-70"
                        : i === selectedTime
                          ? "bg-[#C5A67F]/40 border-[#735A39] border-2 cursor-pointer"
                          : "bg-white border-[#D1C4B8] hover:border-[#735A39] cursor-pointer"
                      }`}
                  >
                    <div className="text-left">
                      <div className={`font-body text-sm font-bold ${slotUnavailable ? "text-[#7F766A]" : "text-[#1B1C1C]"}`}>{t.label}</div>
                      <div className="font-body text-xs text-[#4E453C] mt-0.5">
                        {slotUnavailable ? "Penuh" : t.sub}
                      </div>
                    </div>
                    {i === selectedTime && !slotUnavailable && <IconCheck className="w-5 h-5 text-[#735A39]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Address */}
          <div className="bg-white border border-[#D1C4B8] rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold shadow-2xs">3</div>
                <h2 className="font-sans text-base font-bold text-[#1B1C1C]">Alamat Penjemputan</h2>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {addresses.map((a, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedAddress(i)}
                  className={`rounded-xl p-4 flex flex-col gap-1.5 text-left border transition-colors cursor-pointer ${i === selectedAddress ? "bg-[#C5A67F]/40 border-[#735A39] border-2" : "bg-white border-[#D1C4B8] hover:border-[#735A39]"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-[#735A39]" />
                      <span className="font-sans text-xs font-bold text-[#1B1C1C]">{a.name} ({a.phone})</span>
                    </div>
                    {i === selectedAddress && <IconCheck className="w-4 h-4 text-[#735A39]" />}
                  </div>
                  <p className="font-body text-sm text-[#4E453C] leading-relaxed pl-6">{a.address}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#303031] text-white rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <h3 className="font-sans text-base font-semibold border-b border-[#4E453C] pb-3">Ringkasan Jadwal</h3>
            <div className="flex flex-col gap-4 border-b border-[#4E453C] pb-6">
              <div className="flex items-start gap-4">
                <IconCheck className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">{formatSelectedDate(selectedDateObj)}</div>
                  <div className="font-body text-xs text-[#C9C6C0] mt-0.5">Tanggal penjemputan</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <IconCheck className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">{timeSlots[selectedTime].label}</div>
                  <div className="font-body text-xs text-[#C9C6C0] mt-0.5">Slot waktu</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <IconMapPin className="w-4 h-4 text-[#D2B48C] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-body text-sm font-bold">{addresses[selectedAddress].name}</div>
                  <div className="font-body text-xs text-[#C9C6C0] mt-0.5 line-clamp-2">{addresses[selectedAddress].address}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg px-4 py-3 flex justify-between items-center text-[#1B1C1C]">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#7F766A]">Estimasi Harga</span>
                <span className="font-sans text-base font-bold text-[#735A39]">
                  {formatIDR(currentSubmission.estimationPrice)}
                </span>
              </div>
              <button
                onClick={handleConfirmSchedule}
                disabled={submitting || slotsLoading || selectedSlotUnavailable}
                className="w-full bg-[#735A39] hover:bg-[#5B4526] disabled:bg-[#80756A] disabled:cursor-not-allowed text-white font-body font-bold py-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center shadow-xs"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Konfirmasi Jadwal"
                )}
              </button>
              {selectedSlotUnavailable && (
                <p className="font-body text-xs text-[#FFDAD6] leading-relaxed">
                  Slot ini sudah dipakai item lain di antrian QC. Pilih jam lain.
                </p>
              )}
              <p className="font-body text-xs text-[#C9C6C0] leading-relaxed">
                Satu langkah lagi untuk menjual perangkat Anda dengan harga terbaik.
              </p>
            </div>
          </div>

          <div className="bg-[#EFEDED] border border-[#D1C4B8] rounded-xl p-6 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs">
              <IconShield className="w-5 h-5 text-[#735A39]" />
            </div>
            <div>
              <h4 className="font-body text-sm font-bold text-[#1B1C1C] mb-1">Penjemputan Tanpa Risiko</h4>
              <p className="font-body text-xs text-[#5F5E5E] leading-relaxed">
                Tidak ada biaya pembatalan hingga 2 jam sebelum jadwal. Kurir kami terverifikasi dan terlatih.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
