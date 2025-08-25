import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { createHtmlTemplate } from "./shared/html-template";
import { setupMarked, extractTitle } from "./shared/markdown-processor";
import type { Plugin } from "vite";

// Setup marked with syntax highlighting
setupMarked();

export interface MarkdownDevServerOptions {
  docsDir?: string;
}

export function markdownDevServerPlugin(
  options: MarkdownDevServerOptions = {},
): Plugin {
  const { docsDir = "public-docs" } = options;

  return {
    name: "markdown-dev-server",
    apply: "serve", // Only apply in dev mode

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url;

        // Check if this is a markdown route (e.g., /help/)
        if (url && url.endsWith("/") && url !== "/") {
          const pageName = url.slice(1, -1); // Remove leading and trailing slashes
          const mdPath = path.join(process.cwd(), docsDir, `${pageName}.md`);

          try {
            // Check if markdown file exists
            await fs.access(mdPath);

            // Read and process markdown file
            const fileContent = await fs.readFile(mdPath, "utf-8");
            const { data: metadata, content } = matter(fileContent);

            // Convert markdown to HTML
            const htmlContent = await marked(content);

            // Extract title
            const title = extractTitle(content, metadata, pageName);

            // Create HTML document
            const fullHtml = createHtmlTemplate({
              title,
              content: htmlContent,
              metadata,
              isDevelopment: true,
            });

            // Send response
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(fullHtml);
            return;
          } catch (_error) {
            // File doesn't exist, continue to next middleware
            next();
            return;
          }
        }

        next();
      });
    },
  };
}
