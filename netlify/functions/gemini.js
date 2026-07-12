/**
 * netlify/functions/gemini.js
 *
 * Serverless proxy for Google Gemini API.
 * The API key lives ONLY here, as a Netlify environment variable
 * (GEMINI_API_KEY) -- it never touches the frontend/browser, so it
 * can't be scraped from the public GitHub repo or page source.
 *
 * Set it in: Netlify dashboard -> Site configuration ->
 * Environment variables -> GEMINI_API_KEY
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY belum diset di environment variables Netlify.");
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server belum dikonfigurasi (GEMINI_API_KEY tidak ditemukan).",
      }),
    };
  }

  let prompt;
  try {
    const parsedBody = JSON.parse(event.body || "{}");
    prompt = parsedBody.prompt;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Body request tidak valid (harus JSON)." }),
    };
  }

  if (!prompt || typeof prompt !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Field 'prompt' wajib diisi." }),
    };
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data);
      return {
        statusCode: geminiResponse.status,
        body: JSON.stringify({
          error: data?.error?.message || "Gemini API mengembalikan error.",
        }),
      };
    }

    // Pass the raw Gemini response straight through --
    // js/app.js already knows how to read data.candidates[0].content.parts[0].text
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Gagal menghubungi Gemini API:", err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Gagal menghubungi Gemini API." }),
    };
  }
};