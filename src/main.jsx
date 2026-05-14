import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./App";
import AdminPanel from "./AdminPanel";
import Leaderboard from "./Leaderboard";
import Regler from "./Regler";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<App />}
        />

        <Route
          path="/admin"
          element={<AdminPanel />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="/regler"
          element={<Regler />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);