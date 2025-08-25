import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, useCallback, useRef, useEffect } from "react";
import type { EpubStatus } from "../../gql/graphql";
import type { FC } from "react";

interface EpubDownloadDialogProps {
  open: boolean;
  onClose: () => void;
  downloadUrl: string;
  fileName: string;
  lawTitle: string;
}

type DownloadState = "idle" | "generating" | "downloading" | "completed" | "error";

export const EpubDownloadDialog: FC<EpubDownloadDialogProps> = ({
  open,
  onClose,
  downloadUrl,
  fileName,
  lawTitle,
}) => {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [epubStatus, setEpubStatus] = useState<EpubStatus | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Extract EPUB ID from downloadUrl (format: /epubs/{epubId})
  const epubId = downloadUrl.split('/').pop() || '';

  // Check if File System Access API is supported
  const isFileSaveSupported = "showSaveFilePicker" in window;

  // Check if Service Worker is supported (not necessarily ready)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(
    "serviceWorker" in navigator && !!navigator.serviceWorker.controller
  );

  // Wait for Service Worker to be ready
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Check if controller is already available
    if (navigator.serviceWorker.controller) {
      setIsServiceWorkerReady(true);
      return;
    }

    // Wait for controller to be available
    const handleControllerChange = () => {
      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerReady(true);
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    // Also check when service worker is ready
    navigator.serviceWorker.ready.then(() => {
      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerReady(true);
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setDownloadState("idle");
      setProgress(0);
      setError(null);
      setEpubStatus(null);
      blobRef.current = null;
      sessionIdRef.current = null;
    }
  }, [open]);

  // Set up Service Worker message listener
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const { data } = event;

      // Check if this message is for our session
      if (!data.sessionId || data.sessionId !== sessionIdRef.current) {
        return;
      }

      switch (data.type) {
        case "epub-status":
          setEpubStatus(data.status);
          if (data.error) {
            setError(data.error);
          }
          break;

        case "download-starting":
          setDownloadState("downloading");
          setProgress(0);
          break;

        case "download-progress":
          setProgress(data.progress);
          break;

        case "download-complete":
          // Convert base64 back to blob
          fetch(data.data)
            .then((res) => res.blob())
            .then((blob) => {
              blobRef.current = blob;
              setDownloadState("completed");
              setProgress(100);
            });
          break;

        case "download-error":
          setError(data.error);
          setDownloadState("error");
          break;
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleStartDownload = useCallback(async () => {
    // Try to use Service Worker if available
    if (isServiceWorkerReady && navigator.serviceWorker.controller) {
      try {
        setDownloadState("generating");
        setError(null);
        setProgress(0);
        setEpubStatus(null);

        // Create a unique session ID for this download
        const sessionId = `epub-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 11)}`;
        sessionIdRef.current = sessionId;

        // Get GraphQL endpoint from environment
        const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || "https://api.jplaw2epub.ngs.io/graphql";

        // Send EPUB generation request to Service Worker
        navigator.serviceWorker.controller.postMessage({
          type: "generate-epub",
          epubId: epubId,
          clientId: sessionId,
          graphqlEndpoint: graphqlEndpoint,
        });
        return;
      } catch {
        // Fall through to use the fallback method
        console.warn("Service Worker download failed, using fallback");
      }
    }

    // Fallback to original implementation if Service Worker is not available
    try {
      setDownloadState("downloading");
      setError(null);
      setProgress(0);

      // Fetch the EPUB file with progress tracking
      const response = await fetch(downloadUrl);

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

      // Read the response stream with async updates
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // Update UI every 100ms

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setProgress(100);
          await new Promise((resolve) =>
            setTimeout(() => {
              requestAnimationFrame(resolve);
            }, 1000)
          );
          break;
        }

        chunks.push(value);
        received += value.length;

        if (total > 0) {
          const now = Date.now();
          // Update progress at intervals to avoid blocking UI
          if (now - lastUpdateTime > UPDATE_INTERVAL) {
            const progressValue = (received / total) * 100;
            setProgress(progressValue);
            lastUpdateTime = now;
            // Yield control to browser
            await new Promise((resolve) =>
              setTimeout(() => {
                requestAnimationFrame(resolve);
              }, 1)
            );
          }
        }
      }

      // Combine chunks into a single blob
      blobRef.current = new Blob(chunks as BlobPart[], {
        type: "application/epub+zip",
      });
      setDownloadState("completed");
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("ダウンロードがキャンセルされました");
        } else {
          setError(`ダウンロードエラー: ${err.message}`);
        }
      } else {
        setError("ダウンロード中にエラーが発生しました");
      }
      setDownloadState("error");
    }
  }, [downloadUrl, epubId, isServiceWorkerReady]);

  const handleSaveFile = useCallback(async () => {
    if (!blobRef.current) return;

    if (isFileSaveSupported) {
      try {
        // Use File System Access API
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "EPUB files",
              accept: { "application/epub+zip": [".epub"] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(blobRef.current);
        await writable.close();
      } catch (err) {
        // User cancelled the save dialog
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            return;
          }
        }
        setError("ファイルの保存に失敗しました");
      }
    } else {
      // Fallback to traditional download
      const url = URL.createObjectURL(blobRef.current);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
    }
  }, [fileName, isFileSaveSupported, onClose]);

  const handleCancel = useCallback(() => {
    setDownloadState("idle");
    setProgress(0);
    setError(null);
    setEpubStatus(null);
    blobRef.current = null;
    sessionIdRef.current = null;
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>EPUBダウンロード</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {lawTitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {downloadState === "generating" && (
          <Box sx={{ mt: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                EPUB生成中... {epubStatus && `(${epubStatus})`}
              </Typography>
            </Box>
            {epubStatus === "PROCESSING" && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                ファイルを生成しています。しばらくお待ちください...
              </Typography>
            )}
          </Box>
        )}

        {downloadState === "downloading" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ダウンロード中...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        {downloadState === "completed" && (
          <Alert severity="success" sx={{ mt: 3 }} icon={<CheckCircleIcon />}>
            ダウンロードが完了しました。
            <br />
            保存ボタンをクリックして保存先を選択してください。
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {downloadState === "idle" && (
          <>
            <Button onClick={handleCancel}>キャンセル</Button>
            <Button
              onClick={handleStartDownload}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              ダウンロード開始
            </Button>
          </>
        )}

        {(downloadState === "generating" || downloadState === "downloading") && (
          <Button onClick={handleCancel}>キャンセル</Button>
        )}

        {downloadState === "completed" && (
          <>
            <Button onClick={handleCancel}>完了</Button>
            <Button
              onClick={handleSaveFile}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              保存
            </Button>
          </>
        )}

        {downloadState === "error" && (
          <>
            <Button onClick={handleCancel}>閉じる</Button>
            <Button
              onClick={handleStartDownload}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              再試行
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
