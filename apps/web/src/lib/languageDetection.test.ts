import { describe, expect, it } from "vitest";
import { detectLanguageFromPath, isBinaryFile, isImageFile } from "./languageDetection";

describe("detectLanguageFromPath", () => {
  it("detects TypeScript files", () => {
    expect(detectLanguageFromPath("src/index.ts")).toBe("typescript");
    expect(detectLanguageFromPath("src/App.tsx")).toBe("tsx");
  });

  it("detects JavaScript files", () => {
    expect(detectLanguageFromPath("src/index.js")).toBe("javascript");
    expect(detectLanguageFromPath("src/App.jsx")).toBe("jsx");
  });

  it("detects Python files", () => {
    expect(detectLanguageFromPath("main.py")).toBe("python");
  });

  it("detects Rust files", () => {
    expect(detectLanguageFromPath("src/main.rs")).toBe("rust");
  });

  it("detects Go files", () => {
    expect(detectLanguageFromPath("main.go")).toBe("go");
  });

  it("detects JSON files", () => {
    expect(detectLanguageFromPath("package.json")).toBe("json");
  });

  it("detects YAML files", () => {
    expect(detectLanguageFromPath("config.yaml")).toBe("yaml");
    expect(detectLanguageFromPath("config.yml")).toBe("yaml");
  });

  it("detects Markdown files", () => {
    expect(detectLanguageFromPath("README.md")).toBe("markdown");
  });

  it("detects CSS files", () => {
    expect(detectLanguageFromPath("style.css")).toBe("css");
    expect(detectLanguageFromPath("style.scss")).toBe("scss");
  });

  it("detects shell script files", () => {
    expect(detectLanguageFromPath("script.sh")).toBe("bash");
    expect(detectLanguageFromPath("script.bash")).toBe("bash");
  });

  it("detects C/C++ files", () => {
    expect(detectLanguageFromPath("main.c")).toBe("c");
    expect(detectLanguageFromPath("main.cpp")).toBe("cpp");
  });

  it("matches filenames over extensions", () => {
    expect(detectLanguageFromPath("Dockerfile")).toBe("dockerfile");
    expect(detectLanguageFromPath("Makefile")).toBe("makefile");
  });

  it("detects dotfiles by filename", () => {
    expect(detectLanguageFromPath(".gitignore")).toBe("gitignore");
    expect(detectLanguageFromPath(".gitattributes")).toBe("gitignore");
    expect(detectLanguageFromPath(".editorconfig")).toBe("editorconfig");
    expect(detectLanguageFromPath(".env")).toBe("dotenv");
    expect(detectLanguageFromPath(".env.local")).toBe("dotenv");
    expect(detectLanguageFromPath(".env.production")).toBe("dotenv");
  });

  it("returns 'text' for unknown file types", () => {
    expect(detectLanguageFromPath("README.xyz")).toBe("text");
  });

  it("handles paths with multiple directories", () => {
    expect(detectLanguageFromPath("deep/nested/path/file.ts")).toBe("typescript");
  });
});

describe("isBinaryFile", () => {
  it("returns false for text mime types", () => {
    expect(isBinaryFile("text/plain")).toBe(false);
    expect(isBinaryFile("text/html")).toBe(false);
    expect(isBinaryFile("text/css")).toBe(false);
  });

  it("returns true for non-text mime types", () => {
    expect(isBinaryFile("image/png")).toBe(true);
    expect(isBinaryFile("application/json")).toBe(true);
    expect(isBinaryFile("application/octet-stream")).toBe(true);
  });
});

describe("isImageFile", () => {
  it("returns true for image extensions", () => {
    expect(isImageFile("photo.png")).toBe(true);
    expect(isImageFile("photo.jpg")).toBe(true);
    expect(isImageFile("photo.jpeg")).toBe(true);
    expect(isImageFile("photo.gif")).toBe(true);
    expect(isImageFile("photo.webp")).toBe(true);
    expect(isImageFile("photo.svg")).toBe(true);
    expect(isImageFile("photo.ico")).toBe(true);
    expect(isImageFile("photo.bmp")).toBe(true);
  });

  it("returns false for non-image extensions", () => {
    expect(isImageFile("file.ts")).toBe(false);
    expect(isImageFile("file.json")).toBe(false);
    expect(isImageFile("file.txt")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isImageFile("photo.PNG")).toBe(true);
    expect(isImageFile("photo.Jpg")).toBe(true);
  });
});
