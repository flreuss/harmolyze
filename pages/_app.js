import React, { useEffect } from "react";
import { Provider } from "next-auth/client";
import Head from "next/head";

import "../styles/globals.css";

export default function RiemannApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Head>
        <title>Riemann App</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
