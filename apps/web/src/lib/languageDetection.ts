const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  // JavaScript/TypeScript
  ".ts": "typescript",
  ".tsx": "tsx",
  ".js": "javascript",
  ".jsx": "jsx",
  ".mjs": "javascript",
  ".cjs": "javascript",

  // Web
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".sass": "sass",
  ".less": "less",
  ".vue": "vue",
  ".svelte": "svelte",

  // Data formats
  ".json": "json",
  ".jsonc": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".xml": "xml",

  // Markup
  ".md": "markdown",
  ".mdx": "mdx",
  ".rst": "rest",

  // Programming languages
  ".py": "python",
  ".pyw": "python",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".scala": "scala",
  ".rb": "ruby",
  ".php": "php",
  ".cs": "csharp",
  ".swift": "swift",
  ".dart": "dart",
  ".lua": "lua",
  ".pl": "perl",
  ".pm": "perl",
  ".r": "r",
  ".ex": "elixir",
  ".exs": "elixir",
  ".erl": "erlang",
  ".hs": "haskell",
  ".clj": "clojure",
  ".cljs": "clojure",
  ".cljc": "clojure",

  // C/C++
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".hpp": "cpp",
  ".hh": "cpp",
  ".hxx": "cpp",

  // Shell
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "zsh",
  ".fish": "fish",
  ".ps1": "powershell",

  // Other
  ".sql": "sql",
  ".graphql": "graphql",
  ".gql": "graphql",
  ".prisma": "prisma",
  ".dockerfile": "dockerfile",
  ".makefile": "makefile",
  ".cmake": "cmake",
  ".gradle": "gradle",

  // Config
  ".ini": "ini",
  ".prettierrc": "json",
  ".eslintrc": "json",
  ".babelrc": "json",

  // Text
  ".txt": "text",
  ".log": "log",
  ".csv": "csv",
};

const FILENAME_TO_LANGUAGE: Record<string, string> = {
  "dockerfile": "dockerfile",
  "makefile": "makefile",
  "cmakelists.txt": "cmake",
  "jenkinsfile": "groovy",
  "vagrantfile": "ruby",
  "gemfile": "ruby",
  "rakefile": "ruby",
  "podfile": "ruby",
  "procfile": "yaml",
  ".gitignore": "gitignore",
  ".gitattributes": "gitignore",
  ".editorconfig": "editorconfig",
  ".env": "dotenv",
  ".env.local": "dotenv",
  ".env.development": "dotenv",
  ".env.production": "dotenv",
  ".env.test": "dotenv",
};

export function detectLanguageFromPath(filePath: string): string {
  const basename = filePath.toLowerCase().split("/").pop() ?? "";
  const ext = "." + (basename.split(".").pop() ?? "");

  // Check filename first
  if (FILENAME_TO_LANGUAGE[basename]) {
    return FILENAME_TO_LANGUAGE[basename];
  }

  // Check extension
  if (EXTENSION_TO_LANGUAGE[ext]) {
    return EXTENSION_TO_LANGUAGE[ext];
  }

  return "text";
}

export function isBinaryFile(mimeType: string): boolean {
  return !mimeType.startsWith("text/");
}

export function isImageFile(filePath: string): boolean {
  const ext = filePath.toLowerCase().split(".").pop() ?? "";
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp"].includes(ext);
}
