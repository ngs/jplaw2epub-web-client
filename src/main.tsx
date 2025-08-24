import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        // eslint-disable-next-line no-console
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope,
        );
      },
      (err) => {
        console.error("ServiceWorker registration failed: ", err);
      },
    );
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
