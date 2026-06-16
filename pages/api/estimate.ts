import type { NextApiRequest, NextApiResponse } from "next";

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

    Berikan hasil taksiran harga saat ini yang realistis (berupa angka bulat integer).
    Berikan daftar alasan utama dalam bahasa Indonesia mengapa harga tersebut ditentukan (bisa 2 alasan atau lebih jika ada poin general).
    Berikan juga taksiran tren harga pasar bulanan produk ini untuk 6 bulan terakhir: ${last6Months.join(", ")}.

    Format respon Anda harus berupa JSON murni dengan format persis seperti ini:
    {
      "isElectronic": true,
      "price": 12500000,
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
        { "label": "${last6Months[0]}", "value": 13500000 },
        { "label": "${last6Months[1]}", "value": 13200000 },
        { "label": "${last6Months[2]}", "value": 13000000 },
        { "label": "${last6Months[3]}", "value": 12800000 },
        { "label": "${last6Months[4]}", "value": 12600000 },
        { "label": "${last6Months[5]}", "value": 12500000 }
      ]
    }
  `;

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    console.log("No AI API keys configured. Using fallback math formula.");
    return res.status(200).json(getFallbackEstimation(purchaseYear));
  }

  // 1. Try Groq (Llama 3.3 70b)
  if (groqApiKey) {
    try {
      console.log("Using Groq API for pricing estimation...");
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
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
        console.error("Groq API Error Response:", errorText);
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const json = await response.json();
      const text = json.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("No text returned from Groq");
      }

      const cleanText = text.replace(/```json|```/g, "").trim();
      console.log("=== Groq AI Response Output ===");
      console.log(cleanText);
      console.log("===============================");
      const data = JSON.parse(cleanText);
      return res.status(200).json(data);
    } catch (groqError) {
      console.error("Error with Groq API, attempting Gemini fallback:", groqError);
    }
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
      const data = JSON.parse(cleanText);
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
