import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import '@primer/primitives/dist/css/functional/themes/light.css'
import { BaseStyles, ThemeProvider } from '@primer/react'
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BaseStyles>
        <App />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
);
