import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set correct HTML lang attribute for German 
document.documentElement.lang = "de";

// Set page title
document.title = "Lager App";

createRoot(document.getElementById("root")!).render(<App />);
