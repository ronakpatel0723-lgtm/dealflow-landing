import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";

const Screener    = lazy(() => import("./Screener.jsx"));
const Methodology = lazy(() => import("./Methodology.jsx"));
const Company     = lazy(() => import("./Company.jsx"));
const Research    = lazy(() => import("./Research.jsx"));
const Monitor     = lazy(() => import("./Monitor.jsx"));
const ApiDocs     = lazy(() => import("./ApiDocs.jsx"));
const Alerts      = lazy(() => import("./Alerts.jsx"));
const Interrogate = lazy(() => import("./Interrogate.jsx"));

const Fallback = () => (
  <div style={{ background: "#04060D", minHeight: "100vh" }} />
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/research" element={<Research />} />
          <Route path="/company/:ticker" element={<Company />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/interrogate" element={<Interrogate />} />
          <Route path="/interrogate/:ticker" element={<Interrogate />} />
          {/* Any unknown path — including the retired /pricing and /demo — lands on the
              overview rather than a blank screen. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
