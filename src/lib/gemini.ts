type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiResult = { text: string; model: string };

function modelCandidates() {
  return [
    "gemini-flash-latest",
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ].filter((model, index, models): model is string =>
    Boolean(model) && models.indexOf(model) === index,
  );
}

function answerFrom(data: unknown) {
  const candidate = (data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  })?.candidates?.[0];

  return candidate?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text || "")
    .join("")
    .trim();
}

export async function askGemini({
  system,
  contents,
  maxOutputTokens,
}: {
  system: string;
  contents: GeminiContent[];
  maxOutputTokens: number;
}): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  const failures: string[] = [];
  for (const model of modelCandidates()) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { maxOutputTokens, temperature: 0.35 },
          }),
          signal: AbortSignal.timeout(12_000),
        },
      );
      const data = await response.json();
      const text = answerFrom(data);
      if (response.ok && text) return { text, model };
      const message = (data as { error?: { message?: string } })?.error?.message;
      failures.push(`${model}: ${response.status} ${message || "sem resposta"}`);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : "erro"}`);
    }
  }

  throw new Error(`Nenhum modelo Gemini respondeu (${failures.join(" | ")})`);
}
