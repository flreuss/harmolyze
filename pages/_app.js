import React from "react";
import abc from "abcjs";
import { Box, Button, Heading, Grommet, Keyboard } from "grommet";
import { Home } from "grommet-icons";
import Link from "next/link";
import { useRouter } from "next/router";

import "../styles/globals.css";

import tuneBookString from "../lib/tuneBookString";

const theme = {
  global: {
    colors: {
      brand: "#228BE6",
    },
    font: {
      family: "Helvetica",
      size: "18px",
      height: "20px",
    },
  },
};

const AppBar = (props) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: "1" }}
    {...props}
  />
);

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const tuneBook = new abc.TuneBook(tuneBookString);
  // const navItems = NavItems.fromTuneBook(tuneBook);

  return (
    <Grommet theme={theme} full>
      <Keyboard target="document" onEsc={() => router.push(`/`)}>
        <AppBar>
          <Link href="/" passHref>
            <Button icon={<Home />} onClick={() => {}} />
          </Link>
          <Heading level="3" margin="none">
            Riemann App
          </Heading>
        </AppBar>
        <Component {...pageProps} tuneBook={tuneBook} />
      </Keyboard>
    </Grommet>
  );
}

export default MyApp;
