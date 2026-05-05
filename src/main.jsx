import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import AppProvider from "./context/Context.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { LightboxProvider } from "./context/LightBoxContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <NotificationProvider>
            <LightboxProvider>   {/* ← add here, inside everything */}
              <App />
            </LightboxProvider>
          </NotificationProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);