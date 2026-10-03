// Cloudflare Worker — DownloadEverything proxy
export default {
  async fetch(request, env, ctx) {
    const CORS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const TARGET = "https://slave.downloadeverythingfromeverywhere.com/";
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

    const body = await request.text();

    try {
      const res = await fetch(TARGET, {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Origin": "https://downloadeverythingfromeverywhere.com",
          "Referer": "https://downloadeverythingfromeverywhere.com/",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body,
      });

      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          ...CORS,
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }
  },
};
