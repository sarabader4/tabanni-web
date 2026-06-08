import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import "./i18n";
import { setBaseUrl } from "@workspace/api-client-react";

const apiUrl = "https://web-production-7fb7f.up.railway.app";
console.log("Setting base URL to:", apiUrl);
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);