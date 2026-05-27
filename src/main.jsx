import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Screener from "./Screener.jsx";
import Methodology from "./Methodology.jsx";
import Company from "./Company.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/company/:ticker" element={<Company />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
