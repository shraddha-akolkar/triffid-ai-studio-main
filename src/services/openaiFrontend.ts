import type { TechStack } from "@/types/frontendBuilder";

const OPENAI_CHAT_URL = "/api/openai/v1/chat/completions";
const MODEL = "gpt-4o-mini";

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:html)?\s*([\s\S]*?)```$/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}

function techStackLabel(stack: TechStack): string {
  switch (stack) {
    case "html-css":
      return "HTML and CSS (single file with inline or embedded styles)";
    case "react":
      return "React";
    case "angular":
      return "Angular";
  }
}

function systemPrompt(techStack: TechStack, isEdit: boolean): string {
  const stack = techStackLabel(techStack);
  const base = `You are an expert frontend developer. Generate production-quality ${stack} code.

Rules:
- Return ONLY a complete, valid HTML document (DOCTYPE, html, head, body).
- Use modern, responsive, accessible markup and styling.
- Do not wrap the response in markdown code fences.
- Do not include explanations or commentary outside the HTML.`;

  if (isEdit) {
    return `${base}
- You will receive the current HTML and a change request. Apply the changes and return the full updated HTML document.`;
  }

  return `${base}
- Create a polished landing page or site based on the user's description.`;
}

async function chatCompletion(
  techStack: TechStack,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<string> {
  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `OpenAI request failed (${response.status})`;
    try {
      const parsed = JSON.parse(errBody) as { error?: { message?: string } };
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      if (errBody) message = errBody.slice(0, 200);
    }
    throw new Error(message);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("No content returned from OpenAI");
  }
  return stripCodeFences(content);
}

export async function generateFrontendHtml(
  techStack: TechStack,
  userPrompt: string,
): Promise<string> {
  return chatCompletion(techStack, [
    { role: "system", content: systemPrompt(techStack, false) },
    { role: "user", content: userPrompt },
  ]);
}

export async function updateFrontendHtml(
  techStack: TechStack,
  currentHtml: string,
  userPrompt: string,
): Promise<string> {
  return chatCompletion(techStack, [
    { role: "system", content: systemPrompt(techStack, true) },
    {
      role: "user",
      content: `Current HTML:\n\n${currentHtml}\n\n---\n\nChange request: ${userPrompt}`,
    },
  ]);
}
