export type TechStack = "html-css" | "react" | "angular";

export interface FrontendPromptEntry {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface FrontendProject {
  id: string;
  name: string;
  techStack: TechStack;
  html: string;
  prompts: FrontendPromptEntry[];
  createdAt: string;
  updatedAt: string;
}
