import hljs from "highlight.js";
import { marked, type Renderer, type Tokens } from "marked";

/**
 * Generate slug from heading text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, "") // Keep alphanumeric, Japanese characters, spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Configure marked renderer with syntax highlighting
 */
export function createMarkdownRenderer(): Renderer {
  const renderer = new marked.Renderer();

  // Custom code highlighting
  renderer.code = function ({ text, lang }: Tokens.Code): string {
    const language = lang || "plaintext";
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlighted = hljs.highlight(text, { language: validLanguage }).value;
    return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
  };

  // Add target="_blank" if href starts with https?://
  renderer.link = function ({ href, title, text }: Tokens.Link): string {
    const target = /^https?:\/\//.test(href)
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    return `<a href="${href}"${target} title="${title || ""}">${text}</a>`;
  };

  // Add anchors to h2 and h3 headings
  renderer.heading = function ({ text, depth }: Tokens.Heading): string {
    if (depth === 2 || depth === 3) {
      const slug = generateSlug(text);
      return `<h${depth} id="${slug}">
        <a href="#${slug}" class="heading-anchor" aria-label="Link to ${text}">${text}</a>
      </h${depth}>`;
    }
    // Default heading rendering for other levels
    return `<h${depth}>${text}</h${depth}>`;
  };

  return renderer;
}

/**
 * Setup marked with custom renderer
 */
export function setupMarked(): void {
  const renderer = createMarkdownRenderer();
  marked.setOptions({
    renderer,
  });
}

/**
 * Extract title from markdown content
 */
export function extractTitle(
  content: string,
  metadata: Record<string, unknown>,
  fallback: string
): string {
  // Use metadata title if available
  if (metadata.title && typeof metadata.title === "string") {
    return metadata.title;
  }

  // Extract from first h1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1];
  }

  // Use fallback
  return fallback;
}
