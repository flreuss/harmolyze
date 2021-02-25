import React from "react";
import abc from "abcjs";
import {
  Box,
  Button,
  Heading,
  Grommet,
  Keyboard,
  Header,
  Main,
  Nav,
  Avatar,
  Anchor
} from "grommet";
import { Home } from "grommet-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { grommet } from "grommet/themes";

import "../styles/globals.css";

import tuneBookString from "../lib/tuneBookString";
import RiemannFunc from "../lib/RiemannFunc";

const gravatarSrc =
  "//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const tuneBook = new abc.TuneBook(tuneBookString);
  // const navItems = NavItems.fromTuneBook(tuneBook);

  return (
    <Grommet theme={grommet}>
      <Keyboard target="document" onEsc={() => router.push(`/`)}>
        <Header background="brand" pad="small">
          <Nav gap="small" direction="row">
            <Link href="/" passHref>
              <Button
                size="small"
                hoverIndicator
                icon={<Home />}
                onClick={() => {}}
              />
            </Link>
          </Nav>
          <Box direction="row" align="center" gap="small">
            <Avatar src={gravatarSrc} />

            <Anchor color="white" href="https://github.com/ShimiSun">
              Florian Reuß
            </Anchor>
          </Box>
        </Header>
        <Main pad="small">
          <Component {...pageProps} tuneBook={tuneBook} />
        </Main>
      </Keyboard>
    </Grommet>
  );
}

export default MyApp;
