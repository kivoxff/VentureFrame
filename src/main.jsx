import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { TimeProvider } from "./context/TimeContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <TimeProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" />
          <App />
        </BrowserRouter>
      </TimeProvider>
    </AuthProvider>
  </Provider>,
);
