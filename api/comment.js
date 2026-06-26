export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sA, sB, sC } = req.body;
  if (!sA || !sB) {
    return res.status(400).json({ error: "Missing scores" });
  }

  const prompt = `あなたはユング心理学に基づくコーチングAI「カク」です。
以下の診断結果を元に、ユーザーへの温かく洞察に満ちたフィードバックを180字程度で生成してください。
創作や憶測ではなく、データが示す傾向のみを元に。ジャッジせず、可能性を開く言葉で。

現在の機能スコア：思考${sA.T.toFixed(1)} 感情${sA.F.toFixed(1)} 感覚${sA.S.toFixed(1)} 直観${sA.N.toFixed(1)}
理想の機能スコア：思考${sB.T.toFixed(1)} 感情${sB.F.toFixed(1)} 感覚${sB.S.toFixed(1)} 直観${sB.N.toFixed(1)}
${sC ? `MBTIベースの混在スコア：思考${sC.T.toFixed(1)} 感情${sC.F.toFixed(1)} 感覚${sC.S.toFixed(1)} 直観${sC.N.toFixed(1)}` : ""}

最も優位な機能と劣等機能に触れつつ、「なぜ今、変化を求めているのか」について一段深い気づきを提供してください。
コーチングの入口となる問いかけで締めくくること。`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return res.status(500).json({ error: "API error" });
    }

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text ?? "";
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
