import React from 'react'
import { hydrateRoot, createRoot } from "react-dom/client";
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from "./App.tsx";
import "./index.css";

injectSpeedInsights();

const rootElement = document.getElementById("root")!

// Check if the page was pre-rendered by react-snap
const isPrerendered = rootElement.hasChildNodes()

if (isPrerendered) {
  // Hydrate pre-rendered content
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  // Normal client-side render for development
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
