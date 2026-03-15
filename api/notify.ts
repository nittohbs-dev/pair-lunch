import type { VercelRequest, VercelResponse } from "@vercel/node";

async function getAccessToken(): Promise<string> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/token`, { method: "POST" });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token");
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, channelId } = req.body ?? {};
  const botId = process.env.LW_BOT_ID;
  const defaultChannelId = channelId || process.env.LW_CHANNEL_ID;

  if (!botId || !defaultChannelId || !message) {
    return res.status(400).json({ error: "botId, channelId, message required" });
  }

  try {
    const token = await getAccessToken();

    const apiRes = await fetch(
      `https://www.worksapis.com/v1.0/bots/${botId}/channels/${defaultChannelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: { type: "text", text: message },
        }),
      }
    );

    const data = await apiRes.json();
    if (!apiRes.ok) return res.status(apiRes.status).json(data);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
