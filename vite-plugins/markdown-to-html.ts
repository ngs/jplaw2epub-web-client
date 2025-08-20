import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { createHtmlTemplate } from "./shared/html-template";
import { setupMarked, extractTitle } from "./shared/markdown-processor";
import type { Plugin } from "vite";

// Setup marked with syntax highlighting
setupMarked();


export interface MarkdownToHtmlOptions {
  docsDir?: string;
  outputDir?: string;
}

export function markdownToHtmlPlugin(
  options: MarkdownToHtmlOptions = {}
): Plugin {
  const { docsDir = "public-docs", outputDir = "" } = options;

  return {
    name: "markdown-to-html",
    enforce: "post",

    async generateBundle() {
      try {
        const docsDirPath = path.resolve(process.cwd(), docsDir);

        // Check if docs directory exists
        try {
          await fs.access(docsDirPath);
        } catch {
          // No docs directory found, skipping
          return;
        }

        const files = await fs.readdir(docsDirPath);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));

        if (markdownFiles.length === 0) {
          // No markdown files found
          return;
        }

        // Processing markdown files

        for (const file of markdownFiles) {
          const filePath = path.join(docsDirPath, file);
          const fileContent = await fs.readFile(filePath, "utf-8");

          // Parse frontmatter and content
          const { data: metadata, content } = matter(fileContent);

          // Convert markdown to HTML
          const htmlContent = await marked(content);

          // Extract title
          const title = extractTitle(content, metadata, file.replace(".md", ""));

          // Create full HTML document
          const fullHtml = createHtmlTemplate({
            title,
            content: htmlContent,
            metadata,
            isDevelopment: false,
          });

          // Determine output path
          const baseName = file.replace(".md", "");
          const outputPath = outputDir
            ? `${outputDir}/${baseName}/index.html`
            : `${baseName}/index.html`;

          // Emit the HTML file
          this.emitFile({
            type: "asset",
            fileName: outputPath,
            source: fullHtml,
          });

          // Generated output file
        }

        // Successfully processed all markdown files
      } catch (error) {
        console.error(
          "[markdown-to-html] Error processing markdown files:",
          error
        );
      }
    },
  };
}
