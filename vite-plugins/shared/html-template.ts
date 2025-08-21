/**
 * Shared HTML template for markdown pages
 */

export interface HtmlTemplateOptions {
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  isDevelopment?: boolean;
}

/**
 * Create HTML template for markdown pages
 */
export function createHtmlTemplate({
  title,
  content,
  metadata = {},
  isDevelopment = false,
}: HtmlTemplateOptions): string {
  const description =
    metadata.description || `${title} - 法令検索・EPUB ダウンロード`;

  const devNotice = isDevelopment
    ? `<div class="dev-notice">
        <strong>開発モード:</strong> このページは開発サーバーから動的に生成されています。
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <title>${title} - 法令検索・EPUB ダウンロード</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/docs.css">
</head>
<body>
  
  <!-- Main Content -->
  <div class="container">
    <div class="paper">
      ${devNotice}
      ${content}
    </div>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} <a href="https://ja.ngs.io">Atsushi Nagase</a>. All rights reserved.</p>
  </div>
</body>
</html>`;
}
