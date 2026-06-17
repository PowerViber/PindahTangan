import type { NextApiRequest, NextApiResponse } from "next";

const GROQ_ESTIMATION_MODELS = [
  "llama-3.1-8b-instant",
  "meta-llama/llama-prompt-guard-2-22m",
  "meta-llama/llama-prompt-guard-2-86m",
] as const;

type GroqModel = typeof GROQ_ESTIMATION_MODELS[number];

type EstimationResponse = {
  isElectronic: boolean;
  error?: string;
  price?: number;
  reasons?: Array<{ title: string; desc: string }>;
  trend?: Array<{ label: string; value: number }>;
};

type GroqModelState = {
  model: GroqModel;
  inFlight: number;
  successes: number;
  failures: number;
  cooldownUntil: number;
  lastUsedAt: number;
};

const GROQ_FAILURE_COOLDOWN_MS = 30_000;

const groqModelStates: GroqModelState[] = GROQ_ESTIMATION_MODELS.map((model) => ({
  model,
  inFlight: 0,
  successes: 0,
  failures: 0,
  cooldownUntil: 0,
  lastUsedAt: 0,
}));

function reserveGroqModel(attemptedModels: Set<GroqModel>) {
  const now = Date.now();
  const unattemptedModels = groqModelStates.filter((state) => !attemptedModels.has(state.model));
  const healthyModels = unattemptedModels.filter((state) => state.cooldownUntil <= now);
  const candidateModels = healthyModels.length > 0 ? healthyModels : unattemptedModels;

  if (candidateModels.length === 0) return null;

  const selected = [...candidateModels].sort((a, b) => {
    const aTotal = a.successes + a.failures;
    const bTotal = b.successes + b.failures;

    return (
      a.inFlight - b.inFlight ||
      aTotal - bTotal ||
      a.lastUsedAt - b.lastUsedAt ||
      a.model.localeCompare(b.model)
    );
  })[0];

  selected.inFlight += 1;
  selected.lastUsedAt = now;
  return selected.model;
}

function releaseGroqModel(model: GroqModel, success: boolean) {
  const state = groqModelStates.find((item) => item.model === model);
  if (!state) return;

  state.inFlight = Math.max(0, state.inFlight - 1);

  if (success) {
    state.successes += 1;
    state.cooldownUntil = 0;
  } else {
    state.failures += 1;
    state.cooldownUntil = Date.now() + GROQ_FAILURE_COOLDOWN_MS;
  }
}

function parseEstimationJson(text: string): EstimationResponse {
  const cleanText = text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(cleanText) as EstimationResponse;

  if (data.isElectronic === false && data.error) {
    return data;
  }

  if (
    data.isElectronic === true &&
    typeof data.price === "number" &&
    Array.isArray(data.reasons) &&
    Array.isArray(data.trend)
  ) {
    return data;
  }

  throw new Error("AI response did not match expected estimation JSON shape");
}

