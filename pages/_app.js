import React, { useEffect } from "react";
import { Provider } from "next-auth/client";

import "../styles/globals.css";

export default function RiemannApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
}
