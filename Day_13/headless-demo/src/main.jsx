
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";
import "./styles/theme.css";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import { store } from "./app/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider>
    <App />
    <ToastContainer
      position="top-right"
    />
  </ThemeProvider>
  </Provider >
);