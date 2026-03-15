import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as crypto from "crypto";

// Generate JWT for LINE WORKS OAuth2 (Service Account JWT flow)
function buildJwt(clientId: string, serviceAccount: string, privateKeyPem: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientId,
      sub: serviceAccount,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const data = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(data);
  const signature = sign.sign(privateKeyPem, "base64url");
  return `${data}.${signature}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const clientId = process.env.LW_CLIENT_ID!;
  const clientSecret = process.env.LW_CLIENT_SECRET!;
  const serviceAccount = process.env.LW_SERVICE_ACCOUNT!;
  const privateKey = process.env.LW_PRIVATE_KEY!.replace(/\\n/g, "\n");

  if (!clientId || !clientSecret || !serviceAccount || !privateKey) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  try {
    const jwt = buildJwt(clientId, serviceAccount, privateKey);

    const tokenRes = await fetch("https://auth.worksmobile.com/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        assertion: jwt,
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "bot survey",
      }),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) return res.status(tokenRes.status).json(data);

    res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
