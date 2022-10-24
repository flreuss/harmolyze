import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

import "../styles/globals.css";

export default function HarmoLyzeApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>HarmoLyze</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
