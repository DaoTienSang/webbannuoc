import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import AdminApp from "./AdminApp.tsx";
import "./index.css";

// Sử dụng URL trực tiếp thay vì biến môi trường
const convex = new ConvexReactClient("https://posh-anaconda-144.convex.cloud");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <AdminApp />
    </ConvexAuthProvider>
  </React.StrictMode>,
);
