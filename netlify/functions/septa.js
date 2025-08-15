// /.netlify/functions/septa
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const url = new URL(
      event.rawUrl ||
      ("https://x.example" + event.path + (event.queryStringParameters
        ? "?" + new URLSearchParams(event.queryStringParameters).toString()
        : ""))
    );
    const type = url.searchParams.get("type");

    // Helper: fetch -> text -> try JSON -> fallback []
    async function safeJson(upstream) {
      const r = await fetch(upstream, { headers: { "User-Agent": "septa-vibe-proxy" } });
      const txt = await r.text();
      try { return JSON.parse(txt); } catch { return []; }
    }

    if (type === "schedule") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const date = url.searchParams.get("date"); // YYYY-MM-DD
      const upstream = `https://www3.septa.org/schedules/rail?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&format=json`;
      const data = await safeJson(upstream);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (type === "nta") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const count = url.searchParams.get("count") || "200";
      const upstream = `https://www3.septa.org/hackathon/NextToArrive/?req1=${encodeURIComponent(from)}&req2=${encodeURIComponent(to)}&req3=${encodeURIComponent(count)}`;
      const data = await safeJson(upstream);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "missing type" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
}
