import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productName, purchaseYear, condition, functionality, completeness } = req.body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    // If the API key is not configured yet, fallback gracefully to the math formula
    console.log("GEMINI_API_KEY not configured. Using fallback math formula.");
    return res.status(200).json(getFallbackEstimation(purchaseYear));
  }

  const prompt = `
    Anda adalah AI penaksir harga barang elektronik bekas terpercaya di Indonesia untuk platform PindahTangan.
    Taksirlah harga pasar saat ini dalam Rupiah (IDR) untuk barang berikut:
    - Nama Produk: ${productName}
    - Tahun Pembelian: ${purchaseYear}
    - Kondisi Fisik: ${condition}
    - Fungsionalitas: ${functionality}
    - Kelengkapan: ${completeness}

    Berikan hasil taksiran harga yang realistis (berupa angka bulat integer) dan 2 alasan utama dalam bahasa Indonesia mengapa harga tersebut ditentukan.
    
    Format respon Anda harus berupa JSON murni dengan format persis seperti ini (tanpa markdown, tanpa tambahan teks, tanpa kutip \`\`\`json):
    {
      "price": 12500000,
      "reasons": [
        {
          "title": "Alasan pertama",
          "desc": "Penjelasan detail alasan pertama..."
        },
        {
          "title": "Alasan kedua",
          "desc": "Penjelasan detail alasan kedua..."
        }
      ]
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
          generationConfig: {
            responseMimeType: "application/json",
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

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("API Error in Gemini estimation, falling back:", error);
    return res.status(200).json(getFallbackEstimation(purchaseYear));
  }
}

function getFallbackEstimation(purchaseYear: string) {
  const year = parseInt(purchaseYear) || 2022;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const fallbackPrice = Math.max(2500000, 22000000 - age * 3000000);

  return {
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
  };
}