async function requestGroqEstimation(groqApiKey: string, model: GroqModel, prompt: string) {
  console.log(`Using Groq API for pricing estimation with model: ${model}`);
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.1,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API Error Response (${model}):`, errorText);
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`No text returned from Groq model ${model}`);
  }

  const cleanText = text.replace(/```json|```/g, "").trim();
  console.log(`=== Groq AI Response Output (${model}) ===`);
  console.log(cleanText);
  console.log("=========================================");
  return parseEstimationJson(cleanText);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productName, purchaseYear, condition, functionality, completeness } = req.body;

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push(monthLabels[d.getMonth()].toUpperCase());
  }

  const prompt = `
    Anda adalah AI penaksir harga barang elektronik bekas terpercaya di Indonesia untuk platform PindahTangan.

    Tugas pertama Anda adalah menganalisis apakah produk berikut merupakan barang elektronik atau gadget (smartphone, laptop, tablet, kamera, konsol game, TV, kulkas, AC, mesin cuci, vacuum cleaner, dll):
    - Nama Produk: ${productName}

    Jika produk tersebut BUKAN merupakan barang elektronik atau gadget (misalnya: pakaian, sepatu, buku, furniture non-elektronik, makanan, dll), Anda harus mengembalikan JSON dengan format persis seperti ini (tanpa properti lain):
    {
      "isElectronic": false,
      "error": "Produk '${productName}' bukan merupakan barang elektronik atau gadget. Kami hanya menerima barang elektronik."
    }

    Jika produk tersebut ADALAH barang elektronik atau gadget, taksirlah harga pasar saat ini dalam Rupiah (IDR) untuk barang berikut:
    - Nama Produk: ${productName}
    - Tahun Pembelian: ${purchaseYear}
    - Kondisi Fisik: ${condition}
    - Fungsionalitas: ${functionality}
    - Kelengkapan: ${completeness}

    Tentukan nilai taksiran harga saat ini secara dinamis dan realistis sesuai dengan jenis produk, kondisi, tahun, dll (berupa angka bulat integer, contoh: jika produknya adalah AC bekas mungkin harganya 2000000, jika iPhone 13 mungkin 8500000, jika laptop mewah mungkin 15000000, dsb). Jangan pernah mengembalikan angka 12500000 jika tidak sesuai!
    Berikan daftar alasan utama dalam bahasa Indonesia mengapa harga tersebut ditentukan (bisa 2 alasan atau lebih jika ada poin general).
    Berikan juga taksiran tren harga pasar bulanan produk ini untuk 6 bulan terakhir: ${last6Months.join(", ")} yang nilainya bersesuaian dengan harga taksiran saat ini (menunjukkan depresiasi wajar dari bulan ke bulan).

    Format respon Anda harus berupa JSON murni dengan struktur seperti di bawah ini. INGAT: ganti nilai properti "price" dan "value" di bawah dengan hasil analisis nyata Anda sendiri, jangan menyalin angka contoh di bawah:
    {
      "isElectronic": true,
      "price": 8500000,
      "reasons": [
        {
          "title": "Alasan pertama",
          "desc": "Penjelasan detail..."
        },
        {
          "title": "Alasan kedua",
          "desc": "Penjelasan detail..."
        }
      ],
      "trend": [
        { "label": "${last6Months[0]}", "value": 9000000 },
        { "label": "${last6Months[1]}", "value": 8900000 },
        { "label": "${last6Months[2]}", "value": 8800000 },
        { "label": "${last6Months[3]}", "value": 8700000 },
        { "label": "${last6Months[4]}", "value": 8600000 },
        { "label": "${last6Months[5]}", "value": 8500000 }
      ]
    }
  `;

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    console.log("No AI API keys configured. Using fallback math formula.");
    return res.status(200).json(getFallbackEstimation(purchaseYear));
  }

  // 1. Try Groq with a lightweight in-process load balancer.
  if (groqApiKey) {
    const attemptedModels = new Set<GroqModel>();

    while (attemptedModels.size < GROQ_ESTIMATION_MODELS.length) {
      const groqModel = reserveGroqModel(attemptedModels);
      if (!groqModel) break;

      attemptedModels.add(groqModel);

      try {
        const data = await requestGroqEstimation(groqApiKey, groqModel, prompt);
        releaseGroqModel(groqModel, true);
        return res.status(200).json(data);
      } catch (groqError) {
        releaseGroqModel(groqModel, false);
        console.error(`Error with Groq model ${groqModel}, trying next model:`, groqError);
      }
    }

    console.error("All Groq models failed, attempting Gemini fallback.");
  }

  // 2. Try Gemini fallback
  if (geminiApiKey) {
    try {
      console.log("Using Gemini API for pricing estimation...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generation_config: {
              response_mime_type: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error Response:", errorText);
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No text returned from Gemini");
      }

      const cleanText = text.replace(/```json|```/g, "").trim();
      console.log("=== Gemini AI Response Output ===");
      console.log(cleanText);
      console.log("=================================");
      const data = parseEstimationJson(cleanText);
      return res.status(200).json(data);
    } catch (geminiError) {
      console.error("Error with Gemini API, falling back to math formula:", geminiError);
    }
  }

  // 3. Last resort fallback
  return res.status(200).json(getFallbackEstimation(purchaseYear));
}

function getFallbackEstimation(purchaseYear: string) {
  const year = parseInt(purchaseYear) || 2022;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const fallbackPrice = Math.max(2500000, 22000000 - age * 3000000);

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = monthLabels[d.getMonth()].toUpperCase();
    const value = Math.round(fallbackPrice * (1 - i * 0.015));
    trend.push({ label, value });
  }

  return {
    isElectronic: true,
    price: fallbackPrice,
    reasons: [
      {
        title: "Kondisi Fisik",
        desc: "Kondisi fisik sesuai deskripsi Anda. Tim kami akan melakukan validasi akhir saat penjemputan.",
      },
      {
        title: "Tingkat Permintaan",
        desc: "Perangkat ini memiliki likuiditas pasar yang tinggi di marketplace PindahTangan saat ini.",
      },
    ],
    trend,
  };
}
