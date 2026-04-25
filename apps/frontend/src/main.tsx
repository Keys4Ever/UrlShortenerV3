import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";

createRoot(document.getElementById("root")!).render(<App />);
