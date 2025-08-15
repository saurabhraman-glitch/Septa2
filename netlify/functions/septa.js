// /.netlify/functions/septa
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  try {
    const url = new URL(event.rawUrl || ("https://x.example" + event.path + (event.queryStringParameters ? "?" + new URLSearchParams(event.queryStringParameters).toString() : "")));
    const type = url.searchParams.get("type");
    if (type === "schedule") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const date = url.searchParams.get("date");
      const upstream = `https://www3.septa.org/schedules/rail?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&format=json`;
      const r = await fetch(upstream, { headers: { "User-Agent": "septa-vibe-proxy" }});
      const data = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
    if (type === "nta") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const count = url.searchParams.get("count") || "200";
      const upstream = `https://www3.septa.org/hackathon/NextToArrive/?req1=${encodeURIComponent(from)}&req2=${encodeURIComponent(to)}&req3=${count}`;
      const r = await fetch(upstream, { headers: { "User-Agent": "septa-vibe-proxy" }});
      const txt = await r.text();
      let data; try { data = JSON.parse(txt); } catch { data = []; }
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ error: "missing type" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
}
