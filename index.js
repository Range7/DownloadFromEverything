// Cloudflare Worker — DownloadEverything proxy v2
export default {
  async fetch(request, env, ctx) {
    const CORS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Health check for browser visits (GET)
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "worker_ok", message: "Send POST with JSON body" }),
        { status: 200, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }

    // Only POST goes to upstream
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST is allowed" }),
        { status: 405, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }

    const TARGET = "https://slave.downloadeverythingfromeverywhere.com/";
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

    const body = await request.text();

    if (!body || body.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Empty body — JSON payload required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }

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
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }
  },
};
