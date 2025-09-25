import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Payment from "./Payment.jsx";
import DIDLogin from "./DIDLogin.jsx";
import DIDGenerate from "./DIDGenerate.jsx";
import DIDAuth from "./DIDAuth.jsx";

const router = createBrowserRouter([
  {
    path: "/did",
    children: [
      { path: "login", element: <DIDLogin /> },
      { path: "generate", element: <DIDGenerate /> },
    ],
  },
  {
    path: "/",
    element: <DIDAuth />,
    children: [
      { path: "/", element: <App /> },
      { path: "/payment", element: <Payment /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
