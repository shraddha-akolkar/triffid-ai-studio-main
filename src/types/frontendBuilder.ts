export type TechStack = "html-css" | "react" | "angular";

export interface FrontendPromptEntry {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface FrontendSnapshot {
  html: string;
  label: string;
  at: string;
}

export interface FrontendProject {
  id: string;
  name: string;
  techStack: TechStack;
  html: string;
  versions?: FrontendSnapshot[];
  prompts: FrontendPromptEntry[];
  createdAt: string;
  updatedAt: string;
}
