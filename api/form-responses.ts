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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const formId = (req.query.formId as string) || process.env.LW_FORM_ID;
  const domainId = process.env.LW_DOMAIN_ID;

  if (!formId || !domainId) {
    return res.status(400).json({ error: "formId and domainId required" });
  }

  try {
    const token = await getAccessToken();

    // Get form responses
    const apiRes = await fetch(
      `https://www.worksapis.com/v1.0/surveys/${formId}/responses?domainId=${domainId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await apiRes.json();
    if (!apiRes.ok) return res.status(apiRes.status).json(data);

    // Extract members who answered "参加" (attend)
    // LINE WORKS Form responses structure: data.responseList[]
    // Each response has userId and answers[]
    const members = (data.responseList ?? [])
      .filter((r: any) => {
        // Find the participation question answer
        const answers: any[] = r.answers ?? [];
        return answers.some(
          (a: any) =>
            a.answer === "参加" ||
            a.answer === "yes" ||
            a.answer === "出席" ||
            String(a.answer).includes("参加")
        );
      })
      .map((r: any) => ({
        id: r.userId ?? r.respondentId,
        name: r.respondentName ?? r.userId,
        department: r.department ?? r.orgUnitName ?? "",
        email: r.email ?? "",
      }));

    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
