import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import 'boxicons/css/boxicons.min.css';

// Sử dụng URL trực tiếp thay vì biến môi trường
const convex = new ConvexReactClient("https://posh-anaconda-144.convex.cloud");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
