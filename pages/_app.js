import React, { useEffect } from "react";
import { Provider } from "next-auth/client";
import Head from "next/head";

import "../styles/globals.css";

export default function HarmoLyzeApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Head>
        <title>HarmoLyze</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
