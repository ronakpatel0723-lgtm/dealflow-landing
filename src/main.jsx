import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";

const Screener    = lazy(() => import("./Screener.jsx"));
const Methodology = lazy(() => import("./Methodology.jsx"));
const Company     = lazy(() => import("./Company.jsx"));
const Pricing     = lazy(() => import("./Pricing.jsx"));
const Research    = lazy(() => import("./Research.jsx"));
const Monitor     = lazy(() => import("./Monitor.jsx"));
const ApiDocs     = lazy(() => import("./ApiDocs.jsx"));
const Demo        = lazy(() => import("./Demo.jsx"));

const Fallback = () => (
  <div style={{ background: "#04060D", minHeight: "100vh" }} />
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/research" element={<Research />} />
            <Route path="/company/:ticker" element={<Company />} />
            <Route path="/monitor" element={<Monitor />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/demo" element={<Demo />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
