import type { AiDatabaseResponse, DatabaseTable } from "@/types/database";

const OPENAI_CHAT_URL = "/api/openai/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an expert database architect and data assistant. The user manages a logical database project that can contain multiple tables.

You will receive the current database state as JSON and a user request in natural language.

Return ONLY valid JSON (no markdown, no code fences, no commentary) with this exact shape:
{
  "message": "A friendly, concise summary for the user (you may use **bold** for table names)",
  "activeTableName": "name of the table the user is most likely viewing, or null",
  "tables": [
    {
      "name": "table_name",
      "columns": ["col1", "col2"],
      "rows": [["val1", "val2"]]
    }
  ]
}

Rules:
- Return the COMPLETE updated database state (all tables that should exist after the operation)
- Preserve existing tables and their data unless the user explicitly asks to delete, drop, or clear them
- Table names must be lowercase snake_case
- All cell values in rows must be strings
- Each row array length must match the columns array length
- Prefer an "id" column as the first column; auto-increment ids as strings ("1", "2", ...)
- When creating a new database from scratch, design sensible tables based on the user's description
- When adding records, append to existing rows (do not duplicate)
- When the user asks to query or show data, include all matching data in rows and explain results in message
- If the request is unclear, make your best guess and explain in message`;

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}

function tablesToContext(tables: DatabaseTable[]): string {
  if (tables.length === 0) return "[]";
  return JSON.stringify(
    tables.map((t) => ({
      name: t.name,
      columns: t.columns,
      rows: t.rows,
    })),
    null,
    2,
  );
}

async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<string> {
  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
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
  return stripJsonFences(content);
}

function parseAiResponse(raw: string): AiDatabaseResponse {
  const parsed = JSON.parse(raw) as AiDatabaseResponse;
  if (!parsed.message || !Array.isArray(parsed.tables)) {
    throw new Error("Invalid response format from OpenAI");
  }
  return parsed;
}

export async function generateDatabaseFromPrompt(
  userPrompt: string,
): Promise<AiDatabaseResponse> {
  const raw = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Current database state (empty — new project):\n[]\n\n---\n\nUser request: ${userPrompt}`,
    },
  ]);
  return parseAiResponse(raw);
}

export async function updateDatabaseFromPrompt(
  tables: DatabaseTable[],
  userPrompt: string,
): Promise<AiDatabaseResponse> {
  const raw = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Current database state:\n${tablesToContext(tables)}\n\n---\n\nUser request: ${userPrompt}`,
    },
  ]);
  return parseAiResponse(raw);
}

export function applyAiTables(
  existing: DatabaseTable[],
  aiTables: AiDatabaseResponse["tables"],
  activeTableName: string | null,
  previousActiveTableId: string | null = null,
): { tables: DatabaseTable[]; activeTableId: string | null } {
  const now = new Date().toISOString();
  const tables: DatabaseTable[] = aiTables.map((ai, i) => {
    const match = existing.find(
      (t) => t.name.toLowerCase() === ai.name.toLowerCase(),
    );
    if (match) {
      return {
        ...match,
        columns: [...ai.columns],
        rows: ai.rows.map((r) => [...r]),
        updatedAt: now,
      };
    }
    return {
      id: `tbl_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      name: ai.name.toLowerCase(),
      columns: [...ai.columns],
      rows: ai.rows.map((r) => [...r]),
      createdAt: now,
      updatedAt: now,
    };
  });

  let activeTableId: string | null = null;
  if (activeTableName) {
    activeTableId =
      tables.find((t) => t.name.toLowerCase() === activeTableName.toLowerCase())
        ?.id ?? null;
  }
  if (!activeTableId && previousActiveTableId) {
    activeTableId = tables.find((t) => t.id === previousActiveTableId)?.id ?? null;
  }
  if (!activeTableId && tables.length > 0) {
    activeTableId = tables[0].id;
  }

  return { tables, activeTableId };
}
