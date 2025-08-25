import type { GetEpubQuery } from "../gql/graphql";

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 60; // Max 2 minutes

// GraphQL query string (same as in queries.ts)
const GET_EPUB_QUERY = `
  query GetEpub($id: String!) {
    epub(id: $id) {
      signedUrl
      id
      status
      error
    }
  }
`;

export const setupEpubDownload = (self: ServiceWorkerGlobalScope) => {
  const pollEpubStatus = async (
    epubId: string,
    sessionId: string,
    sourceClient: Client,
    graphqlEndpoint: string,
    attempt = 0
  ): Promise<void> => {
    try {
      if (attempt >= MAX_POLLING_ATTEMPTS) {
        throw new Error("Polling timeout: EPUB generation took too long");
      }

      // Execute GraphQL query to check EPUB status
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: GET_EPUB_QUERY,
          variables: { id: epubId },
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0].message || JSON.stringify(result.errors)}`);
      }

      const data = result.data as GetEpubQuery;
      const epub = data.epub;

      // Send status update to client
      sourceClient.postMessage({
        type: "epub-status",
        sessionId,
        status: epub.status,
        error: epub.error,
      });

      switch (epub.status) {
        case "COMPLETED":
          if (!epub.signedUrl) {
            throw new Error("EPUB completed but no download URL provided");
          }
          // Start downloading the EPUB file
          await downloadEpubFile(epub.signedUrl, sessionId, sourceClient);
          break;

        case "FAILED":
          throw new Error(epub.error || "EPUB generation failed");

        case "PENDING":
        case "PROCESSING":
          // Continue polling
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          await pollEpubStatus(epubId, sessionId, sourceClient, graphqlEndpoint, attempt + 1);
          break;

        default:
          throw new Error(`Unknown EPUB status: ${epub.status}`);
      }
    } catch (error) {
      sourceClient.postMessage({
        type: "download-error",
        sessionId,
        error: error instanceof Error ? error.message : "EPUB generation failed",
      });
    }
  };

  const downloadEpubFile = async (
    url: string,
    sessionId: string,
    sourceClient: Client
  ) => {
    try {
      sourceClient.postMessage({
        type: "download-starting",
        sessionId,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to read response body");
      }

      const chunks: Uint8Array[] = [];
      let received = 0;
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // Update every 100ms

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        received += value.length;

        if (total > 0) {
          const now = Date.now();
          // Send progress updates at intervals
          if (now - lastUpdateTime > UPDATE_INTERVAL) {
            const progress = (received / total) * 100;
            sourceClient.postMessage({
              type: "download-progress",
              sessionId,
              progress,
              received,
              total,
            });
            lastUpdateTime = now;
          }
        }
      }

      // Final progress update
      if (total > 0) {
        sourceClient.postMessage({
          type: "download-progress",
          sessionId,
          progress: 100,
          received,
          total,
        });
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks as BlobPart[], {
        type: "application/epub+zip",
      });

      // Convert blob to base64 for transfer
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        sourceClient.postMessage({
          type: "download-complete",
          sessionId,
          data: fileReader.result,
          mimeType: "application/epub+zip",
        });
      };
      fileReader.readAsDataURL(blob);
    } catch (error) {
      sourceClient.postMessage({
        type: "download-error",
        sessionId,
        error: error instanceof Error ? error.message : "Download failed",
      });
    }
  };

  // Message event handler for EPUB generation requests
  self.addEventListener("message", (event: ExtendableMessageEvent) => {
    if (event.data.type === "generate-epub") {
      const { 
        epubId, 
        clientId: sessionId,
        graphqlEndpoint = "https://api.jplaw2epub.ngs.io/graphql"
      } = event.data;

      // Wrap the async operation in waitUntil
      event.waitUntil(
        (async () => {
          // Get the client that sent the message
          if (event.source && "id" in event.source) {
            const client = await self.clients.get(event.source.id);
            if (client) {
              await pollEpubStatus(epubId, sessionId, client, graphqlEndpoint);
            }
          }
        })()
      );
    }
  });
};