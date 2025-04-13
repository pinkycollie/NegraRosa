import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mock data from hardcoded "Test User" in memory storage
const sampleUserId = 1;

createRoot(document.getElementById("root")!).render(
  <App initialUserId={sampleUserId} />
);
