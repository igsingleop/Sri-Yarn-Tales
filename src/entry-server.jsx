import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppContent } from "./App";

export function render(url, helmetContext = {}) {
  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[url]}>
        <AppContent />
      </MemoryRouter>
    </HelmetProvider>
  );
  return { html, helmet: helmetContext.helmet };
}
