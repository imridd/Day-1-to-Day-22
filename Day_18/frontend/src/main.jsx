
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "./app/store";
import App from "./App";
import { ThemeModeProvider } from "./app/ThemeProvider";

import "./styles/global.css";
import "./styles/animations.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </Provider>
  </React.StrictMode>
);
