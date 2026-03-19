import ReactDOM from "react-dom/client";

import { SnackbarProvider } from "notistack";
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import "./index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import AuthContextProvider from "./context/auth-context/auth-context.tsx";
import CatalogProvider from "./context/catalog-provider/catalog-provider.tsx";
import GlobalThemeProvider from "./context/global-theme-provider/global-theme-provider.tsx";
import { initializeDatadog } from "./helpers/datadog-helpers.ts";
import AppRouter from "./router/app-router.tsx";
import { persistor, store } from "./store/index.ts";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

initializeDatadog();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalThemeProvider>
        <SnackbarProvider>
          <PersistGate loading={null} persistor={persistor}>
            <AuthContextProvider>
              <CatalogProvider>
                <HelmetProvider>
                  <AppRouter />
                </HelmetProvider>
              </CatalogProvider>
            </AuthContextProvider>
          </PersistGate>
        </SnackbarProvider>
      </GlobalThemeProvider>
    </Provider>
  </React.StrictMode>,
);
