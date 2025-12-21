import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mock data from hardcoded "Test User" in memory storage
const sampleUserId = 1;

// Handle GitHub Pages SPA routing redirect from 404.html
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath) {
  sessionStorage.removeItem('redirectPath');
  window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById("root")!).render(
  <App initialUserId={sampleUserId} />
);
