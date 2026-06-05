export interface DatabaseTable {
  id: string;
  name: string;
  columns: string[];
  rows: string[][];
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePromptEntry {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface DatabaseProject {
  id: string;
  name: string;
  tables: DatabaseTable[];
  prompts: DatabasePromptEntry[];
  activeTableId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiDatabaseResponse {
  message: string;
  activeTableName: string | null;
  tables: {
    name: string;
    columns: string[];
    rows: string[][];
  }[];
}
