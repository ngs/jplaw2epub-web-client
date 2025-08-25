# Debugging Service Worker EPUB Download

This guide explains how to debug the Service Worker-based EPUB download functionality in the jplaw2epub-web-client application.

## Overview

The application uses Service Worker to handle EPUB downloads in the background, preventing UI freezing during large file downloads. When Service Worker is unavailable, it falls back to the main thread implementation.

## Architecture

### Components

1. **EpubDownloadDialog** (`src/components/download/EpubDownloadDialog.tsx`)
   - UI component that initiates downloads
   - Sends messages to Service Worker
   - Receives progress updates via message events

2. **Service Worker** (`src/sw/cache.ts`)
   - Handles download requests in background
   - Streams file data with progress tracking
   - Sends progress updates to the client

### Message Flow

```
EpubDownloadDialog -> postMessage -> Service Worker
                                          |
                                          v
                                    Fetch EPUB file
                                          |
                                          v
Service Worker -> postMessage -> EpubDownloadDialog
   (progress updates)
```

## Debugging Steps

### 1. Check Service Worker Registration

Open Chrome DevTools and navigate to **Application** > **Service Workers**:

- Verify the Service Worker is registered and active
- Check the status shows "Activated and is running"
- Note the Service Worker scope (should be `/`)

### 2. Monitor Message Passing

#### In the Console

Add debug logging to track message flow:

```javascript
// Check if Service Worker is available
console.log(
  "Service Worker available:",
  "serviceWorker" in navigator && navigator.serviceWorker.controller,
);

// Monitor outgoing messages (in EpubDownloadDialog)
console.log("Sending message to SW:", {
  type: "download-epub",
  url: downloadUrl,
  clientId: clientId,
});

// Monitor incoming messages (in EpubDownloadDialog)
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log("Received from SW:", event.data);
});
```

#### In Service Worker Console

Service Worker has its own console. To view it:

1. Go to **Application** > **Service Workers**
2. Click on the Service Worker name
3. Click "Inspect" to open Service Worker DevTools

Add logging in `src/sw/cache.ts`:

```typescript
self.addEventListener("message", async (event) => {
  console.log("SW received message:", event.data);
  // ... rest of handler
});

// In downloadEpub function
console.log(
  "Download progress:",
  progress,
  "Received:",
  received,
  "Total:",
  total,
);
```

### 3. Network Monitoring

In **Network** tab:

1. Filter by "Other" to see Service Worker fetch requests
2. Check if EPUB download requests are initiated
3. Verify response headers (especially `Content-Length` for progress tracking)

### 4. Common Issues and Solutions

#### Issue: Service Worker Not Receiving Messages

**Symptoms:**

- No console logs in Service Worker console
- Download doesn't start

**Debug steps:**

```javascript
// Check if controller exists
console.log("SW Controller:", navigator.serviceWorker.controller);

// Verify message is being sent
navigator.serviceWorker.controller?.postMessage({
  type: "download-epub",
  url: downloadUrl,
  clientId: clientId,
});
```

**Solutions:**

- Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
- Unregister and re-register Service Worker
- Check if running on HTTPS or localhost

#### Issue: Progress Not Updating

**Symptoms:**

- Download starts but progress bar doesn't move
- Progress stays at 0%

**Debug steps:**

```javascript
// In Service Worker, log progress calculations
const progress = (received / total) * 100;
console.log("Progress calculation:", {
  received,
  total,
  progress,
  hasTotal: total > 0,
});
```

**Solutions:**

- Verify server sends `Content-Length` header
- Check if progress messages are filtered by sessionId correctly
- Ensure UPDATE_INTERVAL is appropriate (default 100ms)

#### Issue: Download Completes but Save Fails

**Symptoms:**

- Progress reaches 100%
- Save dialog doesn't appear or fails

**Debug steps:**

```javascript
// Check blob conversion
console.log("Blob created:", blob.size, blob.type);

// Verify base64 conversion
fileReader.onloadend = () => {
  console.log("Base64 data length:", fileReader.result?.length);
};
```

**Solutions:**

- Check browser console for File System Access API errors
- Verify blob size matches expected file size
- Test fallback download mechanism

### 5. Testing Fallback Mechanism

To test the non-Service Worker fallback:

1. **Disable Service Worker:**

   ```javascript
   // Temporarily modify the check in EpubDownloadDialog
   const isServiceWorkerSupported = false; // Force fallback
   ```

2. **Unregister Service Worker:**
   - DevTools > Application > Service Workers
   - Click "Unregister"

3. **Test in Private/Incognito Mode:**
   - Service Workers may not be available in private browsing

### 6. Performance Monitoring

Monitor download performance:

```javascript
// In Service Worker
const startTime = Date.now();
// ... download logic ...
const endTime = Date.now();
console.log("Download completed in:", (endTime - startTime) / 1000, "seconds");
console.log(
  "Average speed:",
  ((received / (endTime - startTime)) * 1000) / 1024 / 1024,
  "MB/s",
);
```

### 7. Browser Compatibility Testing

Test across different browsers:

| Browser | Service Worker Support | File System Access API |
| ------- | ---------------------- | ---------------------- |
| Chrome  | ✅ Full                | ✅ Full                |
| Firefox | ✅ Full                | ❌ Not supported       |
| Safari  | ⚠️ Limited             | ❌ Not supported       |
| Edge    | ✅ Full                | ✅ Full                |

For unsupported browsers, verify fallback mechanisms work correctly.

### 8. Debugging Tools

#### Chrome Extensions

- **Service Worker Detector** - Shows which sites use Service Workers
- **Clear Cache** - Quickly clear Service Worker cache

#### Command Line

```bash
# Check if Service Worker is registered
chrome://serviceworker-internals/

# Force Service Worker update
chrome://settings/content/all
```

### 9. Logging Best Practices

For production debugging, use conditional logging:

```typescript
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Debug info:", data);
}
```

### 10. Troubleshooting Checklist

- [ ] Service Worker is registered and active
- [ ] HTTPS or localhost (Service Workers require secure context)
- [ ] Browser supports Service Workers
- [ ] `navigator.serviceWorker.controller` is not null
- [ ] Messages include correct sessionId
- [ ] Server sends Content-Length header
- [ ] No CORS issues with EPUB download URL
- [ ] Browser console shows no errors
- [ ] Service Worker console shows expected logs
- [ ] Network tab shows download requests
- [ ] File System Access API is available (for save functionality)

## Testing Different Scenarios

### Small File Download

Test with files < 1MB to verify basic functionality:

- Quick completion
- Progress may jump to 100%

### Large File Download

Test with files > 10MB to verify:

- Progress updates smoothly
- UI remains responsive
- Cancel functionality works

### Network Interruption

Simulate network issues:

1. Start download
2. Go offline (DevTools > Network > Offline)
3. Verify error handling
4. Go online and retry

### Multiple Downloads

Test concurrent downloads:

- Open multiple dialogs
- Verify sessionId prevents cross-talk
- Check memory usage

## Additional Resources

- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Chrome DevTools Service Worker Debugging](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
